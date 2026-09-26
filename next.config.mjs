const nextConfig = {
  distDir: process.env.CONTRACT_SCROLL_PREVIEW === "1"
    ? ".next-contract-scroll-preview"
    : process.env.HERO_REBUILD === "1" ? ".next-hero-rebuild" : ".next",
  poweredByHeader: false,
  devIndicators: false,
  images: { formats: ["image/webp"], qualities: [75, 90] },
};
export default nextConfig;
