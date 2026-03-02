Save_RaceSimCars_Overtake table

[Column Guide](../../../columnFlagsGuide.md)

Column Information:

| ID | Name                                    | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------------------------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex                                | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | RaceLineState                           | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | OvertakeActive                          | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 3  | OvertakeSuccessRoll                     | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 4  | TimeOfLastOvertakeAttempt               | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | DefenderCar                             | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | DefenceType                             | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | AttackerInitialLine                     | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 8  | CanSwitchback                           | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 9  | SwitchbackActive                        | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 10 | SwitchbackAttemptsRemaining             | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | OvertakeStartTime                       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 12 | TargetOTDirection                       | INTEGER        | Yes (1)  | null          | No (0)      |
| 13 | TargetOTCornerNodeID                    | INTEGER        | Yes (1)  | null          | No (0)      |
| 14 | TargetOTRaceDistance                    | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 15 | TimeOfLastOvertakenEvent                | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 16 | HasSentAttemptOvertakeEvent             | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 17 | CornerClaimIndex                        | INTEGER        | Yes (1)  | null          | No (0)      |
| 18 | DefenderIDOfLastOvertakeAttempt         | INTEGER        | Yes (1)  | null          | No (0)      |
| 19 | OvertakeAttemptsOnCurrentDefender       | INTEGER        | Yes (1)  | null          | No (0)      |
| 20 | FirstOvertakeAttemptTimeOnCurrentDriver | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 21 | OvertakeEventCooldownStartTime          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 22 | CarsOnSameLap                           | BOOLEAN        | Yes (1)  | '0'           | No (0)      |
| 23 | LastDecisionTime                        | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 24 | AttackerCorneringMultiplier             | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 25 | DefenderCorneringMultiplier             | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 26 | AllowSqueeze                            | BOOLEAN        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 