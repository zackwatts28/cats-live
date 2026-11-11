// Mirrors the snapshot written by services/poller. When this grows, move it
// into a shared package so the two services can't drift apart.
export interface Vehicle {
  id: string;
  label: string | null;
  routeId: string | null;
  tripId: string | null;
  lat: number;
  lon: number;
  bearing: number | null;
  speedMps: number | null;
  timestamp: number | null;
}

export interface VehicleSnapshot {
  feedTimestamp: number | null;
  fetchedAt: number;
  vehicles: Vehicle[];
}
