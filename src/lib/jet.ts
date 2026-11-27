// Illustrative underexpanded-jet renderer (not a solver).
// Nozzle contour is the thesis geometry: half-height in mm vs x in mm, exit at x = 0.
const NZ: [number, number][] = [[-8.1, 6.0], [-7.706, 5.99], [-7.313, 5.954], [-6.925, 5.887], [-6.546, 5.778], [-6.186, 5.619], [-5.857, 5.402], [-5.57, 5.132], [-5.323, 4.825], [-5.1, 4.5], [-4.877, 4.175], [-4.63, 3.868], [-4.343, 3.598], [-4.014, 3.381], [-3.654, 3.222], [-3.275, 3.113], [-2.887, 3.046], [-2.494, 3.01], [-2.1, 3.0], [-1.909, 3.023], [-1.718, 3.046], [-1.527, 3.068], [-1.336, 3.091], [-1.146, 3.114], [-0.955, 3.136], [-0.764, 3.159], [-0.573, 3.182], [-0.382, 3.204], [-0.191, 3.227], [0.0, 3.25]];

function nzY(xmm: number) {
  if (xmm <= NZ[0][0]) return NZ[0][1];
  for (let i = 1; i < NZ.length; i++) {
    if (xmm <= NZ[i][0]) {
      const a = NZ[i - 1], b = NZ[i], t = (xmm - a[0]) / (b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * t;
    }
  }
  return NZ[NZ.length - 1][1];
}

export type Gas = 'n2' | 'mm';
export type JetTheme = {
  shock: string; exp: string; comp: string; boundary: string; disk: string;
  wall: string; core: string; particle: string; ambient: string; axis: string; label: string;
  /** colormap stops, cool to hot, used to colour the flow by temperature */
  ramp?: string[];
};

export const SCHLIEREN: JetTheme = {
  shock: '#F4F6FA', exp: '#8E97A8', comp: '#C3CAD6', boundary: '#FF6A2B', disk: '#FFB347',
  wall: '#3A404C', core: 'rgba(255,255,255,0.05)', particle: '#E6ECF5', ambient: '#6B7383',
  axis: '#4C8DFF', label: '#9AA3B2',
};

/** Persistent tracer state, owned by the canvas so particles keep their history between frames. */
type Tracer = { x: number; f: number; amb: boolean };
export class TracerField {
  ps: Tracer[] = [];
  last = -1;
}

export type JetOpts = {
  W: number; H: number; npr: number; gas: Gas; time: number; animate: boolean;
  theme?: JetTheme; r0?: number; nozzleMm?: number; cy?: number; labels?: boolean;
  /** tracer density multiplier; 0 disables tracers */
  density?: number;
  tracers?: TracerField;
};

const hexRgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
/** Sample a colormap (array of hex stops) at t in [0,1]; returns an rgba() string. */
export function sampleRamp(ramp: string[], t: number, a = 1) {
  const x = Math.min(1, Math.max(0, t)) * (ramp.length - 1), i = Math.min(ramp.length - 2, Math.floor(x)), f = x - i;
  const p = hexRgb(ramp[i]), q = hexRgb(ramp[i + 1]);
  const c = p.map((v, k) => Math.round(v + (q[k] - v) * f));
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
/** 0 at NPR 2, 1 at NPR 9: how hard the nozzle is being driven. */
export const heatOf = (npr: number) => Math.min(1, Math.max(0, (npr - 2) / 7));

export type JetReadout = { cells: number; disk: boolean; diskRatio: number; mj: number };

/** Fully expanded jet Mach number for an ideal gas (γ = 1.4) at a given nozzle pressure ratio. */
export const machJ = (npr: number, g = 1.4) => Math.sqrt((2 / (g - 1)) * (Math.pow(npr, (g - 1) / g) - 1));

export function drawJet(ctx: CanvasRenderingContext2D, o: JetOpts): JetReadout {
  const th = o.theme ?? SCHLIEREN;
  const { W, H, npr, gas, time: t } = o;
  const cy = o.cy ?? H / 2;
  ctx.clearRect(0, 0, W, H);

  const r0 = o.r0 ?? Math.round(H * 0.15);
  const sc = r0 / 3.25;
  const x0 = Math.round((o.nozzleMm ?? 5.6) * sc) + 2;
  const xt = x0 + Math.round(-2.1 * sc);
  const lw = Math.max(1, r0 / 34);
  const rn = (x: number) => nzY((x - x0) / sc) * sc;
  const L = r0 * 1.45 * Math.sqrt(npr) * (gas === 'mm' ? 0.96 : 1);
  const amp = r0 * (0.18 + 0.09 * (npr - 2));
  const disk = npr > 4.2;
  const diskBase = disk ? Math.min(r0 * 0.95, (npr - 4.2) * r0 * 0.22 + r0 * 0.12) : 0;
  const diskR = Math.min(diskBase * (gas === 'mm' ? 1.75 : 1), r0 * 0.82);
  const mj = machJ(npr);
  // shear-layer flapping grows downstream and with pressure ratio
  const shear = o.animate ? r0 * 0.035 * (0.4 + npr / 9) : 0;
  const rad = (x: number) => {
    if (x < x0) return rn(x);
    const s = (x - x0) / L;
    const base = r0 + amp * Math.sin(Math.PI * s) ** 2 * Math.exp(-s * 0.18) + (x - x0) * 0.02;
    return base + shear * Math.min(1, s * 0.35) * Math.sin(x * 0.045 - t * 5.5);
  };

  // centreline (dashed, as in the thesis figures)
  ctx.save();
  ctx.setLineDash([6, 6]); ctx.strokeStyle = th.axis; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.restore();

  // x/D axis ticks
  if (o.labels) {
    const D = 2 * r0, yb = H - 6;
    ctx.font = '400 9px "Roboto Mono", monospace'; ctx.fillStyle = th.label; ctx.strokeStyle = th.label; ctx.globalAlpha = 0.7;
    for (let i = 0, x = x0; x < W - 30; i++, x += D) {
      ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x, H - 5); ctx.stroke();
      ctx.fillText(String(i), x + 3, yb - 2);
    }
    ctx.fillText('x/D', W - 26, yb - 2);
    ctx.globalAlpha = 1;
  }

  // nozzle core flow
  ctx.fillStyle = th.core;
  ctx.beginPath();
  for (let x = 0; x <= x0; x++) ctx.lineTo(x, cy - rn(x));
  for (let x = x0; x >= 0; x--) ctx.lineTo(x, cy + rn(x));
  ctx.closePath(); ctx.fill();

  // nozzle walls
  const heat = heatOf(npr);
  const ramp = th.ramp;
  if (ramp) {
    const wg = ctx.createLinearGradient(0, 0, x0, 0);
    wg.addColorStop(0, th.wall); wg.addColorStop(0.55, th.wall);
    wg.addColorStop(1, sampleRamp(ramp, 0.55 + 0.4 * heat, 0.35 + 0.65 * heat));
    ctx.fillStyle = wg;
  } else ctx.fillStyle = th.wall;
  const wt = Math.max(6, r0 * 0.12);
  for (const sg of [-1, 1]) {
    ctx.beginPath();
    for (let x = 0; x <= x0; x++) ctx.lineTo(x, cy + sg * rn(x));
    for (let x = x0; x >= 0; x--) ctx.lineTo(x, cy + sg * (rn(x) + wt));
    ctx.closePath(); ctx.fill();
  }
  // sonic throat
  ctx.setLineDash([2, 3]); ctx.strokeStyle = th.label; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(xt, cy - rn(xt)); ctx.lineTo(xt, cy + rn(xt)); ctx.stroke(); ctx.setLineDash([]);
  if (o.labels) {
    ctx.font = '500 10px "Roboto Mono", monospace'; ctx.fillStyle = th.label;
    ctx.fillText('M=1', xt - 12, cy - rn(xt) - wt - 6);
  }

  // plume core (soft fill, brighter with pressure ratio)
  const pg = ctx.createLinearGradient(x0, 0, W, 0);
  if (ramp) {
    pg.addColorStop(0, sampleRamp(ramp, 0.45 + 0.5 * heat, 0.08 + 0.2 * heat));
    pg.addColorStop(Math.min(0.9, 0.25 + 0.45 * heat), sampleRamp(ramp, 0.3 + 0.35 * heat, 0.05 + 0.08 * heat));
    pg.addColorStop(1, sampleRamp(ramp, 0.2, 0));
  } else {
    const core = 0.04 + 0.012 * (npr - 2);
    pg.addColorStop(0, `rgba(255,255,255,${core})`); pg.addColorStop(1, 'rgba(255,255,255,0)');
  }
  ctx.beginPath();
  for (let x = x0; x <= W; x += 2) ctx.lineTo(x, cy - rad(x));
  for (let x = W; x >= x0; x -= 2) ctx.lineTo(x, cy + rad(x));
  ctx.closePath(); ctx.fillStyle = pg; ctx.fill();

  // hot potential core: longer and brighter as thrust rises (flickers slightly when animated)
  if (ramp && heat > 0.05) {
    const flick = o.animate ? 1 + 0.06 * Math.sin(t * 23) * Math.sin(t * 7.3) : 1;
    const len = L * (1.2 + 2.6 * heat) * flick, hr = r0 * (0.55 + 0.25 * heat);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x0, cy); ctx.scale(len / hr, 1);
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, hr);
    cg.addColorStop(0, sampleRamp(ramp, 0.75 + 0.25 * heat, 0.22 * heat));
    cg.addColorStop(0.5, sampleRamp(ramp, 0.55 + 0.3 * heat, 0.1 * heat));
    cg.addColorStop(1, sampleRamp(ramp, 0.4, 0));
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(0, 0, hr, -Math.PI / 2, Math.PI / 2); ctx.fill();
    ctx.restore();
  }

  // tracers go under the wave pattern so the shocks stay crisp
  if (o.tracers && o.animate && (o.density ?? 1) > 0) {
    drawTracers(ctx, o.tracers, { W, cy, t, npr, x0, xt, r0, L, rn, rad, disk, diskR, density: o.density ?? 1, th });
  }

  // jet boundary (the orange contour of a numerical schlieren plot)
  ctx.strokeStyle = th.boundary; ctx.lineWidth = lw * 1.3;
  for (const sg of [-1, 1]) {
    ctx.beginPath();
    for (let x = x0; x <= W; x += 2) ctx.lineTo(x, cy + sg * rad(x));
    ctx.stroke();
  }

  let cells = 0;
  for (let k = 0; k < 14; k++) {
    const xs = x0 + k * L, xm = xs + L * 0.5, xe = xs + L;
    if (xs > W) break;
    cells++;
    const fade = Math.max(0.1, 1 - k * 0.15);
    const md = k === 0 && disk ? diskR : 0;
    for (const sg of [-1, 1]) {
      const rs = rad(xs) * 0.97, tp: [number, number] = [xm, cy + sg * md];
      const xsh = xs + L * 0.1, p0: [number, number] = [xsh, cy + sg * rad(xsh) * 0.86];
      const c1: [number, number] = [xs + L * 0.24, cy + sg * rad(xs + L * 0.24) * 0.84];
      const c2: [number, number] = [xs + L * 0.42, cy + sg * (md + (rs - md) * 0.62)];
      const cb = (u0: number): [number, number] => {
        const u = 1 - u0;
        return [
          u * u * u * p0[0] + 3 * u * u * u0 * c1[0] + 3 * u * u0 * u0 * c2[0] + u0 * u0 * u0 * tp[0],
          u * u * u * p0[1] + 3 * u * u * u0 * c1[1] + 3 * u * u0 * u0 * c2[1] + u0 * u0 * u0 * tp[1],
        ];
      };
      const xb = (j: number) => xs + L * (0.07 + 0.075 * j);
      // expansion fan from the opposite lip
      ctx.strokeStyle = th.exp; ctx.lineWidth = lw * 0.7; ctx.globalAlpha = fade * 0.5;
      for (let j = 0; j < 4; j++) {
        const x = xb(j);
        ctx.beginPath(); ctx.moveTo(xs, cy - sg * rs); ctx.lineTo(x, cy + sg * rad(x) * 0.99); ctx.stroke();
      }
      // compression waves coalescing into the intercepting shock
      ctx.strokeStyle = th.comp; ctx.lineWidth = lw; ctx.globalAlpha = Math.min(1, fade * 0.75);
      for (let j = 0; j < 4; j++) {
        const x = xb(j), tg = cb(0.04 + 0.2 * j);
        ctx.beginPath(); ctx.moveTo(x, cy + sg * rad(x) * 0.99); ctx.lineTo(tg[0], tg[1]); ctx.stroke();
      }
      // intercepting + reflected shock
      ctx.strokeStyle = th.shock; ctx.lineWidth = lw * 1.8; ctx.globalAlpha = fade;
      const xr = Math.min(xe, W);
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]);
      ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], tp[0], tp[1]);
      ctx.quadraticCurveTo(xm + L * 0.25, cy + sg * (md + (rad(xr) - md) * 0.55), xr, cy + sg * rad(xr) * 0.97);
      ctx.stroke();
      if (md) {
        // slip line from the triple point
        ctx.setLineDash([3, 4]); ctx.strokeStyle = th.boundary; ctx.lineWidth = lw * 0.8; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.moveTo(tp[0], tp[1]); ctx.lineTo(xm + L * 0.45, cy + sg * md * 0.9); ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    if (md) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = th.disk; ctx.lineWidth = lw * 2.6;
      ctx.beginPath(); ctx.moveTo(xm, cy - md); ctx.lineTo(xm, cy + md); ctx.stroke();
      if (o.labels) {
        ctx.fillStyle = th.disk; ctx.font = '500 11px "Roboto Mono", monospace';
        const tw = ctx.measureText('Mach disk').width;
        ctx.fillText('Mach disk', xm - tw / 2, cy - rad(xm) - 10);
        ctx.strokeStyle = th.disk; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.moveTo(xm, cy - rad(xm) - 6); ctx.lineTo(xm, cy - md - 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
  ctx.globalAlpha = 1;

  return { cells: Math.min(cells, 9), disk, diskRatio: gas === 'mm' ? 1.75 : 1, mj };
}

type Field = {
  W: number; cy: number; t: number; npr: number; x0: number; xt: number; r0: number; L: number;
  rn: (x: number) => number; rad: (x: number) => number; disk: boolean; diskR: number; density: number; th: JetTheme;
};

/**
 * Tracers follow a cartoon of the real velocity field: they accelerate through the
 * expansion fans, drop speed across each shock, almost stall in the subsonic pocket
 * behind the Mach disk, and the surrounding air is slowly entrained into the shear layer.
 */
function drawTracers(ctx: CanvasRenderingContext2D, tf: TracerField, f: Field) {
  const { W, cy, t, npr, x0, xt, r0, L, rn, rad, disk, diskR, th } = f;
  const dt = tf.last < 0 ? 0.016 : Math.min(0.05, Math.max(0, t - tf.last));
  tf.last = t;

  const nJet = Math.round((22 + 16 * (npr - 2)) * f.density);
  const nAmb = Math.round(22 * f.density);
  const U = r0 * (0.9 + 0.55 * (npr - 2)); // px/s: higher NPR, faster jet
  const spawnJet = (anywhere: boolean): Tracer => ({
    x: anywhere ? Math.random() * W : Math.random() * x0 * 0.35, f: (Math.random() * 2 - 1) * 0.9, amb: false,
  });
  const spawnAmb = (): Tracer => ({ x: Math.random() * W, f: (Math.random() < 0.5 ? -1 : 1) * (1.5 + Math.random() * 1.3), amb: true });

  // match target counts smoothly as the pressure ratio changes
  let jets = 0, ambs = 0;
  for (const p of tf.ps) p.amb ? ambs++ : jets++;
  for (; jets < nJet; jets++) tf.ps.push(spawnJet(tf.ps.length < 5 || tf.last < 0.2));
  for (; ambs < nAmb; ambs++) tf.ps.push(spawnAmb());
  if (jets > nJet + 4) {
    let drop = jets - nJet;
    tf.ps = tf.ps.filter((p) => (p.amb || drop-- <= 0));
  }

  // speed multiplier and "hot" flag at (x, |f|)
  const field = (x: number, af: number): [number, boolean] => {
    if (x < x0) {
      const a = rn(x) / rn(xt);
      return [x < xt ? 0.18 + 0.5 / (a * a) : 0.7 + 1.6 * (a - 1), false];
    }
    const sx = (x - x0) / L, k = Math.floor(sx), s = sx - k;
    const decay = 0.45 + 0.55 * Math.exp(-k * 0.28);
    const sI = 0.1 + 0.4 * (1 - af), sR = 0.5 + 0.5 * af;
    let m = s < sI ? 1 + 0.5 * (s / sI) : s < sR ? 0.82 : 0.7 + 0.3 * ((s - sR) / Math.max(0.05, 1 - sR));
    let hot = false;
    if (k === 0 && disk && af * rad(x) < diskR * 1.05 && s > 0.5) {
      const p = Math.min(1, (s - 0.5) / 0.6);
      m = 0.16 + 0.75 * p * p; hot = p < 0.75;
    }
    return [m * decay, hot];
  };

  ctx.lineCap = 'round';
  const pw = Math.max(1, r0 / 40);
  for (const p of tf.ps) {
    if (p.amb) {
      // entrainment: slow drift downstream and inward toward the shear layer
      p.x += U * 0.07 * dt;
      p.f -= Math.sign(p.f) * dt * (0.05 + 0.03 * npr);
      if (p.x > W || Math.abs(p.f) < 1.04) Object.assign(p, spawnAmb());
      const r = p.x < x0 ? rn(x0) : rad(p.x);
      const y = cy + p.f * r;
      ctx.strokeStyle = th.ambient; ctx.globalAlpha = 0.35; ctx.lineWidth = pw * 0.8;
      ctx.beginPath(); ctx.moveTo(p.x - 4, y + Math.sign(p.f) * 1.2); ctx.lineTo(p.x, y); ctx.stroke();
      continue;
    }
    const af = Math.abs(p.f);
    const [m, hot] = field(p.x, af);
    const v = U * m;
    p.x += v * dt;
    if (p.x > W + 10) { Object.assign(p, spawnJet(false)); continue; }
    const r = p.x < x0 ? rn(p.x) : rad(p.x);
    const y = cy + p.f * r * 0.94;
    const len = Math.min(r0 * 0.9, v * 0.05); // motion-blur streak: faster flow, longer streak
    const hf = heatOf(npr);
    if (th.ramp) {
      // colour = temperature proxy: faster, harder-driven flow samples the hot end of the colormap;
      // gas behind the Mach disk is stagnation-hot, so it gets the top of the ramp
      ctx.strokeStyle = hot ? sampleRamp(th.ramp, 0.97) : sampleRamp(th.ramp, 0.3 + 0.62 * Math.min(1, m * 0.75) * (0.35 + 0.65 * hf));
      ctx.globalAlpha = hot ? 0.95 : Math.min(0.9, 0.3 + 0.45 * m);
    } else {
      ctx.strokeStyle = hot ? th.disk : th.particle;
      ctx.globalAlpha = hot ? 0.9 : Math.min(0.85, 0.25 + 0.4 * m);
    }
    ctx.lineWidth = pw;
    ctx.beginPath(); ctx.moveTo(p.x - len, y); ctx.lineTo(p.x, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
