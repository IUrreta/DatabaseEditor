Save_CarConfig table

[Column Guide](../../../columnFlagsGuide.md)

Column Information:

| ID | Name                       | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------------|----------------|----------|---------------|-------------|
| 0  | LoadoutID                  | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID                     | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | DriverConfidence           | DECIMAL (6, 3) | No (0)   | null          | No (0)      |
| 3  | CurrentSetupToe            | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 4  | CurrentSetupCamber         | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 5  | CurrentSetupAntiRollBars   | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 6  | CurrentSetupFrontWingAngle | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 7  | CurrentSetupRearWingAngle  | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 8  | BestSetupToe               | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 9  | BestSetupCamber            | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 10 | BestSetupAntiRollBars      | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 11 | BestSetupFrontWingAngle    | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 12 | BestSetupRearWingAngle     | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 13 | PerfectSetupToe            | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 14 | PerfectSetupCamber         | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 15 | PerfectSetupAntiRollBars   | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 16 | PerfectSetupFrontWingAngle | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 17 | PerfectSetupRearWingAngle  | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 18 | ActiveFeedbackEffect       | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 19 | SetupFeedbackOrder1        | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 20 | SetupFeedbackOrder2        | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 21 | SetupFeedbackOrder3        | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 22 | SetupFeedbackOrder4        | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 23 | SetupFeedbackOrder5        | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 24 | FeedbackRemainingThisRun   | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 25 | SessionSetupFuelLoad       | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 26 | SessionSetupTyreID         | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 27 | SessionSetupTyreType       | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 28 | TrackAcclimatisation       | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 29 | DriverDevelopment          | DECIMAL (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 30 | RunPlanLaps                | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 31 | LeftGarageForTheFirstTime  | BOOLEAN        | Yes (1)  | '0'           | No (0)      |
| 32 | ConfigTimeCarSetup         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 33 | ConfigTimeComponent        | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 34 | ConfigTimeRunPlan          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 35 | ConfigTimeTyres            | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 36 | ConfigTimeTotal            | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 37 | ConfigTimeGarageSetupEnd   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 38 | ConfigTimeRemaining        | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 