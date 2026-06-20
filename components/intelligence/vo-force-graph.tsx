'use client';

import { useEffect, useRef, useState } from 'react';
import {
  variationOrders,
  VO_STATUS,
  VO_STATUS_ORDER,
  statusKeyOf,
  formatCompact,
  type VOStatusKey,
} from '@/lib/data/commercial';

interface SimNode {
  id: string;
  kind: 'hub' | 'vo';
  status: VOStatusKey;
  label: string;
  subject?: string;
  value?: number;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hubIndex: number; // index of linked hub (self for hubs)
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Force-directed VO relationship graph — status hubs with their variation orders
 * orbiting on a hand-rolled spring/charge simulation. Nodes react to the cursor.
 * Canvas-based, self-contained, no external graph library.
 */
export function VoForceGraph() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: SimNode } | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = wrap.clientWidth || 600;
    const H = 380;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setSize = () => {
      W = wrap.clientWidth || 600;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    // Build nodes: one hub per active status + a node per VO linked to its hub.
    const hubsKeys = VO_STATUS_ORDER.filter((k) => variationOrders.some((v) => statusKeyOf(v) === k));
    const nodes: SimNode[] = [];
    const hubIndexByKey: Record<string, number> = {};
    hubsKeys.forEach((k, i) => {
      const angle = (i / hubsKeys.length) * Math.PI * 2;
      hubIndexByKey[k] = nodes.length;
      nodes.push({
        id: `hub-${k}`,
        kind: 'hub',
        status: k,
        label: VO_STATUS[k].short,
        r: 13,
        x: W / 2 + Math.cos(angle) * 120 + (Math.random() - 0.5) * 20,
        y: H / 2 + Math.sin(angle) * 90 + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        hubIndex: -1,
      });
    });
    hubsKeys.forEach((k) => (nodes[hubIndexByKey[k]].hubIndex = hubIndexByKey[k]));

    const maxVal = Math.max(...variationOrders.map((v) => Math.abs(v.value ?? v.rsgAssessment ?? v.costProposal ?? 0)), 1);
    variationOrders.forEach((v) => {
      const k = statusKeyOf(v);
      const hub = nodes[hubIndexByKey[k]];
      const val = Math.abs(v.value ?? v.rsgAssessment ?? v.costProposal ?? 0);
      nodes.push({
        id: `vo-${v.sno}`,
        kind: 'vo',
        status: k,
        label: v.voNumber ?? `#${v.sno}`,
        subject: v.subject,
        value: v.value ?? v.rsgAssessment ?? v.costProposal ?? 0,
        r: 3 + (val / maxVal) * 7,
        x: hub.x + (Math.random() - 0.5) * 60,
        y: hub.y + (Math.random() - 0.5) * 60,
        vx: 0,
        vy: 0,
        hubIndex: hubIndexByKey[k],
      });
    });

    const mouse = { x: -9999, y: -9999, active: false };
    let hovered: SimNode | null = null;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      let best: SimNode | null = null;
      let bestD = 16 * 16;
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d = dx * dx + dy * dy;
        if (d < (n.r + 6) * (n.r + 6) && d < bestD) {
          bestD = d;
          best = n;
        }
      }
      hovered = best;
      if (best) setTooltip({ x: best.x, y: best.y, node: best });
      else setTooltip(null);
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
      hovered = null;
      setTooltip(null);
    };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    const isDark = () => document.documentElement.classList.contains('dark');

    const step = () => {
      // Forces
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        // repulsion
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 0.01) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            d2 = 0.01;
          }
          const d = Math.sqrt(d2);
          const rep = (a.kind === 'hub' || b.kind === 'hub' ? 1400 : 380) / d2;
          const fx = (dx / d) * rep;
          const fy = (dy / d) * rep;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
        // centering
        a.vx += (W / 2 - a.x) * (a.kind === 'hub' ? 0.004 : 0.0015);
        a.vy += (H / 2 - a.y) * (a.kind === 'hub' ? 0.004 : 0.0015);
        // cursor repulsion
        if (mouse.active) {
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (110 - d) * 0.22;
            a.vx += (dx / d) * f;
            a.vy += (dy / d) * f;
          }
        }
      }
      // springs to hub
      for (const n of nodes) {
        if (n.kind === 'vo') {
          const hub = nodes[n.hubIndex];
          const dx = hub.x - n.x;
          const dy = hub.y - n.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = (d - 78) * 0.018;
          n.vx += (dx / d) * f;
          n.vy += (dy / d) * f;
        }
      }
      // integrate
      for (const n of nodes) {
        n.vx = clamp(n.vx * 0.86, -25, 25);
        n.vy = clamp(n.vy * 0.86, -25, 25);
        n.x = clamp(n.x + n.vx, n.r, W - n.r);
        n.y = clamp(n.y + n.vy, n.r, H - n.r);
      }

      // Draw
      ctx.clearRect(0, 0, W, H);
      const dark = isDark();
      // edges
      for (const n of nodes) {
        if (n.kind === 'vo') {
          const hub = nodes[n.hubIndex];
          const hot = hovered && (hovered === n || hovered === hub);
          ctx.strokeStyle = VO_STATUS[n.status].hex + (hot ? 'cc' : '22');
          ctx.lineWidth = hot ? 1.6 : 0.6;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(hub.x, hub.y);
          ctx.stroke();
        }
      }
      // nodes
      for (const n of nodes) {
        const hex = VO_STATUS[n.status].hex;
        const dim = hovered && hovered.status !== n.status;
        ctx.globalAlpha = dim ? 0.25 : 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = hex;
        ctx.fill();
        if (n.kind === 'hub') {
          ctx.lineWidth = 2;
          ctx.strokeStyle = dark ? '#0a0a0a' : '#ffffff';
          ctx.stroke();
          ctx.globalAlpha = dim ? 0.3 : 1;
          ctx.fillStyle = dark ? '#e5e7eb' : '#1f2937';
          ctx.font = '600 10px ui-sans-serif, system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(n.label, n.x, n.y - n.r - 4);
        }
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const ro = new ResizeObserver(() => setSize());
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height: 380 }}>
      <canvas ref={canvasRef} className="block h-full w-full cursor-pointer" />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 w-max max-w-[260px] -translate-x-1/2 -translate-y-full rounded-lg border border-white/15 bg-white/95 px-2.5 py-1.5 text-[11px] shadow-xl backdrop-blur-xl dark:bg-zinc-900/95"
          style={{ left: tooltip.x, top: tooltip.y - 10 }}
        >
          <p className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-100">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: VO_STATUS[tooltip.node.status].hex }} />
            {tooltip.node.kind === 'hub' ? VO_STATUS[tooltip.node.status].label : tooltip.node.label}
          </p>
          {tooltip.node.kind === 'vo' && (
            <p className="mt-0.5 text-slate-500 dark:text-zinc-400">
              {tooltip.node.subject} · {formatCompact(tooltip.node.value ?? 0)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
