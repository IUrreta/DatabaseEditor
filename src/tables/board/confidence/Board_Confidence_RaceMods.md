Board_Confidence_RaceMods table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type    | Not Null | Default Value | Primary Key |
|----|------------------|--------------|----------|---------------|-------------|
| 0  | MinPosDelta      | decimal(3,1) | Yes (1)  | null          | Yes (1)     |
| 1  | MaxPosDelta      | decimal(3,1) | Yes (1)  | null          | Order 2 (2) |
| 2  | ConfidenceMod    | INTEGER      | Yes (1)  | null          | No (0)      |
| 3  | BoardPerformance | INTEGER      | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                 | Local Column     | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------|------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Board_Enum_BoardPerformance](../Board_Enum_BoardPerformance.md) | BoardPerformance | Value          | NO ACTION | NO ACTION | NONE       |