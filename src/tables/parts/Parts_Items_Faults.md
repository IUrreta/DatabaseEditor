Parts_Items_Faults table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type | Not Null | Default Value | Primary Key |
|----|---------------|-----------|----------|---------------|-------------|
| 0  | ItemID        | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | FaultType     | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | FaultName     | TEXT      | Yes (1)  | null          | No (0)      |
| 3  | FaultSeverity | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                 | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Items](Parts_Items.md) | ItemID       | ItemID         | RESTRICT  | CASCADE   | NONE       |