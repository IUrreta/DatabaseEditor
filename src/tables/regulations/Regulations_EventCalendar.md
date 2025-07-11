Regulations_EventCalendar table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name        | Data Type | Not Null | Default Value | Primary Key |
|----|-------------|-----------|----------|---------------|-------------|
| 0  | Month       | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | ChangeType  | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | SeasonDelta | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                 | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Regulations_Enum_ChangeType](enum/Regulations_Enum_ChangeType.md) | ChangeType   | Value          | NO ACTION | NO ACTION | NONE       |