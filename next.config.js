/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose', 'bcryptjs'],
  images: {
    domains: ['cdn.example.com'],
  },
}

module.exports = nextConfig