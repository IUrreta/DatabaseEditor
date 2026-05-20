const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = (env, argv) => {
  const mode = argv.mode || process.env.NODE_ENV || 'development';
  const isDevelopment = mode === 'development';

  return {
    mode,
    devtool: isDevelopment ? 'source-map' : false,

    entry: './src/index.js',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      clean: true,
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html'
      }),
      new MiniCssExtractPlugin({
        filename: 'styles.css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'assets/images',
            to: 'assets/images'
          },
          {
            from: 'src/data',
            to: 'data'
          }
        ]
      }),
      new webpack.DefinePlugin({
        APP_VERSION: JSON.stringify(packageJson.version),
        BUILD_ID: JSON.stringify(
          process.env.BUILD_ID ||
          process.env.VERCEL_DEPLOYMENT_ID ||
          'local'
        ),
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.PATREON_CLIENT_ID': JSON.stringify(process.env.PATREON_CLIENT_ID),
        'process.env.PATREON_REDIRECT_URI': JSON.stringify(process.env.PATREON_REDIRECT_URI),
      })
    ],

    resolve: {
      extensions: ['.js'],
      fallback: {
        buffer: require.resolve('buffer/'),
        "vm": false,
        "stream": false,
        "fs": false,
        "path": false,
        "crypto": false,
      },
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name][ext]',
          },
        },
      ],
    },
  };
};
