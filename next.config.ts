import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Resolve modules from this folder (avoids looking in C:\Users\jayde)
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      { source: "/guides/jb-fork", destination: "/guides/jb-tray", permanent: true },
      { source: "/guides/jb-fork/:path*", destination: "/guides/jb-tray", permanent: true },
    ];
  },
};

export default nextConfig;
