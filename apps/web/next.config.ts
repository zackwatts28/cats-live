import type { NextConfig } from "next";

const config: NextConfig = {
  // Produces a minimal server bundle, which keeps the Docker image small.
  output: "standalone",
};

export default config;
