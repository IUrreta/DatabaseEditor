Races_Enum_State table

Explanation of Flags:
- ID (cid): Column's zero-based ordinal position.
- Not Null: 1 = Cannot be NULL, 0 = Can be NULL.
- Default Value (dflt_value): The column's default value, or null if none.
- Primary Key (pk): 1 = Is the primary key, 0 = Not primary key.
  (For composite keys, >1 indicates order in key).

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | State | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name  | TEXT      | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table     | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races](Races.md) | State        | State          | NO ACTION | NO ACTION | NONE       |
