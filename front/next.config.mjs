/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  // Next.jsはデフォルトでは外部ドメインからの画像取得を制限しているので、
  // Firebase Storage（Google Cloud Storage）からの画像取得を許可するために記述
  images: {
    domains: ['localhost',  'storage.googleapis.com'],
  },
}

export default nextConfig
