/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;

// Enables access to Cloudflare bindings (env, KV, etc.) while running
// `next dev` locally. Has no effect in production (Workers) builds.
if (process.env.NODE_ENV === "development") {
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}
