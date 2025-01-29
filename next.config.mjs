/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Modify the client-side entry point
      const originalEntry = config.entry
      config.entry = async () => {
        const entries = await originalEntry()
        if (entries["main.js"] && !entries["main.js"].includes("./app/widgets/page.tsx")) {
          entries["main.js"].push("./app/widgets/page.tsx")
        }
        return entries
      }
    }
    return config
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
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
