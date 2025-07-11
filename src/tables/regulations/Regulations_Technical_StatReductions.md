Regulations_Technical_StatReductions table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type    | Not Null | Default Value | Primary Key |
|----|---------------|--------------|----------|---------------|-------------|
| 0  | GroupID       | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | PartStat      | INTEGER      | Yes (1)  | null          | Order 2 (2) |
| 2  | StatReduction | decimal(3,2) | Yes (1)  | '0.00'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                           | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_Stats](../parts/Parts_Enum_Stats.md)        | PartStat     | Value          | CASCADE   | NO ACTION | NONE       |
| 1  | 0   | [Regulations_ChangeGroups](Regulations_ChangeGroups.md) | GroupID      | GroupID        | CASCADE   | CASCADE   | NONE       |