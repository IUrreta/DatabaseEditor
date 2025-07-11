Save_CarAI_Practice table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------|----------------|----------|---------------|-------------|
| 0  | CarID                | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | State                | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | NextRunTimeSelected  | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | RunCount             | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | CurrentRunTargetLaps | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | LapCountAtRunStart   | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | FreshTyresToUse      | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | NextRunTime          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 8  | CurrentRunTargetTime | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 9  | CurrentRunStartTime  | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 10 | AllowedTyreBitField  | INTEGER        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it.