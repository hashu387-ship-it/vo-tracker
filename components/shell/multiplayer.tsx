'use client';

import { useEffect } from 'react';
import {
  liveblocksEnabled,
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
} from '@/lib/liveblocks';
import { PresenceStack } from './presence';

/**
 * Wraps children in a Liveblocks room when configured; otherwise renders them
 * untouched (simulated presence). Swap `liveblocksEnabled` on by setting
 * NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY + LIVEBLOCKS_SECRET_KEY.
 */
export function RoomBoundary({ roomId, children }: { roomId: string; children: React.ReactNode }) {
  if (!liveblocksEnabled) return <>{children}</>;
  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null, name: 'You', color: '#9E875D' }}>
      {children}
    </RoomProvider>
  );
}

/** Presence avatars — live from Liveblocks when enabled, simulated otherwise. */
export function LivePresence({ compact = false }: { compact?: boolean }) {
  if (!liveblocksEnabled) return <PresenceStack compact={compact} />;
  return <LiveAvatars compact={compact} />;
}

function LiveAvatars({ compact }: { compact?: boolean }) {
  const others = useOthers();
  const size = compact ? 28 : 32;
  const shown = others.slice(0, 5);
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {shown.map((o) => {
          const info = (o.info as { name?: string; color?: string } | undefined) ?? {};
          const name = info.name ?? 'Guest';
          return (
            <div
              key={o.connectionId}
              title={`${name} · online`}
              className="flex items-center justify-center rounded-full border-2 border-cream text-[10px] font-bold text-white shadow-sm"
              style={{ width: size, height: size, background: info.color ?? '#6e5d3a' }}
            >
              {name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          );
        })}
      </div>
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        {others.length + 1} editing live
      </span>
    </div>
  );
}

/** Live multiplayer cursors. Renders nothing unless Liveblocks is enabled. */
export function LiveCursors() {
  if (!liveblocksEnabled) return null;
  return <CursorLayer />;
}

function CursorLayer() {
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();

  useEffect(() => {
    const onMove = (e: PointerEvent) =>
      updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } });
    const onLeave = () => updateMyPresence({ cursor: null });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [updateMyPresence]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      {others.map((o) => {
        const cursor = o.presence?.cursor as { x: number; y: number } | null | undefined;
        if (!cursor) return null;
        const info = (o.info as { name?: string; color?: string } | undefined) ?? {};
        const color = info.color ?? '#9E875D';
        return (
          <div
            key={o.connectionId}
            className="absolute transition-transform duration-75"
            style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
              <path d="M5 3l15 8-6 2-2 6-7-16z" />
            </svg>
            <span
              className="ml-3 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ background: color }}
            >
              {info.name ?? 'Guest'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
