/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ["192.168.0.110"],
};

export default nextConfig;