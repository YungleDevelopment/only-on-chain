/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploads-ssl.webflow.com",
      },
    ],
  },
};

export default nextConfig;
