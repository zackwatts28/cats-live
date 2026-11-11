# ADR 001: Run the poller as its own service

**Status:** accepted

## Context
The app needs to fetch the CATS feed on a fixed interval. Next.js could do this in a route handler or instrumentation hook.

## Decision
Run the poller as a separate Node process/container that writes to Redis. The web app only reads from Redis.

## Why
- Route handlers are request-scoped and may run on serverless platforms, so a long-lived loop isn't reliable there.
- Browsers and web instances never call CATS directly, so traffic to their servers stays constant (one poll per interval) no matter how many users visit.
- It sets up the Kafka step: the poller becomes a producer without changing the web app.

## Trade-offs
- One more service to build, deploy, and monitor.
- The snapshot type is duplicated between services for now. Extract a shared package if it grows.
