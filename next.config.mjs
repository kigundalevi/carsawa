/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://carsawa-backend-6zf3.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
