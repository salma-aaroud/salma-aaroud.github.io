import { SKILLS } from '../data';
import { useReveal } from '../lib/hooks';

export default function Toolbox({ active, setActive }: { active: string | null; setActive: (s: string | null) => void }) {
  const [ref, shown] = useReveal<HTMLDivElement>();
  const cur = SKILLS.find((s) => s.id === active);
  const group = (now: boolean) => SKILLS.filter((s) => !!s.now === now);

  return (
    <section id="toolbox" className="toolbox">
      <div className="wrap">
        <div ref={ref} className={`sec-head reveal${shown ? ' in' : ''}`}>
          <p className="kicker">Toolbox</p>
          <h2>From mesh to answer, on my own.</h2>
          <p className="sub">Pick a tool to see where I used it. Matching projects light up above.</p>
        </div>
        <div className="tool-grid">
          {[true, false].map((now) => (
            <div key={String(now)} className={`tool-col${now ? ' now' : ''}`}>
              <h3 className="mono">{now ? '● In daily use' : 'Used in projects'}</h3>
              <div className="chips">
                {group(now).map((s) => (
                  <button key={s.id} type="button" className="chip" aria-pressed={active === s.id}
                    onClick={() => setActive(active === s.id ? null : s.id)}>{s.name}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="where" aria-live="polite">
          {cur ? <><b>{cur.name}</b> → {cur.where} <a href="#projects">see projects ↑</a></> : <span className="mono">No tool selected</span>}
        </p>
      </div>
    </section>
  );
}
