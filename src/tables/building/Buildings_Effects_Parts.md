Buildings_Effects_Parts table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name         | Data Type     | Not Null | Default Value | Primary Key |
|----|--------------|---------------|----------|---------------|-------------|
| 0  | BuildingType | INTEGER       | Yes (1)  | null          | Yes (1)     |
| 1  | PartType     | INTEGER       | Yes (1)  | null          | Order 2 (2) |
| 2  | StatID       | INTEGER       | Yes (1)  | null          | Order 3 (3) |
| 3  | Weight       | decimal(10,3) | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                       | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Building_Enum_Types](enum/Building_Enum_Types.md)    | BuildingType | Type           | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Parts_Enum_Stats](../parts/enum/Parts_Enum_Stats.md) | StatID       | Value          | CASCADE   | NO ACTION | NONE       |
| 2  | 0   | [Parts_Enum_Type](../parts/enum/Parts_Enum_Type.md)   | PartType     | Value          | NO ACTION | NO ACTION | NONE       |