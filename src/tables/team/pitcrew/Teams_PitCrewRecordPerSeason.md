Teams_PitCrewRecordPerSeason table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------|----------------|----------|---------------|-------------|
| 0  | TeamID               | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 1  | SeasonID             | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 2  | CompetitionWins      | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | FastestPitStopsTotal | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | FastestPitStopTime   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | TotalPointsScored    | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | DriverID             | INTEGER        | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_DriverData](../../staff/driver/Staff_DriverData.md) | DriverID     | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Seasons](../../season/Seasons.md)                       | SeasonID     | SeasonID       | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Teams](../Teams.md)                             | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |