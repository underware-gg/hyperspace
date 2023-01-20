/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    ENV: process.env.ENV,
    
    // base canvas width is 640 (20 tiles * 32 pixels)
    // maximum canvas screen width is 960, double to 1920
    // thus canvas scale is: 1920/640 = 3x
    CANVAS_WIDTH: (640 * 3),
    CANVAS_HEIGHT: (480 * 3),
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
