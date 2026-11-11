import { VehicleBoard } from "@/components/VehicleBoard";

export default function Home() {
  return (
    <main>
      <header className="masthead">
        <h1>Charlotte Transit Live</h1>
        <p>
          Every CATS bus and train currently reporting its position, refreshed about every 20
          seconds from the agency&apos;s public data feed.
        </p>
      </header>
      <VehicleBoard />
      <footer className="colophon">
        Data: Charlotte Area Transit System (GTFS-Realtime). This is an independent project and is
        not affiliated with CATS.
      </footer>
    </main>
  );
}
