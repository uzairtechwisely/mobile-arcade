"use client";

import { useEffect, useRef } from "react";

type Preset = "congrats" | "reward";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  wobble: number;
  wobbleSpeed: number;
  color: string;
  shape: "rect" | "ribbon" | "circle" | "star";
  life: number;
  maxLife: number;
  gravity: number;
  drag: number;
  spark?: boolean;
  trail?: Array<{ x: number; y: number }>;
};

const COLORS = ["#006afc", "#3385fd", "#3c2a68", "#7c5cff", "#00c2a8", "#ffc83d", "#ff5d8f"];
const SPARK_COLORS = ["#ffc83d", "#3385fd", "#7c5cff", "#ff5d8f", "#ffe9a8"];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function drawStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Full-viewport, click-through celebration: confetti cannons with gravity, air
 * drag, tumbling and flutter, plus radial firework bursts with fading trails.
 * Drawn as vector shapes on a canvas; cleans itself up when the show ends.
 */
export function Celebration({ preset }: { preset: Preset }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const scale = Math.max(0.7, Math.min(width / 1200, 1.2));

    const confetti = (x: number, y: number, angleDeg: number, spread: number, power: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const a = ((angleDeg + rand(-spread, spread)) * Math.PI) / 180;
        const speed = rand(0.45, 1) * power * scale;
        const shape = pick<Particle["shape"]>(["rect", "rect", "ribbon", "circle", "star"]);
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: -Math.sin(a) * speed,
          size: rand(6, 12) * scale,
          angle: rand(0, Math.PI * 2),
          spin: rand(-0.25, 0.25),
          wobble: rand(0, Math.PI * 2),
          wobbleSpeed: rand(0.08, 0.22),
          color: pick(COLORS),
          shape,
          life: 0,
          maxLife: rand(170, 260),
          gravity: rand(0.16, 0.26),
          drag: shape === "ribbon" ? 0.955 : 0.972,
        });
      }
    };

    const firework = (x: number, y: number) => {
      const color = pick(SPARK_COLORS);
      const count = 56;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + rand(-0.05, 0.05);
        const speed = rand(2.2, 6.2) * scale;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          size: rand(1.6, 3) * scale,
          angle: 0,
          spin: 0,
          wobble: 0,
          wobbleSpeed: 0,
          color: Math.random() < 0.25 ? "#ffe9a8" : color,
          shape: "circle",
          life: 0,
          maxLife: rand(55, 85),
          gravity: 0.06,
          drag: 0.955,
          spark: true,
          trail: [],
        });
      }
    };

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (preset === "congrats") {
      at(0, () => {
        confetti(0, height * 0.85, 62, 14, 22, 70);
        confetti(width, height * 0.85, 118, 14, 22, 70);
      });
      at(350, () => firework(width * 0.22, height * 0.28));
      at(650, () => firework(width * 0.78, height * 0.24));
      at(1000, () => {
        confetti(width * 0.5, -10, 270, 60, 4, 60);
        firework(width * 0.5, height * 0.2);
      });
      at(1500, () => {
        confetti(0, height * 0.9, 65, 12, 18, 40);
        confetti(width, height * 0.9, 115, 12, 18, 40);
        firework(width * 0.14, height * 0.4);
        firework(width * 0.86, height * 0.38);
      });
    } else {
      at(0, () => {
        confetti(width * 0.5, height * 0.62, 90, 40, 20, 110);
        firework(width * 0.3, height * 0.3);
      });
      at(300, () => firework(width * 0.7, height * 0.28));
      at(650, () => {
        confetti(width * 0.5, -10, 270, 70, 4, 50);
        firework(width * 0.5, height * 0.18);
      });
    }

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const totalMs = preset === "congrats" ? 6500 : 5000;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 16.667, 2.5);
      last = now;
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        p.vx *= Math.pow(p.drag, dt);
        p.vy = p.vy * Math.pow(p.drag, dt) + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        p.wobble += p.wobbleSpeed * dt;

        if (p.life >= p.maxLife || p.y > height + 40) {
          particles.splice(i, 1);
          continue;
        }

        const fade = p.spark
          ? 1 - p.life / p.maxLife
          : Math.min(1, (p.maxLife - p.life) / 40);
        ctx.globalAlpha = Math.max(0, fade);

        if (p.spark && p.trail) {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 6) p.trail.shift();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.8;
          ctx.lineCap = "round";
          ctx.beginPath();
          p.trail.forEach((t, idx) => (idx === 0 ? ctx.moveTo(t.x, t.y) : ctx.lineTo(t.x, t.y)));
          ctx.stroke();
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(1, Math.cos(p.wobble));
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        } else if (p.shape === "ribbon") {
          ctx.fillRect(-p.size * 0.9, -p.size * 0.18, p.size * 1.8, p.size * 0.36);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawStar(ctx, p.size * 0.6);
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      elapsed += 16.667 * dt;
      if (particles.length > 0 || elapsed < totalMs * 0.35) {
        raf = requestAnimationFrame(frame);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [preset]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[1200]"
    />
  );
}
