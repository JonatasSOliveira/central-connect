import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
  rewrites: async () => {
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!firebaseProjectId) {
      return [];
    }

    const firebaseAppDomain = `https://${firebaseProjectId}.firebaseapp.com`;

    return [
      {
        source: "/__/auth/:path*",
        destination: `${firebaseAppDomain}/__/auth/:path*`,
      },
      {
        source: "/__/firebase/init.json",
        destination: `${firebaseAppDomain}/__/firebase/init.json`,
      },
    ];
  },
  experimental: {
    serverSourceMaps: true,
  },
};

export default nextConfig;
