import GtfsRealtimeBindings from "gtfs-realtime-bindings";

const { transit_realtime } = GtfsRealtimeBindings;

export interface Vehicle {
  id: string;
  label: string | null;
  routeId: string | null;
  tripId: string | null;
  lat: number;
  lon: number;
  bearing: number | null;
  speedMps: number | null;
  /** Unix seconds, as reported by the vehicle. */
  timestamp: number | null;
}

export interface VehicleSnapshot {
  /** Unix seconds from the feed header. */
  feedTimestamp: number | null;
  /** Unix ms when our poller stored this snapshot. */
  fetchedAt: number;
  vehicles: Vehicle[];
}

/** Protobuf optional fields come back as null/undefined/0 depending on the field; normalize them. */
const num = (v: unknown): number | null =>
  v === null || v === undefined ? null : Number(v);

export function decodeVehiclePositions(
  buffer: Uint8Array,
  fetchedAt: number = Date.now(),
): VehicleSnapshot {
  const feed = transit_realtime.FeedMessage.decode(buffer);
  const vehicles: Vehicle[] = [];

  for (const entity of feed.entity) {
    const v = entity.vehicle;
    if (!v?.position) continue;

    vehicles.push({
      id: v.vehicle?.id || entity.id,
      label: v.vehicle?.label || null,
      routeId: v.trip?.routeId || null,
      tripId: v.trip?.tripId || null,
      lat: v.position.latitude,
      lon: v.position.longitude,
      bearing: num(v.position.bearing),
      speedMps: num(v.position.speed),
      timestamp: num(v.timestamp),
    });
  }

  return {
    feedTimestamp: num(feed.header.timestamp),
    fetchedAt,
    vehicles,
  };
}
