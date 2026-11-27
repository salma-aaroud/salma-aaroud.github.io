import { useSyncExternalStore } from 'react';
import type { JetTheme } from './jet';

// The site's palette is a CFD colormap. In "auto" mode it follows the content on screen,
// the way a post-processor's colour legend follows the field you're looking at.
export type CmapId = 'plasma' | 'viridis' | 'turbo' | 'coolwarm' | 'schlieren';
export type Mode = 'auto' | CmapId;

export type Cmap = { id: CmapId; label: string; note: string; stops: string[]; css: Record<string, string>; jet: JetTheme };

export const CMAPS: Cmap[] = [
  {
    id: 'plasma', label: 'Plasma', note: 'rocket-exhaust plasma',
    stops: ['#0D0887', '#6A00A8', '#B12A90', '#E16462', '#FCA636', '#F0F921'],
    css: {
      '--bg': '#070615', '--bg-2': '#0C0A1E', '--panel': '#131028', '--panel-2': '#1A1634',
      '--line': '#251F3F', '--line-2': '#362E56', '--ink': '#F6F3FF', '--ink-2': '#CEC7E6', '--muted': '#9C94BA',
      '--accent': '#EC5F96', '--accent-hi': '#F47BAA', '--accent-2': '#FCA636', '--on-accent': '#10061A',
      '--glow-1': '#6A00A8', '--glow-2': '#B12A90',
    },
    jet: {
      shock: '#FBF3D0', exp: '#8A63D8', comp: '#C88BE0', boundary: '#EC5F96', disk: '#FCA636',
      wall: '#3B345A', core: 'rgba(190,140,255,0.06)', particle: '#FFE0C8', ambient: '#6F6794',
      axis: '#8A5CF6', label: '#A69ECA',
    },
  },
  {
    id: 'viridis', label: 'Viridis', note: 'her Mach-number plots',
    stops: ['#440154', '#414487', '#2A788E', '#22A884', '#7AD151', '#FDE725'],
    css: {
      '--bg': '#05090E', '--bg-2': '#0A1016', '--panel': '#0F1820', '--panel-2': '#142029',
      '--line': '#1C2A34', '--line-2': '#2A3D48', '--ink': '#F2FAF6', '--ink-2': '#C5DBD4', '--muted': '#8FA7A2',
      '--accent': '#2FC28A', '--accent-hi': '#4BD39D', '--accent-2': '#FDE725', '--on-accent': '#04120C',
      '--glow-1': '#414487', '--glow-2': '#2A788E',
    },
    jet: {
      shock: '#EAF7D0', exp: '#4A75A8', comp: '#7AD151', boundary: '#22A884', disk: '#FDE725',
      wall: '#2A3B46', core: 'rgba(120,220,180,0.05)', particle: '#D2F5E2', ambient: '#4E6A74',
      axis: '#5B6BD6', label: '#8FA7A2',
    },
  },
  {
    id: 'turbo', label: 'Turbo', note: 'the pressure-coefficient contours',
    stops: ['#30123B', '#4662D7', '#36AAF9', '#1AE4B6', '#72FE5E', '#C8EF34', '#FABA39', '#F66B19', '#CA2A04', '#7A0403'],
    css: {
      '--bg': '#0A0714', '--bg-2': '#100B1E', '--panel': '#171126', '--panel-2': '#1E1731',
      '--line': '#2A2140', '--line-2': '#3B2F57', '--ink': '#FBF6F2', '--ink-2': '#DCCFD0', '--muted': '#A698AE',
      '--accent': '#F66B19', '--accent-hi': '#FF8640', '--accent-2': '#FABA39', '--on-accent': '#140600',
      '--glow-1': '#4662D7', '--glow-2': '#CA2A04',
    },
    jet: {
      shock: '#FFF1C9', exp: '#36AAF9', comp: '#1AE4B6', boundary: '#F66B19', disk: '#FABA39',
      wall: '#3A2F52', core: 'rgba(255,170,90,0.05)', particle: '#E6FFD4', ambient: '#4E5BA8',
      axis: '#36AAF9', label: '#A698AE',
    },
  },
  {
    id: 'coolwarm', label: 'Coolwarm', note: 'the DRS Mach field',
    stops: ['#3B4CC0', '#7092F3', '#AAC7FD', '#DDDDDD', '#F7B89C', '#E7745B', '#B40426'],
    css: {
      '--bg': '#060914', '--bg-2': '#0A0E1C', '--panel': '#101527', '--panel-2': '#161C32',
      '--line': '#1F2741', '--line-2': '#2E3858', '--ink': '#F4F6FF', '--ink-2': '#CBD3EC', '--muted': '#95A0C2',
      '--accent': '#F0805F', '--accent-hi': '#F79878', '--accent-2': '#9DB8FF', '--on-accent': '#1A0702',
      '--glow-1': '#3B4CC0', '--glow-2': '#B40426',
    },
    jet: {
      shock: '#EDEDED', exp: '#7092F3', comp: '#AAC7FD', boundary: '#E7745B', disk: '#F7B89C',
      wall: '#2E3858', core: 'rgba(170,199,253,0.05)', particle: '#DDE6FF', ambient: '#4A5590',
      axis: '#7092F3', label: '#95A0C2',
    },
  },
  {
    id: 'schlieren', label: 'Schlieren', note: 'her numerical schlieren',
    stops: ['#14171E', '#3A404C', '#8E97A8', '#F4F6FA', '#FF6A2B'],
    css: {
      '--bg': '#07080B', '--bg-2': '#0C0E13', '--panel': '#11141A', '--panel-2': '#161A22',
      '--line': '#232833', '--line-2': '#323947', '--ink': '#F4F6FA', '--ink-2': '#C3CAD6', '--muted': '#8E97A8',
      '--accent': '#FF6A2B', '--accent-hi': '#FF7E45', '--accent-2': '#FFB347', '--on-accent': '#0B0B0E',
      '--glow-1': '#1B2232', '--glow-2': '#3A2416',
    },
    jet: {
      shock: '#F4F6FA', exp: '#8E97A8', comp: '#C3CAD6', boundary: '#FF6A2B', disk: '#FFB347',
      wall: '#3A404C', core: 'rgba(255,255,255,0.05)', particle: '#E6ECF5', ambient: '#6B7383',
      axis: '#4C8DFF', label: '#9AA3B2',
    },
  },
];

/** Which colormap each section shows in auto mode. */
export const SECTION_CMAP: Record<string, CmapId> = {
  top: 'plasma', proof: 'plasma', thesis: 'viridis', projects: 'turbo',
  log: 'coolwarm', toolbox: 'schlieren', fit: 'schlieren', contact: 'plasma',
};

// The flow is coloured by temperature through each colormap's own ramp.
for (const c of CMAPS) c.jet.ramp = c.id === 'schlieren' ? ['#3A404C', '#8E97A8', '#F4F6FA', '#FFB347', '#FF6A2B'] : c.stops;

const KEY = 'sa-cmap';
let mode: Mode = (() => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'auto' || CMAPS.some((c) => c.id === v)) return v as Mode;
  } catch { /* storage blocked */ }
  return 'auto';
})();
let section: CmapId = 'plasma';
let override: CmapId | null = null;
const subs = new Set<() => void>();
const byId = (id: CmapId) => CMAPS.find((c) => c.id === id)!;

let snap = { mode, cmap: byId(mode === 'auto' ? section : mode) };
const recompute = () => {
  const id = mode === 'auto' ? (override ?? section) : mode;
  if (snap.mode !== mode || snap.cmap.id !== id) {
    snap = { mode, cmap: byId(id) };
    applyCmap();
    subs.forEach((f) => f());
  }
};

export function applyCmap() {
  const c = snap.cmap, root = document.documentElement;
  for (const [k, v] of Object.entries(c.css)) root.style.setProperty(k, v);
  root.style.setProperty('--cbar', `linear-gradient(90deg, ${c.stops.join(', ')})`);
  // text gradients skip the dark end of the colormap so they stay legible
  const hi = c.id === 'schlieren' ? c.stops.slice(2) : c.stops.slice(Math.floor(c.stops.length / 3));
  root.style.setProperty('--cbar-hi', `linear-gradient(90deg, ${hi.join(', ')})`);
  root.style.setProperty('--j-shock', c.jet.shock);
  root.style.setProperty('--j-exp', c.jet.exp);
  root.style.setProperty('--j-bnd', c.jet.boundary);
  root.dataset.cmap = c.id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.css['--bg']);
}

export function setMode(m: Mode) {
  mode = m;
  try { localStorage.setItem(KEY, m); } catch { /* ignore */ }
  recompute();
}
export function setSectionCmap(id: CmapId) { section = id; recompute(); }
/** A dialog showing a specific CFD image can temporarily take over the palette. */
export function setOverride(id: CmapId | null) { override = id; recompute(); }

export function useTheme() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => snap);
}
export const useCmap = () => useTheme().cmap;
