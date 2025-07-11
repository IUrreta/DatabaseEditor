Save_RaceSimCars table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                           | Data Type      | Not Null | Default Value | Primary Key |
|----|--------------------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex                       | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Active                         | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 2  | AngularVel                     | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | AngularAcc                     | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | Fuel                           | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | EngineTemperature              | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | BrakeTemperature               | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 7  | AccelEaseInModifier            | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 8  | CollisionEnabled               | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 9  | RacePosition                   | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | TotalRaceTime                  | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 11 | RaceCompleteStateChangeSimTime | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 12 | LapCountAtRaceEnd              | INTEGER        | Yes (1)  | null          | No (0)      |
| 13 | LapsLappedByLeader             | INTEGER        | Yes (1)  | null          | No (0)      |
| 14 | RaceCompleteState              | INTEGER        | Yes (1)  | null          | No (0)      |
| 15 | BestLapTyreType                | INTEGER        | Yes (1)  | null          | No (0)      |
| 16 | LastTimingCheckpointRaceTime   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 17 | LastTimingCheckpointIndex      | INTEGER        | Yes (1)  | null          | No (0)      |
| 18 | PositionAtFirstChange          | INTEGER        | Yes (1)  | null          | No (0)      |
| 19 | TimeOfLastPositionChange       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 20 | CarIDOfLastPositionChange      | INTEGER        | Yes (1)  | null          | No (0)      |
| 21 | DRSState                       | INTEGER        | Yes (1)  | null          | No (0)      |
| 22 | DRSZone                        | INTEGER        | Yes (1)  | null          | No (0)      |
| 23 | DRSActiveLap                   | INTEGER        | Yes (1)  | null          | No (0)      |
| 24 | CurrentActiveTyreID            | INTEGER        | Yes (1)  | null          | No (0)      |
| 25 | LapType                        | INTEGER        | Yes (1)  | null          | No (0)      |
| 26 | TransitionLap                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 27 | PracticeRunStartTime           | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 28 | Slipstream                     | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 29 | DirtyAir                       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 30 | UpdateTransformMode            | INTEGER        | Yes (1)  | null          | No (0)      |
| 31 | WaitingForSafetyCarToPit       | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 32 | SafetyCarLaunchTime            | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 33 | SafetyCarRestartLap            | INTEGER        | Yes (1)  | null          | No (0)      |
| 34 | AvoidingCar                    | INTEGER        | Yes (1)  | null          | No (0)      |
| 35 | LappingCar                     | INTEGER        | Yes (1)  | null          | No (0)      |
| 36 | YieldDirection                 | INTEGER        | Yes (1)  | null          | No (0)      |
| 37 | IsFinalLapOfRace               | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 38 | LapCount                       | INTEGER        | Yes (1)  | null          | No (0)      |
| 39 | BlueFlagImmunityDistance       | DECIMAL (6, 3) | Yes (1)  | '- 1'         | No (0)      |
| 40 | SafetyCarUnlappingState        | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 41 | UnlappingLapCount              | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 42 | LapAccuracy                    | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 43 | CornerAccuracy                 | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 44 | RaceLineAccuracyOffset         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 45 | LastAccuracyRollTrackNode      | INTEGER        | Yes (1)  | null          | No (0)      |
| 46 | HasLeadEveryLap                | NUMERIC        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 