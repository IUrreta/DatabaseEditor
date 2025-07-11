Parts_CarLoadout table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type | Not Null | Default Value | Primary Key |
|----|-----------|-----------|----------|---------------|-------------|
| 0  | TeamID    | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | LoadoutID | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | PartType  | INTEGER   | Yes (1)  | null          | Order 3 (3) |
| 3  | DesignID  | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 4  | ItemID    | INTEGER   | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)             | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Parts_Enum_Type](enum/Parts_Enum_Type.md) | PartType     | Value          | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Parts_Items](Parts_Items.md)         | ItemID       | ItemID         | NO ACTION | SET NULL  | NONE       |
| 3  | 0   | [Parts_Designs](design/Parts_Designs.md)     | DesignID     | DesignID       | CASCADE   | SET NULL  | NONE       |