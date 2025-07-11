Parts_TeamExpertise table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------|----------------|----------|---------------|-------------|
| 0  | TeamID               | INTEGER        | Yes (1)  | '1'           | Order 3 (3) |
| 1  | PartType             | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 2  | PartStat             | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 3  | Expertise            | decimal (8, 4) | Yes (1)  | '0.0'         | No (0)      |
| 4  | NextSeasonExpertise  | decimal (8, 4) | Yes (1)  | '0.0'         | No (0)      |
| 5  | SeasonStartExpertise | decimal (8, 4) | Yes (1)  | '0.0'         | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                           | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)               | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Parts_Enum_Stats](Parts_Enum_Stats.md) | PartStat     | Value          | CASCADE   | NO ACTION | NONE       |
| 2  | 0   | [Parts_Enum_Type](Parts_Enum_Type.md)   | PartType     | Value          | NO ACTION | NO ACTION | NONE       |