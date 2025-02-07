import initSqlJs from 'sql.js';

(async () => {
  // Inicia la instancia de sql.js
  const SQL = await initSqlJs({
    locateFile: file => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm',
    wasmMemory: new WebAssembly.Memory({ initial: 1024 })
    // O la ruta local de tu sql-wasm.wasm
  });

  // Asigna al objeto global 'window'
  window.SQL = SQL;

})();