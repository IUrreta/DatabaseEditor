Staff_ForenamePool table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name   | Data Type | Not Null | Default Value | Primary Key |
|----|--------|-----------|----------|---------------|-------------|
| 0  | LocKey | TEXT      | Yes (1)  | null          | Yes (1)     |
| 1  | Locale | INTEGER   | Yes (1)  | '0'           | Order 2 (2) |
| 2  | Gender | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 3  | FT0    | INTEGER   | Yes (1)  | '1'           | No (0)      |
| 4  | FT1    | INTEGER   | Yes (1)  | '1'           | No (0)      |
| 5  | FT2    | INTEGER   | Yes (1)  | '1'           | No (0)      |
| 6  | FT3    | INTEGER   | Yes (1)  | '1'           | No (0)      |
| 7  | FT4    | INTEGER   | Yes (1)  | '1'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                              | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_NameLocales](enum/Staff_Enum_NameLocales.md) | Locale       | Value          | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Staff_Enum_Gender](enum/Staff_Enum_Gender.md)           | Gender       | Value          | RESTRICT  | RESTRICT  | NONE       |