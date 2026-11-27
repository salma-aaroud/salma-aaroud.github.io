import { useEffect, useState } from 'react';

const LINKS = [
  ['#thesis', 'Thesis'],
  ['#projects', 'Projects'],
  ['#log', 'Flight log'],
  ['#toolbox', 'Toolbox'],
  ['#fit', 'Fit check'],
];

export default function Nav({ onBrief }: { onBrief: () => void }) {
  const [p, setP] = useState(0);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      setP(h > 0 ? scrollY / h : 0);
      setSolid(scrollY > 40);
    };
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`nav${solid ? ' solid' : ''}`}>
      <div className="nav-in">
        <a className="mark" href="#top" aria-label="Salma Aaroud, back to top">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 16h7l3-6 4 12 3-6h9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" /></svg>
          <span>Salma Aaroud</span>
        </a>
        <nav aria-label="Sections" className={open ? 'open' : ''}>
          {LINKS.map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)}>{l}</a>)}
        </nav>
        <div className="nav-cta">
          <button type="button" className="btn ghost sm" onClick={onBrief}>30-sec brief</button>
          <a className="btn primary sm" href="#contact">Contact</a>
          <button type="button" className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <span /><span />
          </button>
        </div>
      </div>
      <div className="progress" style={{ transform: `scaleX(${p})` }} aria-hidden="true" />
    </header>
  );
}
