/**
 * Replaced TypeScript config with JS as Next.js does not support next.config.ts in this setup.
 * See error: "Configuring Next.js via 'next.config.ts' is not supported."
 */
module.exports = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  }
};