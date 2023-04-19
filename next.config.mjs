/** @type {import('next').NextConfig} */
export const config = {
  reactStrictMode: true, 
  api: {
    responseLimit: false,
  },
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    config.resolve.fallback = { zlib: false };
    config.resolve.fallback = { path: false };
    config.resolve.fallback = { child_process: false };

    return config;
  },

}
