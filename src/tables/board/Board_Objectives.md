Board_Objectives table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type | Not Null | Default Value | Primary Key |
|----|---------------|-----------|----------|---------------|-------------|
| 0  | TeamID        | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Type          | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | StartYear     | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 3  | TargetEndYear | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | State         | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 5  | EndYear       | INTEGER   | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                               | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Board_Enum_ObjectiveTypes](enum/Board_Enum_ObjectiveTypes.md)   | Type         | Value          | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Teams](../team/Teams.md)                                | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Board_Enum_ObjectiveStates](enum/Board_Enum_ObjectiveStates.md) | State        | Value          | NO ACTION | NO ACTION | NONE       |