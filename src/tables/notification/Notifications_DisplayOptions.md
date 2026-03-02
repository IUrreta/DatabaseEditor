Notifications_DisplayOptions table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type | Not Null | Default Value | Primary Key |
|----|-----------------|-----------|----------|---------------|-------------|
| 0  | PriorityBand    | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | DisplayOptionID | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                             | Local Column    | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------------------|-----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Notifications_Enum_DisplayOptions](Notifications_Enum_DisplayOptions.md) | DisplayOptionID | DisplayOption  | NO ACTION | NO ACTION | NONE       |