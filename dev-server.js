const fs = require('fs');
const http = require('http');
const path = require('path');
const webpack = require('webpack');
const createConfig = require('./webpack.config');

process.env.NODE_ENV = 'development';

const outputDirectory = path.resolve(__dirname, 'dist');
const port = Number(process.env.PORT) || 3000;
const config = createConfig({}, { mode: 'development' });
const compiler = webpack(config);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

let buildReady = fs.existsSync(path.join(outputDirectory, 'index.html'));
let buildError = null;
let hasCompiled = false;
const reloadClients = new Set();

const watcher = compiler.watch({}, (error, stats) => {
  if (error) {
    buildError = error;
    console.error(error);
    return;
  }

  const output = stats.toString({
    all: false,
    colors: true,
    errors: true,
    warnings: true,
    timings: true,
  });

  if (output) console.log(output);
  buildError = stats.hasErrors() ? new Error('Webpack compilation failed') : null;
  buildReady = !buildError;

  if (buildReady && hasCompiled) {
    reloadClients.forEach((client) => client.write('data: reload\n\n'));
  }
  hasCompiled = true;
});

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  if (pathname === '/__dev_reload') {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
    });
    response.write(': connected\n\n');
    reloadClients.add(response);
    request.on('close', () => reloadClients.delete(response));
    return;
  }

  if (!buildReady) {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(buildError ? 'Webpack compilation failed. Check the terminal.' : 'Webpack is compiling…');
    return;
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.resolve(outputDirectory, `.${requestedPath}`);
  const isInsideOutput = filePath === outputDirectory || filePath.startsWith(`${outputDirectory}${path.sep}`);

  if (!isInsideOutput) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const acceptsHtml = String(request.headers.accept || '').includes('text/html');
    if (acceptsHtml) filePath = path.join(outputDirectory, 'index.html');
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });

  if (extension === '.html') {
    const html = fs.readFileSync(filePath, 'utf8');
    const reloadScript = "<script>new EventSource('/__dev_reload').onmessage=()=>location.reload();</script>";
    response.end(html.includes('</body>') ? html.replace('</body>', `${reloadScript}</body>`) : `${html}${reloadScript}`);
    return;
  }

  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Webpack development server listening on port ${port}`);
});

function shutdown() {
  server.close(() => {
    watcher.close(() => process.exit(0));
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
