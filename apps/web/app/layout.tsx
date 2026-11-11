import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Charlotte Transit Live",
  description: "Live CATS bus and light rail vehicle positions, built on public GTFS-Realtime data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
