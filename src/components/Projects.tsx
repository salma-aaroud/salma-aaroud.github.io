import { useEffect, useRef, useState } from 'react';
import { PROJECTS, type Project } from '../data';
import { useReveal } from '../lib/hooks';
import { Arrow } from './Hero';
import { setOverride } from '../lib/theme';

const FILTERS: [string, string][] = [
  ['all', 'All'], ['cfd', 'CFD'], ['exp', 'Wind tunnel'], ['ctrl', 'Flight control'], ['ops', 'Airworthiness'],
];

function Illo({ id }: { id: string }) {
  if (id === 'air') {
    return (
      <svg viewBox="0 0 320 200" className="illo" aria-hidden="true">
        <g fill="none" stroke="var(--ink-2)" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M160 18c6 0 9 10 9 26v34l96 40v14l-96-20v44l26 18v10l-35-9-35 9v-10l26-18v-44l-96 20v-14l96-40V44c0-16 3-26 9-26z" />
          <path d="M120 98v12M200 98v12M95 106v8M225 106v8" />
        </g>
        <g fill="var(--accent)">
          <circle cx="160" cy="60" r="4" /><circle cx="226" cy="112" r="4" /><circle cx="118" cy="104" r="4" /><circle cx="160" cy="160" r="4" />
        </g>
        <g fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3">
          <path d="M160 60h90M226 112h40M118 104H40M160 160h90" />
        </g>
        <g fontFamily="Roboto Mono" fontSize="9" fill="var(--muted)">
          <text x="254" y="63">AD</text><text x="270" y="115">SB</text><text x="8" y="107">MTBF</text><text x="254" y="163">CofA</text>
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 200" className="illo" aria-hidden="true">
      <g fill="none" stroke="var(--ink-2)" strokeWidth="1.4">
        <circle cx="100" cy="60" r="26" /><circle cx="220" cy="60" r="26" />
        <path d="M126 60h68M160 60v24" /><rect x="140" y="80" width="40" height="18" rx="3" />
      </g>
      <g fill="none" strokeWidth="1.2">
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} stroke={i === 0 ? 'var(--accent)' : 'var(--muted)'} opacity={i === 0 ? 1 : 0.28}
            d={`M20 ${160 + (i % 5) - 2} C70 ${118 + i * 2.2},110 ${182 - i},160 ${150 + (i % 4)} S250 ${140 + i * 1.5},300 ${152 + (i % 3)}`} />
        ))}
      </g>
    </svg>
  );
}

function Card({ p, i, onOpen }: { p: Project; i: number; onOpen: (p: Project) => void }) {
  const [ref, shown] = useReveal<HTMLElement>(0.1);
  return (
    <article ref={ref} className={`card reveal${shown ? ' in' : ''}${i === 0 ? ' feature' : ''}`} style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
      <button type="button" className="card-hit" onClick={() => onOpen(p)} aria-label={`Open case study: ${p.title}`} />
      <div className="card-media">
        {p.img ? <img src={p.img} alt={p.imgAlt} loading="lazy" style={{ objectFit: p.imgFit ?? 'cover' }} /> : <Illo id={p.id} />}
        <span className="card-stat"><b>{p.stat[0]}</b>{p.stat[1]}</span>
      </div>
      <div className="card-body">
        <p className="card-kicker">{p.kicker}</p>
        <h3>{p.title}</h3>
        <p>{p.summary}</p>
        <div className="card-foot">
          <div className="tags">{p.tools.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}</div>
          <span className="card-more">Case study <Arrow /></span>
        </div>
      </div>
    </article>
  );
}

export default function Projects({ highlight }: { highlight: string | null }) {
  const [f, setF] = useState('all');
  const [open, setOpen] = useState<Project | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const [headRef, headIn] = useReveal<HTMLDivElement>();

  useEffect(() => {
    if (open) dlg.current?.showModal();
    setOverride(open?.cmap ?? null);
  }, [open]);

  const list = PROJECTS.filter((p) => f === 'all' || p.cat.includes(f as Project['cat'][number]));

  return (
    <section id="projects" className="projects">
      <div className="wrap">
        <div ref={headRef} className={`sec-head reveal${headIn ? ' in' : ''}`}>
          <p className="kicker">Selected work</p>
          <h2>Every result checked against something real.</h2>
          <p className="sub">Wind-tunnel data, published cases, or aircraft that have to fly legally. Open any project for the full case study.</p>
        </div>
        <div className="filters" role="group" aria-label="Filter projects">
          {FILTERS.map(([k, l]) => (
            <button key={k} type="button" aria-pressed={f === k} onClick={() => setF(k)}>{l}</button>
          ))}
        </div>
        <div className={`cards${highlight ? ' dimming' : ''}`}>
          {list.map((p, i) => (
            <div key={p.id} className={highlight && p.skills.includes(highlight) ? 'hl' : ''} style={{ display: 'contents' }}>
              <Card p={p} i={f === 'all' ? i : 1} onOpen={setOpen} />
            </div>
          ))}
        </div>
      </div>

      <dialog ref={dlg} className="case" onClose={() => setOpen(null)} onClick={(e) => { if (e.target === dlg.current) dlg.current.close(); }}>
        {open && (
          <div className="case-in">
            <button type="button" className="case-x" onClick={() => dlg.current?.close()} aria-label="Close">×</button>
            <p className="kicker">{open.kicker} · {open.team}</p>
            <h2>{open.title}</h2>
            <p className="case-sum">{open.summary}</p>
            {open.gallery ? (
              <div className="case-gal">
                {open.gallery.map((g) => (
                  <figure key={g.src}><img src={g.src} alt={g.alt} loading="lazy" /><figcaption>{g.cap}</figcaption></figure>
                ))}
              </div>
            ) : open.img ? (
              <figure className="case-one"><img src={open.img} alt={open.imgAlt} /></figure>
            ) : (
              <div className="case-one illo-wrap"><Illo id={open.id} /></div>
            )}
            <div className="case-grid">
              <div><h4>My part</h4><p>{open.role}</p></div>
              <div><h4>Result</h4><p className="case-res">{open.result}</p></div>
              <div className="span2"><h4>Method</h4><ul>{open.method.map((m) => <li key={m}>{m}</li>)}</ul></div>
              <div className="span2"><h4>Tools</h4><div className="tags">{open.tools.map((t) => <span key={t} className="tag">{t}</span>)}</div></div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
