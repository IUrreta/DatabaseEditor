Parts_Designs_TeamData table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type | Not Null | Default Value | Primary Key |
|----|----------------------|-----------|----------|---------------|-------------|
| 0  | TeamID               | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | PartType             | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | NewDesignsThisSeason | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | NewDesignsNextSeason | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../../team/Teams.md)             | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Parts_Enum_Type](../enum/Parts_Enum_Type.md) | PartType     | Value          | NO ACTION | NO ACTION | NONE       |