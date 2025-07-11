Mail_Enum_Event table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | Value | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name  | STRING    | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it.

FKs this table points to

| ID | Seq | Foreign Table                       | Local Column | Foreign Column | 
|----|-----|-------------------------------------|--------------|----------------|
| 0  | 0   | [Mail_EventPool](Mail_EventPool.md) | Value        | Event          |
