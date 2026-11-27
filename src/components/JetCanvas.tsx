import { useEffect, useRef } from 'react';
import { drawJet, TracerField, type Gas, type JetReadout, type JetTheme } from '../lib/jet';

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (v: number[]) => '#' + v.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
/** Eases each hex colour of the jet theme toward the target, so colormap changes cross-fade. */
function easeTheme(from: JetTheme | null, to: JetTheme, k: number): JetTheme {
  if (!from) return { ...to };
  const out = { ...to } as Record<string, unknown>;
  for (const key of Object.keys(to) as (keyof JetTheme)[]) {
    const a = from[key], b = to[key];
    if (typeof a !== 'string' || typeof b !== 'string') continue;
    if (a.startsWith('#') && b.startsWith('#')) {
      const ca = hex(a), cb = hex(b);
      out[key] = toHex(ca.map((x, i) => x + (cb[i] - x) * k));
    }
  }
  return out as JetTheme;
}
import { useReducedMotion } from '../lib/hooks';
import { useCmap } from '../lib/theme';

type Props = {
  npr: number;
  gas: Gas;
  className?: string;
  /** jet radius at the exit, as a function of canvas size */
  r0?: (w: number, h: number) => number;
  nozzleMm?: (w: number) => number;
  cy?: (w: number, h: number) => number;
  labels?: boolean;
  /** tracer density multiplier */
  density?: number;
  onReadout?: (r: JetReadout) => void;
  ariaLabel: string;
};

/** Canvas that eases toward the target NPR/gas and pauses when offscreen. */
export default function JetCanvas({ npr, gas, className, r0, nozzleMm, cy, labels, density = 1, onReadout, ariaLabel }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const target = useRef({ npr, gas });
  target.current = { npr, gas };
  const cb = useRef(onReadout);
  cb.current = onReadout;
  const r0Ref = useRef(r0); r0Ref.current = r0;
  const nzRef = useRef(nozzleMm); nzRef.current = nozzleMm;
  const cyRef = useRef(cy); cyRef.current = cy;
  const cmap = useCmap();
  const themeRef = useRef(cmap.jet); themeRef.current = cmap.jet;
  const shown = useRef<JetTheme | null>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    let raf = 0, visible = true, cur = target.current.npr, mix = target.current.gas === 'mm' ? 1 : 0;
    let size = { w: 0, h: 0 };
    let last = '';
    const tracers = new TracerField();
    const t0 = performance.now();

    const fit = () => {
      const r = cv.getBoundingClientRect();
      const d = Math.min(window.devicePixelRatio || 1, 2);
      size = { w: r.width, h: r.height };
      cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };

    let lastT = -1;
    const frame = (t: number) => {
      const tg = target.current;
      // time-based easing: converges at the same speed whatever the frame rate
      const dt = lastT < 0 ? 0.016 : Math.min(0.5, (t - lastT) / 1000);
      lastT = t;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 4);
      const kc = reduced ? 1 : 1 - Math.exp(-dt * 5);
      cur += (tg.npr - cur) * k;
      mix += ((tg.gas === 'mm' ? 1 : 0) - mix) * k;
      const { w, h } = size;
      const out = drawJet(ctx, {
        W: w, H: h, npr: cur, gas: mix > 0.5 ? 'mm' : 'n2', time: (t - t0) / 1000, animate: !reduced,
        r0: r0Ref.current?.(w, h), nozzleMm: nzRef.current?.(w), cy: cyRef.current?.(w, h), labels, density, tracers, theme: (shown.current = easeTheme(shown.current, themeRef.current, kc)),
      });
      const key = `${out.cells}|${out.disk}|${out.diskRatio}|${out.mj.toFixed(2)}`;
      if (key !== last) { last = key; cb.current?.(out); }
      if (visible && (!reduced || Math.abs(tg.npr - cur) > 0.001)) raf = requestAnimationFrame(frame);
    };

    const kick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    fit(); kick();
    const ro = new ResizeObserver(() => { fit(); kick(); });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(cv);
    (cv as HTMLCanvasElement & { __kick?: () => void }).__kick = kick;
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [reduced, labels, density]);

  // Redraw when props change in reduced-motion mode (the loop is idle then).
  useEffect(() => {
    (ref.current as (HTMLCanvasElement & { __kick?: () => void }) | null)?.__kick?.();
  }, [npr, gas, cmap]);

  return <canvas ref={ref} className={className} role="img" aria-label={ariaLabel} />;
}
