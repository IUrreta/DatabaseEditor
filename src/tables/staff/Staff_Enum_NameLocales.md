Staff_Enum_NameLocales table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type    | Not Null | Default Value | Primary Key |
|----|-----------|--------------|----------|---------------|-------------|
| 0  | Value     | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | Name      | TEXT         | Yes (1)  | null          | No (0)      |
| 2  | FT0Chance | decimal(4,3) | Yes (1)  | '0.200'       | No (0)      |
| 3  | FT1Chance | decimal(4,3) | Yes (1)  | '0.200'       | No (0)      |
| 4  | FT2Chance | decimal(4,3) | Yes (1)  | '0.200'       | No (0)      |
| 5  | FT3Chance | decimal(4,3) | Yes (1)  | '0.200'       | No (0)      |
| 6  | FT4Chance | decimal(4,3) | Yes (1)  | '0.200'       | No (0)      |

Table has no FKs that point to it.

FKs this table points to

| ID | Seq | Foreign Table                                  | Local Column | Foreign Column  |
|----|-----|------------------------------------------------|--------------|-----------------|
| 0  | 0   | [Countries](../countries/Countries.md)                | Value        | StaffNameLocale | 
| 1  | 0   | [Staff_SurnamePool](Staff_SurnamePool.md)   | Value        | Locale          | 
| 2  | 0   | [Staff_ForenamePool](Staff_ForenamePool.md) | Value        | Locale          | 
