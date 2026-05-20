const webpack = require('webpack');
const createConfig = require('./webpack.config');

const mode = process.argv[2] || process.env.NODE_ENV || 'development';

process.env.NODE_ENV = mode;

const config = createConfig({}, { mode });
const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err) {
    console.error(err);
    closeCompiler(1);
    return;
  }

  const info = stats.toString({
    all: false,
    colors: true,
    errors: true,
    warnings: true,
    timings: true,
  });

  if (info) {
    console.log(info);
  }

  if (stats.hasErrors()) {
    closeCompiler(1);
    return;
  }

  closeCompiler(0);
});

function closeCompiler(exitCode) {
  compiler.close((closeErr) => {
    if (closeErr) {
      console.error(closeErr);
      process.exit(1);
    }

    process.exit(exitCode);
  });
}
