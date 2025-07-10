Player_State table

Explanation of Flags:
- ID (cid): Column's zero-based ordinal position.
- Not Null: 1 = Cannot be NULL, 0 = Can be NULL.
- Default Value (dflt_value): The column's default value, or null if none.
- Primary Key (pk): 1 = Is the primary key, 0 = Not primary key.
  (For composite keys, >1 indicates order in key).
  Foreign Key Information for 'Races' Table (Outgoing FKs):

| ID | Name          | Data Type | Not Null | Default Value | Primary Key |
|----|---------------|-----------|----------|---------------|-------------|
| 0  | Day           | INTEGER   | Yes (1)  | 0             | Yes (1)     |
| 1  | CurrentSeason | INTEGER   | Yes (1)  | null          | No (0)      |

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

| ID | Seq | Foreign Table | Local Column  | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------|---------------|----------------|-----------|-----------|------------|
| 0  | 0   | Seasons       | CurrentSeason | SeasonID       | NO ACTION | NO ACTION | NONE       |