/** @type {import('next').NextConfig} */
export const config = {
  reactStrictMode: true, 
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    config.resolve.fallback = { zlib: false };
    return config;
  },

}
