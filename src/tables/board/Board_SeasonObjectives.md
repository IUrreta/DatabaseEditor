Board_SeasonObjectives table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type | Not Null | Default Value | Primary Key |
|----|-----------|-----------|----------|---------------|-------------|
| 0  | TeamID    | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | SeasonID  | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | TargetPos | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | State     | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                               | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)                                | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Board_Enum_ObjectiveStates](enum/Board_Enum_ObjectiveStates.md) | State        | Value          | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Seasons](../season/Seasons.md)                          | SeasonID     | SeasonID       | CASCADE   | CASCADE   | NONE       |