/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/ingreso', destination: '/movimientos/nuevo', permanent: false },
      { source: '/movimientos/ingreso', destination: '/movimientos/nuevo', permanent: false },
    ];
  },
};

export default nextConfig;
