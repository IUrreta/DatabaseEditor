Races table

Explanation of Flags:
- ID (cid): Column's zero-based ordinal position.
- Not Null: 1 = Cannot be NULL, 0 = Can be NULL.
- Default Value (dflt_value): The column's default value, or null if none.
- Primary Key (pk): 1 = Is the primary key, 0 = Not primary key.
  (For composite keys, >1 indicates order in key).
  Foreign Key Information for 'Races' Table (Outgoing FKs):

| ID | Name                   | Data Type      | Not Null | Default Value | Primary Key |
|----|------------------------|----------------|----------|---------------|-------------|
| 0  | RaceID                 | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | SeasonID               | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | Day                    | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | TrackID                | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | State                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | RainPractice           | decimal (4, 3) | Yes (1)  | null          | No (0)      |
| 6  | TemperaturePractice    | decimal (3, 1) | Yes (1)  | null          | No (0)      |
| 7  | WeatherStatePractice   | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | RainQualifying         | decimal (4, 3) | Yes (1)  | null          | No (0)      |
| 9  | TemperatureQualifying  | decimal (3, 1) | Yes (1)  | null          | No (0)      |
| 10 | WeatherStateQualifying | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | RainRace               | decimal (4, 3) | Yes (1)  | null          | No (0)      |
| 12 | TemperatureRace        | decimal (3, 1) | Yes (1)  | null          | No (0)      |
| 13 | WeatherStateRace       | INTEGER        | Yes (1)  | null          | No (0)      |
| 14 | WeekendType            | INTEGER        | Yes (1)  | '0'           | No (0)      |

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

--------------------------------------------------------------------------------------------------------------------------------------
| ID | Seq | Foreign Table                                       | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Tracks](Races_Tracks.md)                     | TrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Seasons](../Seasons.md)                            | SeasonID     | SeasonID       | NO ACTION | CASCADE   | NONE       |
| 2  | 0   | [Races_Enum_State](Races_Enum_State.md)             | State        | State          | NO ACTION | NO ACTION | NONE       |
| 3  | 0   | [Races_Enum_WeekendType](Races_Enum_WeekendType.md) | WeekendType  | Type           | NO ACTION | NO ACTION | NONE       |