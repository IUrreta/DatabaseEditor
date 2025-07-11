Save_RaceControl_Investigations_InvolvedCars table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------|----------------|----------|---------------|-------------|
| 0  | InvestigationIndex   | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | CarID                | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | Position             | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | DeltaToLeader        | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | MinorDamagePartCount | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | MajorDamagePartCount | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | DestroyedPartCount   | INTEGER        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 