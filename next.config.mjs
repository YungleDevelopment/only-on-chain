/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Modify the entry configuration safely
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries =
          typeof originalEntry === "function"
            ? await originalEntry()
            : originalEntry;
        return {
          ...entries,
          widgets: "./app/widgets-entry.tsx",
        };
      };
    }
    return config;
  },
  // Ensure all necessary files are treated as static assets
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
