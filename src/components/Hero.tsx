import { useEffect, useRef, useState } from 'react';
import JetCanvas from './JetCanvas';
import type { Gas } from '../lib/jet';
import { PROFILE } from '../data';
import { heatOf, machJ } from '../lib/jet';
import HeroCursor from './HeroCursor';

export default function Hero() {
  const [npr, setNpr] = useState(5.4);
  const [gas, setGas] = useState<Gas>('n2');
  const [disk, setDisk] = useState(true);
  const wrap = useRef<HTMLElement>(null);
  const heat = heatOf(npr);

  // Drive a site-wide --heat so the atmosphere and headline warm up with thrust.
  useEffect(() => { document.documentElement.style.setProperty('--heat', heat.toFixed(3)); }, [heat]);

  // Pointer x sweeps the nozzle pressure ratio: the hero is an instrument, not a picture.
  useEffect(() => {
    const el = wrap.current!;
    const on = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      setNpr(Number((2.6 + f * 5.4).toFixed(1)));
    };
    el.addEventListener('pointermove', on);
    return () => el.removeEventListener('pointermove', on);
  }, []);

  return (
    <section className="hero" id="top" ref={wrap}>
      <div className="hero-plot" aria-hidden="false">
        <JetCanvas
          className="hero-canvas"
          npr={npr}
          gas={gas}
          r0={(w, h) => (w < 760 ? Math.min(w * 0.09, 44) : Math.max(40, Math.min(h * 0.075, w * 0.05)))}
          nozzleMm={(w) => (w < 640 ? 4.4 : 6.6)}
          cy={(w, h) => h * (w < 760 ? 0.5 : 0.79)}
          density={1.5}
          onReadout={(r) => setDisk(r.disk)}
          ariaLabel="Live illustration of shock diamonds in an underexpanded supersonic jet, the subject of Salma's thesis"
        />
        <div className="axis-x" aria-hidden="true">
          {Array.from({ length: 15 }, (_, i) => <span key={i}>{i * 2}</span>)}
          <em>x / D</em>
        </div>
        <div className="axis-y" aria-hidden="true"><em>y / D</em></div>
      </div>

      <div className="hero-copy wrap">
        <p className="eyebrow"><span className="dot" />Available from early 2027 · {PROFILE.location} · open to relocation</p>
        <h1>
          <span className="h1-name">Salma Aaroud</span>
          <span className="h1-role">Aeronautical engineer who makes <em>supersonic flow</em> visible, and proves it&nbsp;right.</span>
        </h1>
        <p className="lead">
          CFD of compressible and non-ideal flows, aerodynamics validated against the wind tunnel, and airworthiness on real aircraft.
          MSc, Politecnico di Milano.
        </p>
        <div className="cta-row">
          <a className="btn primary" href="#thesis">Explore the thesis <Arrow /></a>
          <a className="btn ghost" href="#projects">See the projects</a>
        </div>
      </div>

      <HeroCursor host={wrap} />

      <div className="hud" aria-live="polite">
        <div className="hud-row"><span className="hud-k">FIG. 0</span><span>Underexpanded jet · live</span></div>
        <div className="hud-row"><span className="hud-k">NPR</span><b>{npr.toFixed(1)}</b></div>
        <div className="hud-row"><span className="hud-k">M<sub>j</sub></span><b>{gas === 'mm' ? 'non-ideal' : machJ(npr).toFixed(2)}</b></div>
        <div className="hud-row thrust">
          <span className="hud-k">THRUST</span>
          <span className="meter" aria-hidden="true"><i style={{ width: `${8 + heat * 92}%` }} /></span>
          <b>×{(npr / 2.6).toFixed(1)}</b>
        </div>
        <div className="hud-row"><span className="hud-k">GAS</span>
          <div className="seg sm" role="group" aria-label="Working gas">
            <button type="button" aria-pressed={gas === 'n2'} onClick={() => setGas('n2')}>N₂ ideal</button>
            <button type="button" aria-pressed={gas === 'mm'} onClick={() => setGas('mm')}>MM non-ideal</button>
          </div>
        </div>
        <div className="hud-row"><span className="hud-k">MACH DISK</span><b className={disk ? 'hot' : ''}>{disk ? (gas === 'mm' ? 'formed · ⌀ ×1.75' : 'formed') : 'none'}</b></div>
        <label className="hud-slider">
          <span className="sr">Nozzle pressure ratio</span>
          <input type="range" min={2.6} max={8} step={0.1} value={npr} onChange={(e) => setNpr(+e.target.value)} />
        </label>
        <p className="hud-hint">Move across the jet, or drag, to change the pressure ratio. Thrust is relative to NPR 2.6 (fixed throat, ideal).</p>
      </div>

    </section>
  );
}

export function Arrow() {
  return <svg className="arr" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
