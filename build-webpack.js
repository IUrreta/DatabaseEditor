const webpack = require('webpack');
const createConfig = require('./webpack.config');

const mode = process.argv[2] || process.env.NODE_ENV || 'development';

process.env.NODE_ENV = mode;

const config = createConfig({}, { mode });

webpack(config, (err, stats) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const info = stats.toString({
    all: false,
    assets: true,
    chunks: true,
    colors: true,
    errors: true,
    warnings: true,
    timings: true,
  });

  if (info) {
    console.log(info);
  }

  if (stats.hasErrors()) {
    process.exit(1);
  }
});
