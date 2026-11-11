"use client";

import { useEffect, useMemo, useState } from "react";
import type { VehicleSnapshot } from "@/lib/types";

const REFRESH_MS = 10_000;

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; snapshot: VehicleSnapshot };

function secondsAgo(ms: number, now: number): number {
  return Math.max(0, Math.round((now - ms) / 1000));
}

export function VehicleBoard() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [route, setRoute] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/vehicles", { cache: "no-store" });
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ kind: "error", message: body.error ?? "Something went wrong." });
        } else {
          setState({ kind: "ready", snapshot: body as VehicleSnapshot });
        }
      } catch {
        if (!cancelled) setState({ kind: "error", message: "Could not reach the server." });
      }
    }

    void load();
    const refresh = setInterval(load, REFRESH_MS);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, []);

  const vehicles = useMemo(() => {
    if (state.kind !== "ready") return [];
    const q = route.trim().toLowerCase();
    const all = state.snapshot.vehicles;
    const filtered = q ? all.filter((v) => (v.routeId ?? "").toLowerCase().includes(q)) : all;
    return [...filtered].sort((a, b) =>
      (a.routeId ?? "~").localeCompare(b.routeId ?? "~", undefined, { numeric: true }),
    );
  }, [state, route]);

  if (state.kind === "loading") {
    return <p role="status">Loading live vehicles…</p>;
  }

  if (state.kind === "error") {
    return (
      <p role="alert" className="notice">
        {state.message} Check that the poller is running with <code>docker compose logs poller</code>.
      </p>
    );
  }

  const { snapshot } = state;
  const age = secondsAgo(snapshot.fetchedAt, now);

  return (
    <section aria-labelledby="board-heading">
      <h2 id="board-heading" className="visually-hidden">
        Vehicles
      </h2>

      <div className="toolbar">
        <label>
          Filter by route
          <input
            type="search"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder="e.g. 9 or 501"
          />
        </label>
        <p role="status" className={age > 90 ? "stale" : undefined}>
          {vehicles.length} of {snapshot.vehicles.length} vehicles · updated {age}s ago
          {age > 90 ? " (data may be out of date)" : ""}
        </p>
      </div>

      {vehicles.length === 0 ? (
        <p className="notice">No vehicles match that route.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="visually-hidden">Live vehicle positions</caption>
            <thead>
              <tr>
                <th scope="col">Route</th>
                <th scope="col">Vehicle</th>
                <th scope="col">Latitude</th>
                <th scope="col">Longitude</th>
                <th scope="col">Speed (mph)</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <th scope="row">{v.routeId ?? "—"}</th>
                  <td>{v.label ?? v.id}</td>
                  <td>{v.lat.toFixed(5)}</td>
                  <td>{v.lon.toFixed(5)}</td>
                  <td>{v.speedMps === null ? "—" : (v.speedMps * 2.23694).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
