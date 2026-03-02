Save_CarAI_Qualifying table

[Column Guide](../../../columnFlagsGuide.md)

Column Information:

| ID | Name                            | Data Type      | Not Null | Default Value | Primary Key |
|----|---------------------------------|----------------|----------|---------------|-------------|
| 0  | CarID                           | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | State                           | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | NextRunPrioritiseFreshTyres     | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | LastRunAborted                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | WillSkipFinalRun                | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | RunCount                        | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | FullRunDuration                 | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 7  | LastRunCutOff                   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 8  | WorstConditionsLastRun          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 9  | QualifyingCutoffSafetyThreshold | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 10 | RunWeatherLookahead             | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 