import { NextResponse } from "next/server";
import { LATEST_KEY, redis } from "@/lib/redis";
import type { VehicleSnapshot } from "@/lib/types";

// Always read fresh data from Redis; never cache this at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await redis.get(LATEST_KEY);
    if (!raw) {
      return NextResponse.json(
        { error: "No live data yet. The poller may be starting up or the feed may be down." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    const snapshot = JSON.parse(raw) as VehicleSnapshot;
    return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[api/vehicles]", err);
    return NextResponse.json(
      { error: "Could not reach the data store." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
