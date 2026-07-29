/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['@libsql/client', 'exceljs'],
  eslint: {
    // Lint is run explicitly in CI via `npm run lint`; don't fail the build twice.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
