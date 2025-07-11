Buildings_HQ table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type      | Not Null | Default Value | Primary Key |
|----|------------------|----------------|----------|---------------|-------------|
| 0  | BuildingID       | INTEGER        | Yes (1)  | null          | No (0)      |
| 1  | BuildingType     | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 2  | TeamID           | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 3  | DegradationValue | decimal (4, 3) | Yes (1)  | '1'           | No (0)      |
| 4  | BuildingState    | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | WorkDone         | INTEGER        | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                   | Local Column  | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------|---------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Building_Enum_Types](enum/Building_Enum_Types.md)   | BuildingType  | Type           | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Teams](../team/Teams.md)                       | TeamID        | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Building_Enum_States](enum/Building_Enum_States.md) | BuildingState | State          | RESTRICT  | CASCADE   | NONE       |
| 3  | 0   | [Buildings](Buildings.md)                       | BuildingID    | BuildingID     | RESTRICT  | CASCADE   | NONE       |