const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',  // o 'production' para el build final

  entry: './src/index.js',  // Archivo de entrada principal

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

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

  plugins: [
    // Otras configuraciones, como HtmlWebpackPlugin, etc.
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets' } // Esto copia toda la carpeta 'assets' a 'dist/assets'
      ]
    })
  ],

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
        test: /\.css$/i,        // Para archivos CSS
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,  // Para fuentes y otros archivos de fuente
        type: 'asset/resource',
      },
    ],
  },
};