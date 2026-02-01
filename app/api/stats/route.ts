import { NextResponse } from "next/server";
import { getEvents } from "../../../lib/events";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = getEvents();
  const total = events.length;
  const success = events.filter((e) => e.event_type === "payment_success");
  const successRate = total ? success.length / total : 0;
  const totalVolume = success.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalRevenue = totalVolume;

  const volumeByEndpoint = Object.values(
    success.reduce((acc, e) => {
      if (!acc[e.endpoint]) {
        acc[e.endpoint] = { endpoint: e.endpoint, count: 0, revenue: 0 };
      }
      acc[e.endpoint].count += 1;
      acc[e.endpoint].revenue += e.amount || 0;
      return acc;
    }, {} as Record<string, { endpoint: string; count: number; revenue: number }>)
  );

  return NextResponse.json({ successRate, totalVolume, totalRevenue, volumeByEndpoint });
}
