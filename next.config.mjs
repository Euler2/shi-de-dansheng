/** @type {import('next').NextConfig} */
const isCapacitor = process.env.CAPACITOR === "1";

const nextConfig = {
  ...(isCapacitor ? { output: "export" } : {}),
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
