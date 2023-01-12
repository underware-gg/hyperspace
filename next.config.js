/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    DEFAULT_TILESET: '/tilesets/library.png',
    TILESETS: JSON.stringify([
      '/tilesets/library.png',
      '/tilesets/dungeon.png',
      '/tilesets/warehouse.png',
    ]),
  },
}

module.exports = nextConfig
