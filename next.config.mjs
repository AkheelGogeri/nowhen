/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;