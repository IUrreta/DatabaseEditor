let db = null;
let metadata = null;

export function setDatabase(database, meta) {
  db = database;

  metadata = meta;
}

export function getDatabase() {
  return db;
}

export function getMetadata() {
  return metadata;
}

export function setMetaData(meta) {
  metadata = meta;
}

/**
 * Ejecuta una consulta SQL y devuelve el resultado según 'type'.
 * @param {string} query - La consulta a ejecutar.
 * @param {Array} [params=[]] - Los parámetros para la consulta.
 * @param {"singleValue"|"singleRow"|"allRows"|"run"} [type="allRows"] - El tipo de resultado.
 * @returns {any} 
 *    - 'singleValue': un único valor (o null).
 *    - 'singleRow': la primera fila (array de valores) o null.
 *    - 'allRows': array de filas (cada fila, array de valores), o [] si no hay ninguna.
 *    - 'run': devuelve true si se ejecutó correctamente.
 */
export function queryDB(query, params = [], type = 'allRows') {
  try {
    const sanitizedParams = Array.isArray(params)
      ? params.map(p => (Array.isArray(p) && p.length === 1 ? p[0] : p))
      : params;

    if (type === 'exec') {
      db.exec(query);
      return true;
    }

    if (type === 'run') {
      db.run(query, sanitizedParams);
      return true;
    }
    
    const stmt = db.prepare(query);
    stmt.bind(sanitizedParams);

    let result = null;

    if (type === 'singleValue') {
      if (stmt.step()) {
        const row = stmt.get();
        result = row[0] ?? null;
      } else {
        result = null;
      }
    } else if (type === 'singleRow') {
      if (stmt.step()) {
        result = stmt.get();
      } else {
        result = null;
      }
    } else {
      // allRows
      result = [];
      while (stmt.step()) {
        result.push(stmt.get());
      }
    }

    stmt.free();
    return result;

  } catch (err) {
    // 💥 AQUÍ cazamos errores de SQL.js, incluyendo binds mal pasados
    const fullErr = new Error(
      `SQL ERROR\nQuery: ${query}\nParams: ${JSON.stringify(params)}\nOriginal: ${err.message}`
    );
    console.error(fullErr);
    throw fullErr;
  }
}

