/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "", // will be either '/safe' or ''
};

// configure next.config.js for static export
// exclude API routes from static export by leveraging the pageExtensions option
// configure webpack for tighter build
if (process.env.STATIC_EXPORT) {
  nextConfig.output = "export";
  nextConfig.pageExtensions = ["jsx", "tsx"];
  nextConfig.webpack = (config, { isServer, webpack }) => {
    if (!isServer) {
      // Force Webpack to produce only one chunk using LimitChunkCountPlugin.
      // This should bundle all client-side JS together.
      const webpack = require("webpack");
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        })
      );
    }
    return config;
  };
}

module.exports = nextConfig;
