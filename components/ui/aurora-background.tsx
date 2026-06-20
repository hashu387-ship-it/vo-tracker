'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Aurora + particle ambient background.
 * Layered animated radial gradients (CSS) plus a lightweight, reduced-motion-aware
 * particle canvas. Designed to sit fixed behind content.
 */
export function AuroraBackground({
  className,
  particles = true,
}: {
  className?: string;
  particles?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!particles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    let pts: P[] = [];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.floor((w * h) / 22000));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random() * 0.5 + 0.2,
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${p.a})`;
        ctx.fill();
      }
      // connective lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [particles]);

  return (
    <div className={cn('pointer-events-none fixed inset-0 overflow-hidden', className)}>
      {/* Aurora blobs */}
      <div className="absolute -left-[10%] -top-[15%] h-[55vh] w-[55vh] rounded-full bg-rsg-navy/20 blur-[140px] animate-aurora-1 dark:bg-indigo-600/25" />
      <div className="absolute right-[-5%] top-[5%] h-[45vh] w-[45vh] rounded-full bg-rsg-gold/15 blur-[130px] animate-aurora-2 dark:bg-amber-500/15" />
      <div className="absolute bottom-[-15%] left-[25%] h-[50vh] w-[50vh] rounded-full bg-sky-500/10 blur-[150px] animate-aurora-3 dark:bg-cyan-500/15" />
      <div className="absolute bottom-[10%] right-[15%] h-[35vh] w-[35vh] rounded-full bg-violet-500/10 blur-[120px] animate-aurora-1 dark:bg-violet-600/15" />

      {/* Particle field */}
      {particles && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />
      )}

      {/* Grain / vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background))_100%)]" />
    </div>
  );
}
