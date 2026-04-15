// Sign-out is handled by Stack Auth (app.signOut() on the client).
// This route is no longer needed but kept to avoid 404s during any cached client calls.
export async function POST() {
  return Response.json({ ok: true })
}
