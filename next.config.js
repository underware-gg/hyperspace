
// base canvas width is 640 (20 tiles * 32 pixels)
// maximum canvas screen width is 960, double to 1920
// thus canvas scale is: 1920/640 = 3x
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 480
const CANVAS_SCALE = 3

/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true, // helps to debug React
  swcMinify: true,
  env: {
    ENV: process.env.ENV,
    DEV: (process.env.ENV === 'dev'),
    SERVER_URL: process.env.SERVER_URL,
    CLIENT_URL: 'https://hyperspace.stage.fundaomental.com/',
    TILE_SIZE: 32,  // pixels
    CANVAS_WIDTH,   // pixels
    CANVAS_HEIGHT,  // pixels
    CANVAS_SCALE,
    RENDER_WIDTH: (CANVAS_WIDTH * CANVAS_SCALE),
    RENDER_HEIGHT: (CANVAS_HEIGHT * CANVAS_SCALE),
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(png|gif|woff|woff2|eot|ttf|svg)$/,
      loader: 'file-loader',
    })

    // follow linked dependencies
    // https://github.com/webpack/webpack/issues/11612#issuecomment-1448208868
    // https://webpack.js.org/configuration/
    config.snapshot.managedPaths = []
    config.watchOptions.followSymlinks = true
    config.resolve.symlinks = false

    return config
  },

  // for react-textarea-code-editor
  experimental: { esmExternals: true }
}

// react-textarea-code-editor
// https://uiwjs.github.io/react-textarea-code-editor/
const removeImports = require('next-remove-imports')()
module.exports = removeImports(nextConfig)


// module.exports = nextConfig
