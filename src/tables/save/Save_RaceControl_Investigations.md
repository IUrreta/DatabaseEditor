Save_RaceControl_Investigations table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                        | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------------------------|----------------|----------|---------------|-------------|
| 0  | InvestigationIndex          | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | ResponsibleCarID            | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | IncidentSimTime             | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | IncidentRevealTime          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | UnderInvestigationEventSent | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | CurrentState                | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | PenaltyOutcomeCalculated    | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | PenaltyType                 | INTEGER        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 