Parts_ParcFerme table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type | Not Null | Default Value | Primary Key |
|----|-----------|-----------|----------|---------------|-------------|
| 0  | DesignID  | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | LoadoutID | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | TeamID    | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | PartType  | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | Session   | INTEGER   | Yes (1)  | '6'           | No (0)      |
| 5  | ItemID    | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_Type](Parts_Enum_Type.md) | PartType     | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Teams](../team/Teams.md)             | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Parts_Designs](Parts_Designs.md)     | DesignID     | DesignID       | RESTRICT  | CASCADE   | NONE       |