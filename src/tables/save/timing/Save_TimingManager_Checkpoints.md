Save_TimingManager_Checkpoints table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type      | Not Null | Default Value | Primary Key |
|----|------------------|----------------|----------|---------------|-------------|
| 0  | ID               | INTEGER        | No (0)   | null          | Yes (1)     |
| 1  | RaceDistance     | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 2  | TimeFirstPassed  | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | FirstPassedCarId | INTEGER        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 