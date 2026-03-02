Races_PracticeResults table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------------|----------------|----------|---------------|-------------|
| 0  | SeasonID        | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | RaceID          | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | PracticeSession | INTEGER        | Yes (1)  | null          | Order 3 (3) |
| 3  | DriverID        | INTEGER        | Yes (1)  | null          | Order 4 (4) |
| 4  | TeamID          | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | TimeOnTrack     | decimal (8, 2) | Yes (1)  | null          | No (0)      |
| 6  | SessionDuration | decimal (8, 2) | Yes (1)  | null          | No (0)      |
| 7  | BestLapTime     | decimal (7, 3) | Yes (1)  | null          | No (0)      |
| 8  | BestLapTyre     | INTEGER        | Yes (1)  | null          | No (0)      |
| 9  | LapCount        | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | GridPenalty     | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | RaceFormula     | INTEGER        | No (0)   | '1'           | Order 5 (5) |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../../team/Teams.md)                             | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Seasons](../../season/Seasons.md)                       | SeasonID     | SeasonID       | NO ACTION | CASCADE   | NONE       |
| 2  | 0   | [Races](../Races.md)                             | RaceID       | RaceID         | NO ACTION | CASCADE   | NONE       |
| 3  | 0   | [Staff_DriverData](../../staff/driver/Staff_DriverData.md) | DriverID     | StaffID        | NO ACTION | CASCADE   | NONE       |