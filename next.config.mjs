/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://carsawa-backend-6zf3.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
