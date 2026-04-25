/**
 * Imperative confetti burst. Call runConfetti() to fire a one-shot
 * burst from the centre of the iframe. The function takes care of
 * mounting its own canvas, animating with requestAnimationFrame, and
 * cleaning up when the last particle dies.
 *
 * The first-drop-per-session gating lives in App.tsx — this module is
 * just the renderer.
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  born: number;
}

const COLORS = ['#6b42e8', '#d149c5', '#fc4d5b', '#ffd458', '#22a06e'];

interface Options {
  /** Total particle count. Default 80. */
  count?: number;
  /** Lifetime per particle in ms. Default 1400. */
  lifetime?: number;
}

export function runConfetti(opts: Options = {}): void {
  const count = opts.count ?? 80;
  const lifetime = opts.lifetime ?? 1400;

  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:60;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const particles: Particle[] = [];
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 4,
      size: 4 + Math.random() * 4,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      born: start,
    });
  }

  let raf = 0;
  const draw = (ts: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of particles) {
      const age = ts - p.born;
      if (age > lifetime) continue;
      alive++;
      // Physics: gravity + air drag.
      p.vy += 0.3;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;
      const opacity = 1 - age / lifetime;
      ctx.save();
      ctx.globalAlpha = Math.max(0, opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (alive > 0) {
      raf = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(draw);
}
