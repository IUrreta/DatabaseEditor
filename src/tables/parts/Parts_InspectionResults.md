Parts_InspectionResults table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type | Not Null | Default Value | Primary Key |
|----|-----------|-----------|----------|---------------|-------------|
| 0  | ItemID    | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | RaceID    | INTEGER   | No (0)   | null          | Order 2 (2) |
| 2  | DesignID  | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | LoadoutID | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | ItemName  | TEXT      | Yes (1)  | null          | No (0)      |
| 5  | Result    | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                               | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_InspectionState](enum/Parts_Enum_InspectionState.md) | Result       | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Parts_Designs](design/Parts_Designs.md)                           | DesignID     | DesignID       | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Races](../race/Races.md)                                   | RaceID       | RaceID         | RESTRICT  | CASCADE   | NONE       |