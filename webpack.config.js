const path = require('path');

module.exports = {
  mode: 'development',  // o 'production' para el build final

  entry: './src/index.js',  // Archivo de entrada principal

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  resolve: {
    extensions: ['.js'],
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
    ],
  },
};