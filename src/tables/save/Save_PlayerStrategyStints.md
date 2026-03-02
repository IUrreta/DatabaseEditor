Save_PlayerStrategyStints table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type      | Not Null | Default Value | Primary Key |
|----|--------------------|----------------|----------|---------------|-------------|
| 0  | LoadoutID          | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | StrategyID         | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | StintID            | INTEGER        | Yes (1)  | null          | Order 3 (3) |
| 3  | TyreDurability     | decimal (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | TyreType           | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | TyreSetID          | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | PitWindowStart     | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | AverageStartingLap | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | OptimalPitLap      | INTEGER        | Yes (1)  | null          | No (0)      |
| 9  | PitWindowEnd       | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | StintTyreStrategy  | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | StintStartTyreWear | decimal (6, 3) | Yes (1)  | null          | No (0)      |
| 12 | Selected           | INTEGER        | Yes (1)  | null          | No (0)      |
| 13 | CurrentStint       | BOOLEAN        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 