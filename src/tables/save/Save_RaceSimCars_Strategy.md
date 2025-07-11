Save_RaceSimCars_Strategy table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex             | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | LiftAndCoastStrategy | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | TyreWearStrategy     | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | ErsStrategy          | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | OvertakeStrategy     | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | DefenceStrategy      | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | AvoidDirtyAir        | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 7  | AvoidKerbs           | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 8  | AllowTeamMatePast    | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 9  | ErsOvertakeAssist    | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 10 | TimePenalty1         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 11 | TimePenalty2         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 12 | TimePenalty3         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 13 | TimePenalty4         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 