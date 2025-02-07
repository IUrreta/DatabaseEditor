let db = null;
let metadata = null;

export function setDatabase(database, meta) {
  db = database;
  console.log("db: ", db);
  metadata = meta;
}

export function getDatabase() {
  return db;
}

export function getMetadata() {
  return metadata;
}

/**
 * Ejecuta una consulta SQL y devuelve el resultado según 'type'.
 * @param {string} query - La consulta a ejecutar.
 * @param {"singleValue"|"singleRow"|"allRows"} [type="allRows"] - El tipo de resultado.
 * @returns {any} 
 *    - 'singleValue': un único valor (o null).
 *    - 'singleRow': la primera fila (array de valores) o null.
 *    - 'allRows': array de filas (cada fila, array de valores), o [] si no hay ninguna.
 */
export function queryDB(query, type = 'allRows') {
  const res = db.exec(query); // o tu instancia real de db
  if (!res.length) {
    // No hay resultsets
    return (type === 'allRows') ? [] : null;
  }

  const rows = res[0].values; 
  if (!rows.length) {
    // Hay resultset pero 0 filas
    return (type === 'allRows') ? [] : null;
  }

  switch (type) {
    case 'singleValue':
      // Devuelvo la primera columna de la primera fila
      return rows[0][0] ?? null;
    case 'singleRow':
      // Devuelvo la primera fila entera (array)
      return rows[0];
    case 'allRows':
    default:
      // Devuelvo todas las filas
      return rows;
  }
}
