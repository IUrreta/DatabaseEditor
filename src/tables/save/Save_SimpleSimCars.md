
Save_SimpleSimCars table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                         | Data Type      | Not Null | Default Value | Primary Key |
|----|------------------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex                     | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | OffRaceLineDistance          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 2  | OffRaceLineTarget            | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | FacingDirection              | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | OffRaceLineVelocity          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | SplineT                      | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | SplineDistance               | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 7  | Speed                        | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 8  | CurrentAccel                 | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 9  | TimeSpentEmergencyStopped    | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 10 | VelocityX                    | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 11 | VelocityY                    | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 12 | VelocityZ                    | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 13 | FowardVecX                   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 14 | FowardVecY                   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 15 | FowardVecZ                   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 16 | SplineLUTID                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 17 | NextTrackNode                | INTEGER        | Yes (1)  | null          | No (0)      |
| 18 | AccelerationState            | INTEGER        | Yes (1)  | null          | No (0)      |
| 19 | AccelerationRate             | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 20 | BrakingZoneActive            | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 21 | BrakingZoneMinDistUntilBrake | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 22 | BrakingZoneTargetNode        | INTEGER        | Yes (1)  | null          | No (0)      |
| 23 | OffRaceLineUrgency           | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 24 | BrakingZoneTargetSpeed       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 25 | CurrentBrakeDecel            | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 26 | OffRaceLineUrgencyTarget     | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 