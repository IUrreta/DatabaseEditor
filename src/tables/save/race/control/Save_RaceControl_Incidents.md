Save_RaceControl_Incidents table

[Column Guide](../../../columnFlagsGuide.md)

Column Information:

| ID | Name                   | Data Type      | Not Null | Default Value | Primary Key |
|----|------------------------|----------------|----------|---------------|-------------|
| 0  | CarID                  | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | ImpactSpeed            | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 2  | StartSimTime           | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | RecoveryStartSimTime   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | RecoveryDuration       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | TrackCleanupDuration   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | MarshalCheckpointIndex | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | Location               | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | Severity               | INTEGER        | Yes (1)  | null          | No (0)      |
| 9  | State                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | Response               | INTEGER        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it.