import { useState } from 'react';
import { DRAFTS, PROFILE } from '../data';
import { useReveal } from '../lib/hooks';

export default function Contact({ reason, setReason }: { reason: string; setReason: (r: string) => void }) {
  const [copied, setCopied] = useState('');
  const [ref, shown] = useReveal<HTMLDivElement>();
  const draft = DRAFTS[reason][1];
  const mailto = `mailto:${PROFILE.email}?subject=${encodeURIComponent(DRAFTS[reason][0])}&body=${encodeURIComponent(draft)}`;

  const copy = (t: string, k: string) => {
    navigator.clipboard?.writeText(t).then(() => { setCopied(k); setTimeout(() => setCopied(''), 1600); }, () => {});
  };

  return (
    <section id="contact" className="contact">
      <div className="wrap contact-grid">
        <div ref={ref} className={`reveal${shown ? ' in' : ''}`}>
          <p className="kicker">Contact</p>
          <h2 className="big">Cleared for<br />your team.</h2>
          <p className="sub">Hiring for CFD, aerodynamics, propulsion or airworthiness? Write to me and I'll send a CV tailored to your position.</p>
          <dl className="cbox">
            <div><dt className="mono">Email</dt><dd><a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
              <button type="button" className="copy" onClick={() => copy(PROFILE.email, 'em')}>{copied === 'em' ? 'Copied' : 'Copy'}</button></dd></div>
            <div><dt className="mono">LinkedIn</dt><dd><a href={PROFILE.linkedin} target="_blank" rel="noopener">{PROFILE.linkedinLabel}</a></dd></div>
            <div><dt className="mono">Based in</dt><dd>{PROFILE.location} · open to relocation in Europe</dd></div>
          </dl>
        </div>
        <div className="composer">
          <img className="avatar" src="/img/av_wave.webp" alt="" width={434} height={900} loading="lazy" />
          <div className="composer-card">
            <label htmlFor="reason" className="mono lbl">I'm writing about</label>
            <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              {Object.entries(DRAFTS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <pre className="draft">{draft}</pre>
            <div className="row">
              <a className="btn primary" href={mailto}>Open in email</a>
              <button type="button" className="btn ghost" onClick={() => copy(draft + '\n', 'dr')}>{copied === 'dr' ? 'Copied' : 'Copy message'}</button>
            </div>
          </div>
        </div>
      </div>
      <footer className="wrap foot mono">
        <span>© 2026 Salma Aaroud · Aeronautical engineer</span>
        <span>Jets drawn live from the thesis nozzle geometry · colours follow the CFD colormap on screen</span>
      </footer>
    </section>
  );
}
