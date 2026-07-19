/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // youtube-dl-exec locates its yt-dlp binary via __dirname, which breaks
  // when bundled — load it as a regular Node package instead.
  serverExternalPackages: ['youtube-dl-exec'],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
