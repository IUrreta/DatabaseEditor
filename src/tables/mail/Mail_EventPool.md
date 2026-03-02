Mail_EventPool table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | Event | INTEGER   | No (0)   | null          | Yes (1)     |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Mail_Enum_Event](enum/Mail_Enum_Event.md) | Event        | Value          | RESTRICT  | CASCADE   | NONE       |