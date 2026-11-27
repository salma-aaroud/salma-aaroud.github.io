import { useEffect, useRef } from 'react';
import { PROFILE } from '../data';

/** A one-screen summary for recruiters who have 30 seconds. */
export default function Brief({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="case brief" onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-labelledby="brief-h">
      <div className="case-in">
        <button type="button" className="case-x" onClick={onClose} aria-label="Close">×</button>
        <p className="kicker">30-second brief</p>
        <h2 id="brief-h">{PROFILE.name}</h2>
        <p className="case-sum">Aeronautical engineer · {PROFILE.focus} · {PROFILE.location}, open to relocation</p>
        <div className="brief-grid">
          <div><h4>Education</h4><ul>
            <li><b>MSc Aeronautical Engineering</b>, Politecnico di Milano, Dec 2026</li>
            <li><b>BSc Aeronautical Engineering</b>, NUAA Nanjing, 2021 · GPA 4.0/5</li>
          </ul></div>
          <div><h4>Thesis</h4><ul>
            <li>Underexpanded planar & round jets, ideal and non-ideal (siloxane MM) gases</li>
            <li>SU2 Euler / RANS / URANS, 10-level mesh adaptation, HPC</li>
            <li>0.11 mm vs published cases · Mach disk up to +75%</li>
          </ul></div>
          <div><h4>Experience</h4><ul>
            <li>Airworthiness intern, Royal Air Maroc & Sarah Airways: 5 CofA renewals, FAA/EASA AD/SB, 381-defect reliability study</li>
            <li>Solar-car CFD vs wind tunnel · DRS wing within 4.7% · H∞ drone control</li>
          </ul></div>
          <div><h4>Looking for</h4><ul>
            <li>Full-time: CFD & aerodynamics, propulsion / compressible flow, or airworthiness engineering</li>
            <li>Available early 2027 · English, French, Arabic fluent · Italian B2</li>
          </ul></div>
        </div>
        <div className="row">
          <a className="btn primary" href={`mailto:${PROFILE.email}?subject=${encodeURIComponent('Engineering role')}`}>Email Salma</a>
          <a className="btn ghost" href={PROFILE.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          <a className="btn ghost" href="#contact" onClick={onClose}>Request tailored CV</a>
        </div>
      </div>
    </dialog>
  );
}
