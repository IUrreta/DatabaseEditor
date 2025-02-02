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