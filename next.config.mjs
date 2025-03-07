/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-quill"],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  }
};

export default nextConfig;