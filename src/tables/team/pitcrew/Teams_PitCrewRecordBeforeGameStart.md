Teams_PitCrewRecordBeforeGameStart table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------|----------------|----------|---------------|-------------|
| 0  | TeamID               | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | CompetitionWins      | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | FastestPitStopsTotal | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | FastestPitStopTime   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | TotalPointsScored    | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | DriverID             | INTEGER        | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_DriverData](../../staff/Staff_DriverData.md) | DriverID     | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Teams](../Teams.md)                             | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |