
// base canvas width is 640 (20 tiles * 32 pixels)
// maximum canvas screen width is 960, double to 1920
// thus canvas scale is: 1920/640 = 3x
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 480
const CANVAS_SCALE = 3

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    ENV: process.env.ENV,
    BASE_TILE_WIDTH: 20,  // tiles
    BASE_TILE_HEIGHT: 15, // tiles
    BASE_TILE_SIZE: 32,   // pixels
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    CANVAS_SCALE,
    RENDER_WIDTH: (CANVAS_WIDTH * CANVAS_SCALE),
    RENDER_HEIGHT: (CANVAS_HEIGHT * CANVAS_SCALE),
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(png|gif|woff|woff2|eot|ttf|svg)$/,
      loader: 'file-loader',
    })

    return config
  },
}

module.exports = nextConfig
