Parts_NamingConventions table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name         | Data Type | Not Null | Default Value | Primary Key |
|----|--------------|-----------|----------|---------------|-------------|
| 0  | TeamID       | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Prefix       | TEXT      | Yes (1)  | null          | No (0)      |
| 2  | SeasonOffset | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md) | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |