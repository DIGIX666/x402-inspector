import { NextResponse } from "next/server";
import { getEvents } from "../../../lib/events";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);
  const offset = Math.max(Number(searchParams.get("offset") || 0), 0);
  const type = searchParams.get("type") || "";
  const endpoint = searchParams.get("endpoint") || "";

  let filtered = getEvents();
  if (type) filtered = filtered.filter((e) => e.event_type === type);
  if (endpoint) filtered = filtered.filter((e) => e.endpoint === endpoint);

  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit).reverse();
  return NextResponse.json({ events: items, total });
}
