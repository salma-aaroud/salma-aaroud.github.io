import { useEffect, useRef, useState } from 'react';
import JetCanvas from './JetCanvas';
import type { Gas } from '../lib/jet';
import { THESIS } from '../data';
import { useReveal } from '../lib/hooks';
import { Arrow } from './Hero';

export default function Thesis() {
  const [step, setStep] = useState(0);
  const [npr, setNpr] = useState(THESIS.steps[0].npr);
  const [gas, setGas] = useState<Gas>(THESIS.steps[0].gas);
  const [cells, setCells] = useState(3);
  const [disk, setDisk] = useState(false);
  const [mj, setMj] = useState(1.4);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const [headRef, headIn] = useReveal<HTMLDivElement>();
  const [figRef, figIn] = useReveal<HTMLElement>();

  // The step in the middle of the viewport drives the plot.
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) {
          const i = Number((e.target as HTMLElement).dataset.i);
          setStep(i); setNpr(THESIS.steps[i].npr); setGas(THESIS.steps[i].gas);
        }
      }),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="thesis" className="thesis">
      <div className="wrap">
        <div ref={headRef} className={`sec-head reveal${headIn ? ' in' : ''}`}>
          <p className="kicker">MSc thesis · Politecnico di Milano · 2026</p>
          <h2>{THESIS.short}</h2>
          <p className="thesis-title">“{THESIS.title}”</p>
        </div>

        <div className="story">
          <div className="story-steps">
            {THESIS.steps.map((s, i) => (
              <article
                key={s.k}
                data-i={i}
                ref={(el) => { stepRefs.current[i] = el; }}
                className={`step${step === i ? ' on' : ''}`}
              >
                <span className="step-k">{s.k}</span>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </article>
            ))}
          </div>

          <div className="story-plot">
            <figure className="plot">
              <div className="plot-head">
                <span>Fig. 1 · shock-cell structure</span>
                <span className="mono">{gas === 'mm' ? 'siloxane MM · Peng–Robinson' : 'N₂ · ideal gas'}</span>
              </div>
              <JetCanvas
                className="plot-canvas"
                npr={npr}
                gas={gas}
                labels
                r0={(_, h) => h * 0.17}
                nozzleMm={(w) => (w < 480 ? 4.2 : 5.6)}
                onReadout={(r) => { setCells(r.cells); setDisk(r.disk); setMj(r.mj); }}
                ariaLabel="Illustration of the shock cells studied in the thesis"
              />
              <div className="plot-ctrl">
                <label>
                  <span>Nozzle pressure ratio <b className="mono">{npr.toFixed(1)}</b></span>
                  <input type="range" min={2} max={9} step={0.1} value={npr} onChange={(e) => setNpr(+e.target.value)} />
                </label>
                <div className="seg" role="group" aria-label="Gas">
                  <button type="button" aria-pressed={gas === 'n2'} onClick={() => setGas('n2')}>N₂</button>
                  <button type="button" aria-pressed={gas === 'mm'} onClick={() => setGas('mm')}>MM</button>
                </div>
              </div>
              <div className="plot-read mono">
                <span>M<sub>j</sub> <b>{gas === 'mm' ? 'non-ideal' : mj.toFixed(2)}</b></span>
                <span>shock cells <b>{cells}</b></span>
                <span>Mach disk <b className={disk ? 'hot' : ''}>{disk ? (gas === 'mm' ? '⌀ ×1.75' : 'yes') : 'none'}</b></span>
                <span className="legend"><i className="l-shock" />shock <i className="l-exp" />expansion <i className="l-bnd" />jet boundary</span>
              </div>
              <figcaption>An illustration, not a simulation: raise the pressure ratio and a Mach disk appears; switch to MM, a non-ideal organic vapour, and it grows.</figcaption>
            </figure>
          </div>
        </div>

        <figure ref={figRef} className={`realfig reveal${figIn ? ' in' : ''}`}>
          <div className="realfig-img">
            <img src="/img/jet_round.webp" width={1400} height={499} loading="lazy"
              alt="Mach number field and numerical schlieren of a round siloxane MM jet at two levels of non-ideality" />
          </div>
          <figcaption><b>Fig. 2</b> From the thesis. Round jet of siloxane MM: Mach number (left) and numerical schlieren (right) at two levels of non-ideality, SU2 RANS. This plot is the colour palette of this website.</figcaption>
        </figure>

        <div className="tnums">
          {THESIS.numbers.map(([v, l]) => (
            <div key={v} className="tnum"><b>{v}</b><span>{l}</span></div>
          ))}
        </div>

        <a className="thesis-cta" href="#contact" data-reason="thesis">
          <span>Want the full thesis, the data, or a 20-minute walkthrough?</span>
          <span className="go">Ask me <Arrow /></span>
        </a>
      </div>
    </section>
  );
}
