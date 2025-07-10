EventLogs table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name        | Data Type | Not Null | Default Value | Primary Key |
|----|-------------|-----------|----------|---------------|-------------|
| 0  | EventLogID  | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | EntryType   | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | ReferenceID | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | Day         | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [EventLog_Enum_EntryType](EventLog_Enum_EntryType.md) | EntryType    | EntryType      | NO ACTION | NO ACTION | NONE       |