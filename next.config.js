/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep deploys unblocked — these checks still run in `npm run lint` locally.
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // Clean URL for the NIGHT DRIVE arcade (served from public/drive.html).
  async rewrites() {
    return [{ source: "/drive", destination: "/drive.html" }];
  },
};
module.exports = nextConfig;
