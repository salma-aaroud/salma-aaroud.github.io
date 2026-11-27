import { useEffect, useRef, useState } from 'react';
import { CMAPS, setMode, useTheme } from '../lib/theme';

const AUTO_BAR = 'linear-gradient(90deg, #6A00A8, #E16462, #22A884, #FDE725, #36AAF9, #F66B19)';

/** Colormap picker drawn as a row of colourbars, like a post-processor's legend. */
export function CmapSwitch() {
  const { mode } = useTheme();
  const opts = [{ id: 'auto' as const, label: 'Auto', note: 'follows the content', bar: AUTO_BAR },
    ...CMAPS.map((c) => ({ id: c.id, label: c.label, note: c.note, bar: `linear-gradient(90deg, ${c.stops.join(', ')})` }))];
  return (
    <div className="cmap" role="radiogroup" aria-label="Colour map">
      {opts.map((c) => (
        <button key={c.id} type="button" role="radio" aria-checked={mode === c.id} title={c.note} onClick={() => setMode(c.id)}>
          <i style={{ background: c.bar }} aria-hidden="true" />
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Fixed ParaView-style colour legend: shows the active colormap and why; click to lock another. */
export default function CmapLegend() {
  const { mode, cmap } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 3200);
    return () => clearTimeout(t);
  }, [cmap.id]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    addEventListener('pointerdown', close); addEventListener('keydown', close);
    return () => { removeEventListener('pointerdown', close); removeEventListener('keydown', close); };
  }, [open]);

  return (
    <div className={`legend-fx${pulse || open ? ' fresh' : ''}`} ref={ref}>
      {open && (
        <div className="legend-pop" role="dialog" aria-label="Choose a colour map">
          <p className="mono">Colour map</p>
          <CmapSwitch />
          <p className="legend-why">Auto re-colours the site to match the CFD field on screen.</p>
        </div>
      )}
      <button type="button" className="legend-btn" aria-expanded={open} onClick={() => setOpen(!open)}
        aria-label={`Colour map: ${cmap.label}${mode === 'auto' ? ', automatic' : ', locked'}. Change`}>
        <span className="legend-top mono">
          <span>{cmap.label}</span>
          <span className="legend-mode">{mode === 'auto' ? 'auto' : 'locked'}</span>
        </span>
        <i className="legend-bar" style={{ background: `linear-gradient(90deg, ${cmap.stops.join(', ')})` }} aria-hidden="true" />
        <span className="legend-note mono">{mode === 'auto' ? `matches ${cmap.note}` : cmap.note}</span>
      </button>
    </div>
  );
}
