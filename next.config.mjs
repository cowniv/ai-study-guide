/** @type {import('next').NextConfig} */
const nextConfig = {
  // keep the SDK on the server only
  serverExternalPackages: ["@anthropic-ai/sdk"],
