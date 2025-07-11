Races_Enum_WeekendType table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name | Data Type | Not Null | Default Value | Primary Key |
|----|------|-----------|----------|---------------|-------------|
| 0  | Type | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name | TEXT      | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it.

FKs this table points to

| ID | Seq | Foreign Table                         | Local Column | Foreign Column | 
|----|-----|---------------------------------------|--------------|----------------|
| 0  | 0   | [Races](Races.md)                     | Type         | WeekendType    |
| 1  | 0   | [Races_Templates](Races_Templates.md) | Type         | WeekendType    |
