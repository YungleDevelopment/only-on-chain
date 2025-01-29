/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Add a new entry point for widgets
      config.entry = {
        ...config.entry,
        widgets: {
          import: "./app/widgets-entry.ts",
          filename: "widgets.js",
        },
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
