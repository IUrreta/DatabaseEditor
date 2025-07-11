
Save_RaceSimCars_PitStop table

[Column Guide](../../../columnFlagsGuide.md)

Column Information:

| ID | Name                       | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex                   | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | PitStopState               | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | PitLaneReason              | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | PitStopStartTime           | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | PitStopJackUpEndTime       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | PitStopTyresEndTime        | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | PitStopWingEndTime         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 7  | PitStopReleaseEndTime      | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 8  | PitLaneEntranceTime        | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 9  | PitStopOptions             | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | NewTyreSetID               | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | PitStopsHadNum             | INTEGER        | Yes (1)  | null          | No (0)      |
| 12 | QueueFrontWingReplace      | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 13 | DelayPitByOneLap           | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 14 | GarageSetupEndTime         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 15 | MistakeStage               | INTEGER        | Yes (1)  | null          | No (0)      |
| 16 | MistakeSeverity            | INTEGER        | Yes (1)  | null          | No (0)      |
| 17 | MistakeLocation            | INTEGER        | Yes (1)  | null          | No (0)      |
| 18 | MistakeDelay               | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 19 | PitStopRaiseCarTime        | DECIMAL (6, 3) | Yes (1)  | '0'           | No (0)      |
| 20 | PitStopLoosenTyreTime      | DECIMAL (6, 3) | Yes (1)  | '0'           | No (0)      |
| 21 | PitStopRemoveTyresTime     | DECIMAL (6, 3) | Yes (1)  | '0'           | No (0)      |
| 22 | PitStopReplaceTyresTime    | DECIMAL (6, 3) | Yes (1)  | '0'           | No (0)      |
| 23 | PitStopTightenTyresTime    | DECIMAL (6, 3) | Yes (1)  | '0'           | No (0)      |
| 24 | PitStopLowerCarTime        | DECIMAL (6, 3) | Yes (1)  | '0'           | No (0)      |
| 25 | PitStopReleaseCarTime      | DECIMAL (6, 3) | Yes (1)  | '0'           | No (0)      |
| 26 | PitStopWingAdjustmentTime  | DECIMAL (6, 3) | Yes (1)  | '0'           | No (0)      |
| 27 | PitStopWingReplacementTime | DECIMAL (6, 3) | Yes (1)  | '0'           | No (0)      |
| 28 | PreviousPitStopLap         | INTEGER        | Yes (1)  | '0'           | No (0)      |

Table has no FKs that point to it. 