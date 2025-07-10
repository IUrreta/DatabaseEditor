Races_Tracks table

Explanation of Flags:
- ID (cid): Column's zero-based ordinal position.
- Not Null: 1 = Cannot be NULL, 0 = Can be NULL.
- Default Value (dflt_value): The column's default value, or null if none.
- Primary Key (pk): 1 = Is the primary key, 0 = Not primary key.
  (For composite keys, >1 indicates order in key).
  Foreign Key Information for 'Races' Table (Outgoing FKs):

| ID | Name                  | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------------------|----------------|----------|---------------|-------------|
| 0  | TrackID               | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Name                  | TEXT           | Yes (1)  | null          | No (0)      |
| 2  | CountryID             | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | Laps                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | FirstRace             | bigint (20)    | Yes (1)  | null          | No (0)      |
| 5  | ProfileText           | mediumtext     | Yes (1)  | null          | No (0)      |
| 6  | TrackLength           | decimal (8, 3) | Yes (1)  | null          | No (0)      |
| 7  | TypeOfTrack           | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | FastestLap            | decimal (8, 3) | Yes (1)  | null          | No (0)      |
| 9  | FastestLapDriverID    | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | LastWinner            | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | LastPolePosition      | INTEGER        | Yes (1)  | null          | No (0)      |
| 12 | MostWins              | INTEGER        | Yes (1)  | null          | No (0)      |
| 13 | FastestLapYear        | INTEGER        | Yes (1)  | null          | No (0)      |
| 14 | SafetyCarChance       | decimal (8, 2) | Yes (1)  | '0.0'         | No (0)      |
| 15 | PitLaneTimeLoss       | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 16 | GreenFlagTimeLoss     | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 17 | SafetyCarTimeLoss     | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 18 | StartFinishLineOffset | decimal (8, 3) | Yes (1)  | '0.0'         | No (0)      |
| 19 | SprintLaps            | INTEGER        | Yes (1)  | '20'          | No (0)      |
| 20 | IsF2Race              | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 21 | IsF3Race              | INTEGER        | Yes (1)  | '0'           | No (0)      |

----------------------------------------------------------
- id: Unique ID for the foreign key constraint (within the table).
- seq: Sequence number for a composite foreign key (0 for single-column FKs).
- table: The name of the foreign table being referenced.
- from: The local column in 'Races' that is part of the foreign key.
- to: The column in the 'table' (foreign table) that is being referenced.
- on_update: Action to perform on UPDATE of the parent key (e.g., NO ACTION, CASCADE, SET NULL).
- on_delete: Action to perform on DELETE of the parent key (e.g., NO ACTION, CASCADE, SET NULL).
- match: Matching algorithm (e.g., NONE, SIMPLE, PARTIAL, FULL).

Each row in the PRAGMA foreign_key_list() output represents one part of a foreign key constraint.
Format: [id, seq, table, from, to, on_update, on_delete, match]

| ID | Seq | Foreign Table        | Local Column       | Foreign Column | On Update | On Delete | Match Type |
|----|-----|----------------------|--------------------|----------------|-----------|-----------|------------|
| 0  | 0   | Races_Enum_TrackType | TypeOfTrack        | Value          | RESTRICT  | RESTRICT  | NONE       |
| 1  | 0   | Staff_DriverData     | FastestLapDriverID | StaffID        | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | Countries            | CountryID          | CountryID      | RESTRICT  | RESTRICT  | NONE       |