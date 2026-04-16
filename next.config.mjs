import { withContentlayer } from 'next-contentlayer2'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.brickset.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.lego.com' },
      { protocol: 'https', hostname: 'cdn.rebrickable.com' },
    ],
  },
  experimental: { mdxRs: true },
}

export default withContentlayer(nextConfig)
