Board_Enum_BoardPerformance table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | Value | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name  | TEXT      | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                                              | Local Column | Foreign Column                  | 
|----|-----|----------------------------------------------------------------------------|--------------|---------------------------------|
| 0  | 0   | [Board_Confidence_RaceHistory](confidence/Board_Confidence_RaceHistory.md) | Value        | Performance                     |
| 1  | 0   | [Board_Confidence_RaceMods](confidence/Board_Confidence_RaceMods.md)       | Value        | BoardPerformance                |
| 2  | 0   | [Board_Enum_ObjectiveStates](objectives/Board_Enum_ObjectiveStates.md)     | Value        | BoardPerformanceFromSeasonObj   |
| 3  | 0   | [Board_Enum_ObjectiveStates](objectives/Board_Enum_ObjectiveStates.md)     | Value        | BoardPerformanceFromLongTermObj |
