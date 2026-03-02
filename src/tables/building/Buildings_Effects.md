Buildings_Effects table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name       | Data Type    | Not Null | Default Value | Primary Key |
|----|------------|--------------|----------|---------------|-------------|
| 0  | BuildingID | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | EffectID   | INTEGER      | Yes (1)  | null          | Order 2 (2) |
| 2  | Value      | decimal(8,3) | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                        | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Building_Enum_Effects](enum/Building_Enum_Effects.md) | EffectID     | Effect         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Buildings](Buildings.md)                         | BuildingID   | BuildingID     | NO ACTION | NO ACTION | NONE       |