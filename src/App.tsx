import { useEffect, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Proof from './components/Proof';
import Thesis from './components/Thesis';
import Projects from './components/Projects';
import FlightLog from './components/FlightLog';
import Toolbox from './components/Toolbox';
import FitCheck from './components/FitCheck';
import Contact from './components/Contact';
import Brief from './components/Brief';
import CmapLegend from './components/CmapSwitch';
import { SECTION_CMAP, setSectionCmap } from './lib/theme';

export default function App() {
  const [brief, setBrief] = useState(false);
  const [skill, setSkill] = useState<string | null>(null);
  const [reason, setReason] = useState('job');

  // Any link marked data-reason pre-selects the contact draft.
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>('[data-reason]');
      if (a?.dataset.reason) setReason(a.dataset.reason);
    };
    document.addEventListener('click', on);
    return () => document.removeEventListener('click', on);
  }, []);

  // Auto colormap: the section crossing the middle of the screen picks the palette.
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setSectionCmap(SECTION_CMAP[e.target.id]); }),
      { rootMargin: '-48% 0px -48% 0px' },
    );
    Object.keys(SECTION_CMAP).forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a className="skip" href="#thesis">Skip to content</a>
      <Nav onBrief={() => setBrief(true)} />
      <main>
        <Hero />
        <Proof />
        <Thesis />
        <Projects highlight={skill} />
        <FlightLog />
        <Toolbox active={skill} setActive={setSkill} />
        <FitCheck />
        <Contact reason={reason} setReason={setReason} />
      </main>
      <Brief open={brief} onClose={() => setBrief(false)} />
      <CmapLegend />
    </>
  );
}
