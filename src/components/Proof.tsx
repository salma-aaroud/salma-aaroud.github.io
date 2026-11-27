import { METRICS, type Metric } from '../data';
import { useCountUp, useReveal } from '../lib/hooks';

function Cell({ m, run, i }: { m: Metric; run: boolean; i: number }) {
  const v = useCountUp(m.value, run, 1300 + i * 120, m.decimals ?? 0);
  const shown = (m.decimals ? v.toFixed(m.decimals) : Math.round(v).toLocaleString('en-US'));
  return (
    <div className="metric" style={{ transitionDelay: `${i * 70}ms` }}>
      <div className="metric-v"><span className="tab">{m.prefix}{shown}</span><small>{m.suffix}</small></div>
      <div className="metric-l">{m.label}</div>
      <div className="metric-n">{m.note}</div>
    </div>
  );
}

export default function Proof() {
  const [ref, shown] = useReveal<HTMLElement>(0.25);
  return (
    <section id="proof" className={`proof reveal${shown ? ' in' : ''}`} ref={ref} aria-label="Key results">
      <div className="wrap">
        <p className="kicker">Measured, not claimed</p>
        <div className="metrics">
          {METRICS.map((m, i) => <Cell key={m.label} m={m} run={shown} i={i} />)}
        </div>
      </div>
    </section>
  );
}
