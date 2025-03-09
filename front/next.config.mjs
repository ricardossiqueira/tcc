import nextMdx from "@next/mdx";

const withMdx = nextMdx({
  // By default only the `.mdx` extension is supported.
  extension: /\.mdx?$/,
  options: {
    /* otherOptions… */
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = withMdx({
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'kokonutui.com',
      }
    ],
    dangerouslyAllowSVG: true,
  },
});

export default nextConfig;