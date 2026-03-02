Save_RaceSim_CornerClaim table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type      | Not Null | Default Value | Primary Key |
|----|-------------------|----------------|----------|---------------|-------------|
| 0  | ClaimIndex        | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | ClaimState        | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | ClaimIncident     | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | CarIndex1         | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | CarIndex2         | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | CarIndex3         | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | LeadCarIndex      | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | MaxCarsInClaim    | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | IncidentRolled    | INTEGER        | Yes (1)  | null          | No (0)      |
| 9  | IncidentTriggered | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | IncidentOffset    | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it.