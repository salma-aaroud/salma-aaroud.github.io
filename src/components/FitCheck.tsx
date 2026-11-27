import { useMemo, useState } from 'react';
import { FIT_EXAMPLE, GAPS, HAVE } from '../data';
import { useReveal } from '../lib/hooks';

export default function FitCheck() {
  const [jd, setJd] = useState('');
  const [run, setRun] = useState('');
  const [ref, shown] = useReveal<HTMLDivElement>();

  const res = useMemo(() => {
    const have = HAVE.filter(([re]) => re.test(run)).map(([, n, w]) => [n, w] as const);
    const gaps = GAPS.filter(([re]) => re.test(run)).map(([, n]) => n);
    const tot = have.length + gaps.length;
    return { have, gaps, pct: tot ? Math.round((100 * have.length) / tot) : null };
  }, [run]);

  const C = 2 * Math.PI * 32;

  return (
    <section id="fit" className="fit">
      <div className="wrap">
        <div ref={ref} className={`sec-head reveal${shown ? ' in' : ''}`}>
          <p className="kicker">For hiring managers</p>
          <h2>Paste your job ad. See the match, and the gaps.</h2>
          <p className="sub">Runs entirely in your browser; nothing is sent anywhere. It shows what I have not done yet, too.</p>
        </div>
        <div className="fit-grid">
          <div className="fit-in">
            <label htmlFor="jd" className="mono lbl">Job description</label>
            <textarea id="jd" value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here…" />
            <div className="row">
              <button type="button" className="btn primary" onClick={() => setRun(jd)} disabled={!jd.trim()}>Check fit</button>
              <button type="button" className="btn ghost" onClick={() => { setJd(FIT_EXAMPLE); setRun(FIT_EXAMPLE); }}>Try a sample CFD role</button>
            </div>
          </div>
          <div className="fit-out" aria-live="polite">
            <div className="score">
              <svg viewBox="0 0 80 80" className="ring" aria-hidden="true">
                <circle cx="40" cy="40" r="32" className="bg" />
                <circle cx="40" cy="40" r="32" className="fg" strokeDasharray={C}
                  strokeDashoffset={C - (C * (res.pct ?? 0)) / 100} transform="rotate(-90 40 40)" />
              </svg>
              <div><b>{res.pct === null ? '–' : `${res.pct}%`}</b><span className="mono">of the skills your ad names</span></div>
            </div>
            <div>
              <h4 className="mono">Matches, with evidence</h4>
              {res.have.length ? (
                <ul className="rlist">{res.have.map(([n, w]) => <li key={n}><span className="ok">✓</span><span><b>{n}</b> · {w}</span></li>)}</ul>
              ) : <p className="mono muted">{run.trim() ? 'No listed skills found in this text.' : 'Waiting for a job description.'}</p>}
            </div>
            {res.gaps.length > 0 && (
              <div>
                <h4 className="mono">Not yet, honestly</h4>
                <ul className="rlist">{res.gaps.map((n) => <li key={n}><span className="gap">○</span><span>{n}</span></li>)}</ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
