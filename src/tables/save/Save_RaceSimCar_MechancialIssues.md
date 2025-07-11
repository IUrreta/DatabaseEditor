Save_RaceSimCar_MechancialIssues table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                      | Data Type      | Not Null | Default Value | Primary Key |
|----|---------------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 1  | FaultType                 | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | FaultName                 | TEXT           | Yes (1)  | null          | No (0)      |
| 3  | FaultDevelopedTime        | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | NextEscalationCheckTime   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | NextDeescalationCheckTime | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 