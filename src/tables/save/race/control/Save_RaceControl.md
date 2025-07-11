Save_RaceControl table

[Column Guide](../../../columnFlagsGuide.md)

Column Information:

| ID | Name                       | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------------|----------------|----------|---------------|-------------|
| 0  | ID                         | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | SafetyCarReleasedSimTime   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 2  | AdditionalSessionTime      | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | RedFlagTimeToSkip          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | VscEnding                  | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 5  | VscEndSimTime              | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | SafetyCarUnlappingStartLap | INTEGER        | Yes (1)  | '0'           | No (0)      |

Table has no FKs that point to it. 