import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-23229de4-433d-4320-9de5-16c39534cd62.space.z.ai",
  ],
};

export default nextConfig;
