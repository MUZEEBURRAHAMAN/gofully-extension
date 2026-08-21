/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["fabric", "canvas", "tesseract.js", "jspdf", "cropperjs"],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
