// Lightweight health check for Render. Returns instantly with no dependencies
// or rendering, so Render's health probe never times out on a heavy homepage
// (which can cause restart/crash loops).
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true });
}
