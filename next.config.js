/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['*.leyton-cognitx.com', 'leyton-cognitx.com'],
};

module.exports = nextConfig;
