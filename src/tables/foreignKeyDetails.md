----------------------------------------------------------
Each row in the PRAGMA foreign_key_list() output represents one part of a foreign key constraint.
Format: [id, seq, table, from, to, on_update, on_delete, match]

- id: Unique ID for the foreign key constraint (within the table).
- seq: Sequence number for a composite foreign key (0 for single-column FKs).
- table: The name of the foreign table being referenced.
- from: The local column in 'Races' that is part of the foreign key.
- to: The column in the 'table' (foreign table) that is being referenced.
- on_update: Action to perform on UPDATE of the parent key (e.g., NO ACTION, CASCADE, SET NULL).
- on_delete: Action to perform on DELETE of the parent key (e.g., NO ACTION, CASCADE, SET NULL).
- match: Matching algorithm (e.g., NONE, SIMPLE, PARTIAL, FULL).