const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const webpack = require('webpack');
const packageJson = require('./package.json');


module.exports = {
  mode: 'production',

  entry: './src/index.js',  // Archivo de entrada principal

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Path a tu HTML original
      filename: 'index.html'       // El HTML generado irá a 'dist/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
    new ImageMinimizerPlugin({
      // (1) Indica que vas a utilizar sharpMinify en lugar de imagemin
      minimizer: {
        implementation: ImageMinimizerPlugin.sharpMinify,
        options: {
          // (2) encodeOptions define cómo quieres comprimir
          encodeOptions: {
            // Convierte/optimiza PNG
            png: {
              quality: 80, // 0-100
              compressionLevel: 8,
              adaptiveFiltering: true,
            },
            // Convierte/optimiza JPG
            jpeg: {
              quality: 80, // 0-100
            },
            // Convierte/optimiza WebP (si quieres forzar conversión a WebP, ver más abajo)
            webp: {
              quality: 80,
            },
            // etc.
          },
        },
      },
    }),
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(packageJson.version),
    }),
  ],

  resolve: {
    extensions: ['.js'],
    fallback: {
      // Si tu código usa 'buffer' (p.ej. new Buffer o Buffer.from)
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
        use: [MiniCssExtractPlugin.loader, 'css-loader'], // Usa el plugin en lugar de 'style-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]',  // Copia las imágenes en dist/assets/images
        },
      },
    ],
  },
};