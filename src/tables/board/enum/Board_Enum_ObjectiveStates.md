Board_Enum_ObjectiveStates table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                               | Data Type | Not Null | Default Value | Primary Key |
|----|------------------------------------|-----------|----------|---------------|-------------|
| 0  | Value                              | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name                               | TEXT      | Yes (1)  | null          | No (0)      |
| 2  | ConfidenceModFromLongTermObj       | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 3  | BoardPerformanceFromLongTermObj    | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 4  | NumBoardPerformanceFromLongTermObj | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 5  | ConfidenceModFromSeasonObj         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 6  | BoardPerformanceFromSeasonObj      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 7  | NumBoardPerformanceFromSeasonObj   | INTEGER   | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                 | Local Column                    | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------|---------------------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Board_Enum_BoardPerformance](Board_Enum_BoardPerformance.md) | BoardPerformanceFromSeasonObj   | Value          | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Board_Enum_BoardPerformance](Board_Enum_BoardPerformance.md) | BoardPerformanceFromLongTermObj | Value          | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                       | Local Column | Foreign Column | 
|----|-----|-----------------------------------------------------|--------------|----------------|
| 0  | 0   | [Board_Objectives](../Board_Objectives.md)             | Value        | State          |
| 1  | 0   | [Board_SeasonObjectives](../Board_SeasonObjectives.md) | Value        | State          |
