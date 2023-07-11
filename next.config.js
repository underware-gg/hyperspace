
// base canvas width is 640 (20 tiles * 32 pixels)
// maximum canvas screen width is 960, double to 1920
// thus canvas scale is: 1920/640 = 3x
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 480
const CANVAS_SCALE = 3
const DEPLOYED_URL = 'https://hyperspace.stage.fundaomental.com/'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true, // helps to debug React
  swcMinify: true,
  env: {
    ENV: process.env.ENV,
    DEV: (process.env.ENV === 'dev'),
    SERVER_URL: process.env.SERVER_URL,
    API_URL: process.env.API_URL ?? DEPLOYED_URL,
    DEPLOYED_URL,
    TILE_SIZE: 32,  // pixels
    CANVAS_WIDTH,   // pixels
    CANVAS_HEIGHT,  // pixels
    CANVAS_SCALE,
    RENDER_WIDTH: (CANVAS_WIDTH * CANVAS_SCALE),
    RENDER_HEIGHT: (CANVAS_HEIGHT * CANVAS_SCALE),
    SUPABASE_URL: 'https://kegzdrlxljinsutbdfla.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZ3pkcmx4bGppbnN1dGJkZmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njg3NDEzNzksImV4cCI6MTk4NDMxNzM3OX0.Qg--vv50J4XbmSkgIC_XLB5f-m6o8_iqUNCBaDe_35o',
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
