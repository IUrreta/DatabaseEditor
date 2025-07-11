Parts_StatDesignFocusModifiers table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                   | Data Type      | Not Null | Default Value | Primary Key |
|----|------------------------|----------------|----------|---------------|-------------|
| 0  | PartType               | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | SourceStat             | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | ImpactStat             | INTEGER        | Yes (1)  | null          | Order 3 (3) |
| 3  | MinDesignFocusModifier | decimal (3, 2) | Yes (1)  | null          | No (0)      |
| 4  | MaxDesignFocusModifier | decimal (3, 2) | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                           | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_Stats](Parts_Enum_Stats.md) | SourceStat   | Value          | CASCADE   | NO ACTION | NONE       |
| 1  | 0   | [Parts_Enum_Type](Parts_Enum_Type.md)   | PartType     | Value          | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Parts_Enum_Stats](Parts_Enum_Stats.md) | ImpactStat   | Value          | CASCADE   | NO ACTION | NONE       |