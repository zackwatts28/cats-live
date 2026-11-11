import { test } from "node:test";
import assert from "node:assert/strict";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { decodeVehiclePositions } from "./vehicles.js";

const { transit_realtime } = GtfsRealtimeBindings;

test("decodes vehicle positions and skips entities without a position", () => {
  const message = transit_realtime.FeedMessage.fromObject({
    header: { gtfsRealtimeVersion: "2.0", timestamp: 1_700_000_000 },
    entity: [
      {
        id: "e1",
        vehicle: {
          trip: { tripId: "t1", routeId: "9" },
          vehicle: { id: "2301", label: "2301" },
          position: { latitude: 35.2271, longitude: -80.8431, bearing: 90 },
          timestamp: 1_700_000_005,
        },
      },
      { id: "e2", vehicle: { vehicle: { id: "no-position" } } },
    ],
  });
  const bytes = transit_realtime.FeedMessage.encode(message).finish();

  const snapshot = decodeVehiclePositions(bytes, 123);

  assert.equal(snapshot.vehicles.length, 1);
  assert.equal(snapshot.vehicles[0]?.id, "2301");
  assert.equal(snapshot.vehicles[0]?.routeId, "9");
  assert.equal(snapshot.feedTimestamp, 1_700_000_000);
  assert.equal(snapshot.fetchedAt, 123);
});
