Save_CarTyreAllocation table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                      | Data Type      | Not Null | Default Value | Primary Key |
|----|---------------------------|----------------|----------|---------------|-------------|
| 0  | CarID                     | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | TyreSetID                 | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | WeekendTyreType           | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | FrontLeftWear             | decimal (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | FrontRightWear            | decimal (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | BackLeftWear              | decimal (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | BackRightWear             | decimal (6, 3) | Yes (1)  | null          | No (0)      |
| 7  | AvailabilityState         | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | EstimatedLapTime          | decimal (6, 3) | Yes (1)  | null          | No (0)      |
| 9  | EstimatedLapLifeRemaining | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | LapsCompleted             | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | SessionLastUsedIn         | INTEGER        | Yes (1)  | null          | No (0)      |
| 12 | LapsUsedForInSession      | INTEGER        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 