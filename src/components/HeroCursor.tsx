import { useEffect, useRef, type RefObject } from 'react';
import { useReducedMotion } from '../lib/hooks';

// Reference "speed of sound" for the cursor, in px/s. A brisk flick goes supersonic.
const A_REF = 1100;
const UI = 'a, button, input, select, textarea, label, .hud, .legend-fx';

/**
 * Hero cursor: a HUD reticle that is also a flow probe. It reads its own Mach number,
 * trails a Mach cone of half-angle μ = asin(1/M) when it goes supersonic, and a click
 * sends out a pressure pulse. Mouse-only; touch and pen keep the native behaviour.
 */
export default function HeroCursor({ host }: { host: RefObject<HTMLElement | null> }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const retRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = host.current, cv = cvRef.current, ret = retRef.current, tag = tagRef.current;
    if (!el || !cv || !ret || !tag) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    if (!fine.matches) return;
    el.classList.add('fx-cursor');
    const ctx = cv.getContext('2d')!;

    let W = 0, H = 0;
    const fit = () => {
      const r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * d); cv.height = Math.round(H * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);

    let accent = '#fff', ink = '#fff';
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      accent = cs.getPropertyValue('--accent').trim() || accent;
      ink = cs.getPropertyValue('--ink').trim() || ink;
    };
    readColors();

    const s = { tx: 0, ty: 0, x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, speed: 0, inside: false, ui: false, seen: false };
    const pulses: { x: number; y: number; t0: number }[] = [];
    const trail: { x: number; y: number; t: number }[] = [];
    let raf = 0, last = -1, lastTag = '', lastColor = 0;

    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      [s.tx, s.ty] = local(e);
      if (!s.seen) { s.x = s.px = s.tx; s.y = s.py = s.ty; s.seen = true; }
      s.ui = !!(e.target as Element).closest?.(UI);
      if (!s.inside) { s.inside = true; start(); }
    };
    const onLeave = () => { s.inside = false; };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || s.ui || reduced) return;
      const [x, y] = local(e);
      pulses.push({ x, y, t0: performance.now() / 1000 });
    };

    const frame = (now: number) => {
      const t = now / 1000;
      const dt = last < 0 ? 0.016 : Math.min(0.05, t - last);
      last = t;
      if (t - lastColor > 0.3) { readColors(); lastColor = t; }

      // follow + velocity (time-based, so it behaves the same at any frame rate)
      const k = reduced ? 1 : 1 - Math.exp(-dt * 28);
      s.x += (s.tx - s.x) * k; s.y += (s.ty - s.y) * k;
      const ivx = (s.tx - s.px) / dt, ivy = (s.ty - s.py) / dt;
      s.px = s.tx; s.py = s.ty;
      const kv = 1 - Math.exp(-dt * 9);
      s.vx += (ivx - s.vx) * kv; s.vy += (ivy - s.vy) * kv;
      s.speed = Math.hypot(s.vx, s.vy);
      const M = s.speed / A_REF;

      ret.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      ret.dataset.state = !s.inside ? 'out' : s.ui ? 'lock' : M > 1 ? 'sup' : 'idle';

      const label = M > 1
        ? `M ${M.toFixed(2)} · μ ${Math.round((Math.asin(1 / M) * 180) / Math.PI)}°`
        : `M ${M.toFixed(2)}`;
      if (label !== lastTag) { tag.textContent = label; lastTag = label; }

      // canvas effects
      ctx.clearRect(0, 0, W, H);
      if (!reduced && s.inside) {
        trail.push({ x: s.x, y: s.y, t });
        while (trail.length && t - trail[0].t > 0.35) trail.shift();
        if (trail.length > 2) {
          ctx.lineCap = 'round';
          for (let i = 1; i < trail.length; i++) {
            const a = trail[i - 1], b = trail[i], age = (t - b.t) / 0.35;
            ctx.strokeStyle = accent; ctx.globalAlpha = (1 - age) * 0.45 * Math.min(1, M * 1.4);
            ctx.lineWidth = 2 * (1 - age);
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        if (M > 1 && !s.ui) {
          // Mach cone: two oblique waves trailing the "aircraft", half-angle μ = asin(1/M)
          const mu = Math.asin(1 / M), back = Math.atan2(-s.vy, -s.vx);
          const len = Math.min(260, 70 + 90 * (M - 1));
          const strength = Math.min(1, (M - 1) * 2.2);
          for (const [sg, alpha] of [[1, 0.9], [-1, 0.9]] as const) {
            const g = ctx.createLinearGradient(s.x, s.y, s.x + Math.cos(back + sg * mu) * len, s.y + Math.sin(back + sg * mu) * len);
            g.addColorStop(0, accent); g.addColorStop(1, 'transparent');
            ctx.strokeStyle = g; ctx.globalAlpha = alpha * strength; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + Math.cos(back + sg * mu) * len, s.y + Math.sin(back + sg * mu) * len); ctx.stroke();
            // weaker trailing wave just inside the cone
            ctx.globalAlpha = alpha * strength * 0.35; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(s.x - Math.cos(back) * -8, s.y - Math.sin(back) * -8);
            ctx.lineTo(s.x + Math.cos(back + sg * mu * 0.8) * len * 0.7, s.y + Math.sin(back + sg * mu * 0.8) * len * 0.7); ctx.stroke();
          }
          // faint fill between the waves
          ctx.globalAlpha = 0.07 * strength; ctx.fillStyle = accent;
          ctx.beginPath(); ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + Math.cos(back + mu) * len, s.y + Math.sin(back + mu) * len);
          ctx.lineTo(s.x + Math.cos(back - mu) * len, s.y + Math.sin(back - mu) * len);
          ctx.closePath(); ctx.fill();
        }
      }
      // pressure pulses from clicks
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], age = t - p.t0;
        if (age > 0.9) { pulses.splice(i, 1); continue; }
        const r = 8 + age * 520, f = 1 - age / 0.9;
        ctx.globalAlpha = f * 0.8; ctx.strokeStyle = accent; ctx.lineWidth = 2 * f + 0.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = f * 0.35; ctx.strokeStyle = ink; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.72, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const busy = s.inside || pulses.length || trail.length || Math.abs(s.tx - s.x) > 0.3;
      if (busy) raf = requestAnimationFrame(frame);
      else { raf = 0; last = -1; }
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.classList.remove('fx-cursor');
    };
  }, [host, reduced]);

  return (
    <div className="cursor-layer" aria-hidden="true">
      <canvas ref={cvRef} className="cursor-fx" />
      <div ref={retRef} className="reticle" data-state="out">
        <svg viewBox="-20 -20 40 40">
          <circle className="ret-ring" r="11" />
          <path className="ret-ticks" d="M0 -18V-13M0 13V18M-18 0H-13M13 0H18" />
          <path className="ret-lock" d="M-16 -9V-16H-9M9 -16H16V-9M16 9V16H9M-9 16H-16V9" />
          <circle className="ret-dot" r="1.8" />
        </svg>
        <span ref={tagRef} className="probe-tag">M 0.00</span>
      </div>
    </div>
  );
}
