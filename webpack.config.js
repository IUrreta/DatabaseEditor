const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const packageJson = require('./package.json');


module.exports = {
  mode: 'development', // Cambia a 'production' para producción

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
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'assets/images', // ajusta esta ruta a donde tengas tus imágenes
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