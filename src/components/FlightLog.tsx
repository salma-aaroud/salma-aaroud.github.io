import { useEffect, useRef, useState } from 'react';
import { JOURNEY } from '../data';
import { useReducedMotion, useReveal } from '../lib/hooks';

// Equirectangular projection onto a 600×280 nav display.
const P = (lat: number, lon: number): [number, number] => [((lon + 25) / 160) * 600, ((62 - lat) / 62) * 280];
const PTS: Record<string, [number, number]> = { CMN: P(33.57, -7.59), NKG: P(32.06, 118.8), MIL: P(45.46, 9.19) };
const arc = (a: [number, number], b: [number, number], lift: number) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return `M${a[0]},${a[1]} Q${mx},${my - d * lift} ${b[0]},${b[1]}`;
};
const LEGS = [arc(PTS.CMN, PTS.NKG, 0.22), arc(PTS.NKG, PTS.CMN, -0.12), arc(PTS.CMN, PTS.MIL, 0.4)];
const KM = [10855, 21710, 23657, 23657];

export default function FlightLog() {
  const [stage, setStage] = useState(0);
  const [km, setKm] = useState(0);
  const reduced = useReducedMotion();
  const refs = useRef<(HTMLElement | null)[]>([]);
  const kmRef = useRef(0);
  const [headRef, headIn] = useReveal<HTMLDivElement>();

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setStage(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: '-40% 0px -50% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const from = kmRef.current, to = KM[stage], t0 = performance.now(), dur = reduced ? 0 : 900;
    let raf = 0;
    const step = (t: number) => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1;
      kmRef.current = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      setKm(kmRef.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [stage, reduced]);

  return (
    <section id="log" className="log">
      <div className="wrap">
        <div ref={headRef} className={`sec-head reveal${headIn ? ' in' : ''}`}>
          <p className="kicker">Flight log</p>
          <h2>Three countries, one direction.</h2>
          <p className="sub">Trained in Chinese, English and Italian, tested on real aircraft in between.</p>
        </div>
        <div className="log-grid">
          <div className="nd-wrap">
            <div className="nd">
              <div className="nd-top mono"><span>ROUTE · ND</span><span>{km.toLocaleString('en-US')} km flown</span></div>
              <svg viewBox="0 0 600 280" role="img" aria-label="Route: Casablanca to Nanjing, back to Casablanca, then Milan">
                <g className="grat">
                  {Array.from({ length: 9 }, (_, i) => <line key={'v' + i} x1={i * 75} y1="0" x2={i * 75} y2="280" />)}
                  {Array.from({ length: 5 }, (_, i) => <line key={'h' + i} x1="0" y1={i * 70} x2="600" y2={i * 70} />)}
                </g>
                <g className="rings">
                  {[90, 180, 270].map((r) => <circle key={r} cx="300" cy="330" r={r} />)}
                  {Array.from({ length: 37 }, (_, i) => {
                    const a = Math.PI + (i * Math.PI) / 36, r = 270;
                    const x1 = 300 + Math.cos(a) * r, y1 = 330 + Math.sin(a) * r;
                    const k = i % 3 === 0 ? 10 : 5;
                    return <line key={i} x1={x1} y1={y1} x2={300 + Math.cos(a) * (r - k)} y2={330 + Math.sin(a) * (r - k)} />;
                  })}
                </g>
                {LEGS.map((d, i) => (
                  <path key={i} d={d} pathLength={1} className={`leg${i <= Math.min(stage, 2) ? ' on' : ''}${i === 1 ? ' dash' : ''}`} />
                ))}
                {stage === 3 && (
                  <g className="next">
                    {[[-60, -40], [-20, -70], [40, -60], [-80, 10]].map(([dx, dy], i) => (
                      <path key={i} d={arc(PTS.MIL, [PTS.MIL[0] + dx, PTS.MIL[1] + dy], 0.3)} />
                    ))}
                  </g>
                )}
                {Object.entries(PTS).map(([k, [x, y]]) => (
                  <g key={k} className={`apt${(k === 'NKG' && stage === 0) || (k === 'CMN' && stage === 1) || (k === 'MIL' && stage >= 2) ? ' cur' : ''}`}>
                    <circle cx={x} cy={y} r="9" className="ring" />
                    <circle cx={x} cy={y} r="3.5" />
                    <text x={x + (k === 'CMN' ? -36 : 10)} y={y + (k === 'MIL' ? -8 : 16)}>{k}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
          <ol className="legs">
            {JOURNEY.map((j, i) => (
              <li key={j.code} data-i={i} ref={(el) => { refs.current[i] = el; }} className={stage === i ? 'on' : ''}>
                <div className="leg-when mono"><b>{j.code}</b> {j.when} · {j.place}</div>
                <h3>{j.title}</h3>
                <p>{j.text}</p>
                <ul className="wins">{j.wins.map((w) => <li key={w}>{w}</li>)}</ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
