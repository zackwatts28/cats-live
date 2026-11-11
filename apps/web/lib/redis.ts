import { Redis } from "ioredis";

// Reuse one connection across hot reloads in dev.
const globalForRedis = globalThis as unknown as { redis?: Redis };

function createClient(): Redis {
  const client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 2,
    // Don't connect at import time (e.g. during `next build`); connect on first command.
    lazyConnect: true,
  });
  client.on("error", (err: Error) => console.error("[redis]", err.message));
  return client;
}

export const redis: Redis = globalForRedis.redis ?? createClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export const LATEST_KEY = "vehicles:latest";
