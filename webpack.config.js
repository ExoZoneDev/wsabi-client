var webpack = require('webpack');

var path = require("path");

module.exports = {
  entry: {
    "wsabi-client": "./ts/index.ts",
    "wsabi-client.min": "./ts/index.ts"
  },
  output: {
    path: "./dist",
    filename: "[name].js"
  },
  devtool: 'source-map',
  resolve: {
    root: [path.join(__dirname)],
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.scss$/, loaders: ["style/useable", "css", "sass"] }
    ]
  },
  node: {
    "tls": "empty",
    "fs": "empty"
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
      compress: {
        warnings: false
      },
      screwIe8: true
    })
  ]
};
