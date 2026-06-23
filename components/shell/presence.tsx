'use client';

/**
 * Live multiplayer presence indicators.
 *
 * Currently renders simulated collaborators so the UI is complete. To go live,
 * wrap the app in a Liveblocks RoomProvider and replace `COLLABORATORS` with
 * `useOthers()` + `useSelf()` — the avatar markup below stays identical.
 */
const COLLABORATORS = [
  { name: 'Roomy H.', initials: 'RH', color: '#9E875D' },
  { name: 'A. Khan', initials: 'AK', color: '#6e5d3a' },
  { name: 'S. Patel', initials: 'SP', color: '#7a7363' },
];

export function PresenceStack({ compact = false }: { compact?: boolean }) {
  const size = compact ? 28 : 32;
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {COLLABORATORS.map((c) => (
          <div
            key={c.initials}
            title={`${c.name} · online`}
            className="flex items-center justify-center rounded-full border-2 border-cream text-[10px] font-bold text-white shadow-sm"
            style={{ width: size, height: size, background: c.color }}
          >
            {c.initials}
          </div>
        ))}
      </div>
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        {COLLABORATORS.length} editing live
      </span>
    </div>
  );
}
