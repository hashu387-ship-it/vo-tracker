import { Liveblocks } from '@liveblocks/node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLORS = ['#9E875D', '#6e5d3a', '#7a7363', '#b3a079', '#514f46'];

/**
 * Mints a Liveblocks access token for the current visitor. Returns 501 until
 * LIVEBLOCKS_SECRET_KEY is configured (multiplayer then activates automatically).
 */
export async function POST(req: Request) {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    return Response.json(
      { message: 'Liveblocks not configured. Set LIVEBLOCKS_SECRET_KEY to enable multiplayer.' },
      { status: 501 },
    );
  }

  const liveblocks = new Liveblocks({ secret });
  const { room } = (await req.json().catch(() => ({}))) as { room?: string };

  const id = `guest-${Math.floor(Math.random() * 100000)}`;
  const session = liveblocks.prepareSession(id, {
    userInfo: {
      name: `QS ${id.slice(-4)}`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    },
  });
  if (room) session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
