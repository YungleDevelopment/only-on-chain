/** @type {import('next').NextConfig} */
const nextConfig = {
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
