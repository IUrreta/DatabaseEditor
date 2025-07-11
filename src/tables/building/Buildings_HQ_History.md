Buildings_HQ_History table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type | Not Null | Default Value | Primary Key |
|----|----------------|-----------|----------|---------------|-------------|
| 0  | BuildingID     | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Type           | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | TeamID         | INTEGER   | Yes (1)  | null          | Order 3 (3) |
| 3  | DayConstructed | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                 | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)                     | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Building_Enum_Types](enum/Building_Enum_Types.md) | Type         | Type           | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Buildings](Buildings.md)                     | BuildingID   | BuildingID     | RESTRICT  | CASCADE   | NONE       |