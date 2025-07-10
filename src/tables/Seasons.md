Seasons table

Explanation of Flags:
- ID (cid): Column's zero-based ordinal position.
- Not Null: 1 = Cannot be NULL, 0 = Can be NULL.
- Default Value (dflt_value): The column's default value, or null if none.
- Primary Key (pk): 1 = Is the primary key, 0 = Not primary key.
  (For composite keys, >1 indicates order in key).
  Foreign Key Information for 'Races' Table (Outgoing FKs):

| ID | Name               | Data Type  | Not Null | Default Value | Primary Key |
|----|--------------------|------------|----------|---------------|-------------|
| 0  | SeasonID           | INTEGER    | Yes (1)  | null          | Yes (1)     |
| 1  | PrizePool          | bigint(20) | Yes (1)  | 500000000     | No (0)      |
| 2  | EntryBaseFee       | bigint(20) | Yes (1)  | 556509        | No (0)      |
| 3  | EntryPerPointFirst | bigint(20) | Yes (1)  | 6677          | No (0)      |
| 4  | EntryPerPointOther | bigint(20) | Yes (1)  | 5563          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Player_State](Player_State.md) | SeasonID     | CurrentSeason  | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Races](./race/Races.md)        | SeasonID     | SeasonID       | NO ACTION | CASCADE   | NONE       |