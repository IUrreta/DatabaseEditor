let db = null;
let metadata = null;

/**
 * Sets the active database instance and its metadata.
 * @param {Object} database - The SQL.js database instance.
 * @param {Object} meta - The metadata associated with the database.
 */
export function setDatabase(database, meta) {
  db = database;

  metadata = meta;
}

/**
 * Retrieves the current database instance.
 * @returns {Object} The active SQL.js database instance.
 */
export function getDatabase() {
  return db;
}

/**
 * Retrieves the metadata of the current database.
 * @returns {Object} The metadata object.
 */
export function getMetadata() {
  return metadata;
}

/**
 * Updates the database metadata.
 * @param {Object} meta - The new metadata object.
 */
export function setMetaData(meta) {
  metadata = meta;
}

/**
 * Executes a SQL query and returns the result based on the specified type.
 * @param {string} query - The SQL query to execute.
 * @param {"singleValue"|"singleRow"|"allRows"} [type="allRows"] - The expected result type.
 * @returns {any} 
 *    - 'singleValue': A single value (or null).
 *    - 'singleRow': The first row as an array of values (or null).
 *    - 'allRows': An array of rows, where each row is an array of values (or [] if no rows).
 */
export function queryDB(query, type = 'allRows') {
  const res = db.exec(query); // or your actual db instance
  if (!res.length) {
    // No resultsets
    return (type === 'allRows') ? [] : null;
  }

  const rows = res[0].values; 
  if (!rows.length) {
    // Resultset exists but has 0 rows
    return (type === 'allRows') ? [] : null;
  }

  switch (type) {
    case 'singleValue':
      // Return the first column of the first row
      return rows[0][0] ?? null;
    case 'singleRow':
      // Return the entire first row (array)
      return rows[0];
    case 'allRows':
    default:
      // Return all rows
      return rows;
  }
}
