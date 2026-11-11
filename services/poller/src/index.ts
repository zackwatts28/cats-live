import { Redis } from "ioredis";
import { decodeVehiclePositions } from "./vehicles.js";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 20_000);
const VEHICLE_POSITIONS_URL =
  process.env.VEHICLE_POSITIONS_URL ??
  "https://gtfsrealtime.ridetransit.org/GTFSRealTime/Vehicle/VehiclePositions.pb";

// The CATS feed refreshes about every 20s. Don't hammer their servers.
if (!(POLL_INTERVAL_MS >= 10_000)) {
  throw new Error("POLL_INTERVAL_MS must be at least 10000");
}

export const LATEST_KEY = "vehicles:latest";
// If the poller dies, stale data should disappear instead of looking live.
const TTL_SECONDS = 120;

const redis = new Redis(REDIS_URL);
redis.on("error", (err: Error) => console.error("[redis]", err.message));

async function pollOnce(): Promise<void> {
  const res = await fetch(VEHICLE_POSITIONS_URL, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Feed responded ${res.status}`);

  const bytes = new Uint8Array(await res.arrayBuffer());
  const snapshot = decodeVehiclePositions(bytes);

  await redis.set(LATEST_KEY, JSON.stringify(snapshot), "EX", TTL_SECONDS);
  console.log(`[poller] stored ${snapshot.vehicles.length} vehicles`);
}

let stopping = false;

async function main(): Promise<void> {
  console.log(`[poller] polling every ${POLL_INTERVAL_MS}ms`);
  while (!stopping) {
    try {
      await pollOnce();
    } catch (err) {
      // One bad poll shouldn't kill the worker.
      console.error("[poller] poll failed:", err instanceof Error ? err.message : err);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

function shutdown(): void {
  stopping = true;
  redis.quit().finally(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

void main();
