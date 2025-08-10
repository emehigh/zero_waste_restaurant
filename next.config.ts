import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['res.cloudinary.com'], // Add this line to allow Cloudinary images
  },
};

export default nextConfig;
