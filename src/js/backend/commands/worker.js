// worker.js
import { fetchSeasonResults, fetchEventsFrom, fetchTeamsStandings } from "../scriptUtils/dbUtils";
import { setDatabase, getDatabase } from "../dbManager";
import initSqlJs from 'sql.js';

self.addEventListener('message', async (e) => {
  const { action } = e.data;
  console.log("[Worker] MESSAGE: ", e);

  if (action === 'loadDB') {
    const SQL = await initSqlJs({
      locateFile: file => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm',
      wasmMemory: new WebAssembly.Memory({ initial: 1024 })
    });

    const workerDB = new SQL.Database(e.data.buffer);

    setDatabase(workerDB);

    console.log("[Worker] Database loaded in worker");
  }

  else if (action === 'start') {
    console.log("[Worker] Starting worker");
    // ahora `db` no es nulo en el contexto del Worker
    const year = e.data.year;

    console.log(e);


    const results = fetchSeasonResults(year);
    const events = fetchEventsFrom(year);
    const teams = fetchTeamsStandings(year);

    // devuelvo datos al hilo principal
    postMessage({
      responseMessage: "Results fetched",
      content: [events, results, teams]
    });
  }
});

