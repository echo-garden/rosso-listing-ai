/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['163.44.117.18'],
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  }
};

export default nextConfig;
