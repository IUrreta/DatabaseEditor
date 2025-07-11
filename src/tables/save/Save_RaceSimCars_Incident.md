Save_RaceSimCars_Incident table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                       | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex                   | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | WantedRacingIncident       | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | ActiveRacingIncident       | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | RacingIncidentNodeID       | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | IncidentStartDirectionWS_X | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | IncidentStartDirectionWS_Y | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | IncidentStartDirectionWS_Z | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 7  | RecoveryTargetPosition_X   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 8  | RecoveryTargetPosition_Y   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 9  | RecoveryTargetPosition_Z   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 10 | IncidentStartTime          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 11 | ImpactSpeed                | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 12 | RecoveryState              | INTEGER        | Yes (1)  | null          | No (0)      |
| 13 | RecoveryStateSimTime       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 14 | HasLeftTrack               | BOOLEAN        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it.