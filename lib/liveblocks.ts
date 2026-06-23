'use client';

import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

/**
 * Liveblocks real-time config. Enabled only when a public key is present;
 * otherwise the app renders simulated presence (graceful, same pattern as the
 * AI features). Tokens are minted server-side at /api/liveblocks-auth.
 */
export const liveblocksEnabled = !!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

export type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
};

const client = createClient({ authEndpoint: '/api/liveblocks-auth' });

export const { RoomProvider, useOthers, useUpdateMyPresence, useSelf } =
  createRoomContext<Presence>(client);
