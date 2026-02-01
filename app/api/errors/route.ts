import { NextResponse } from "next/server";
import { getEvents } from "../../../lib/events";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const events = getEvents();
  const errors = events.filter((e) => e.error && e.error.category);
  const grouped = errors.reduce((acc, e) => {
    const key = e.error?.category;
    if (!key) return acc;
    if (category && key !== category) return acc;
    if (!acc[key]) acc[key] = { category: key, count: 0, lastOccurrence: 0 };
    acc[key].count += 1;
    acc[key].lastOccurrence = Math.max(acc[key].lastOccurrence, e.timestamp);
    return acc;
  }, {} as Record<string, { category: string; count: number; lastOccurrence: number }>);

  return NextResponse.json({ byCategory: Object.values(grouped) });
}
