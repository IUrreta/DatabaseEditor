const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',  // o 'production' para el build final

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
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['@popperjs/core', 'default'],
      bootstrap: ['bootstrap'] 
    })
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