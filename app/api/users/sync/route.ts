// User sync is now handled server-side via lib/get-user.ts (requireUser / getCurrentUser).
// This route is no longer needed but kept to avoid 404s during any cached client calls.
export async function POST() {
  return Response.json({ ok: true })
}
