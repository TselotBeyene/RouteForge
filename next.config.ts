import type { NextConfig } from "next";

const backend =
  process.env.BACKEND_URL ||
  process.env.FRONTEND_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8484";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["swagger-ui-react"],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
      {
        source: "/actuator/:path*",
        destination: `${backend}/actuator/:path*`,
      },
      {
        source: "/v3/api-docs/:path*",
        destination: `${backend}/v3/api-docs/:path*`,
      },
      {
        source: "/swagger-ui/:path*",
        destination: `${backend}/swagger-ui/:path*`,
      },
    ];
  },
};

export default nextConfig;