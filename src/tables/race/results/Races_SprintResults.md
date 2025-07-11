Races_SprintResults table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type      | Not Null | Default Value | Primary Key |
|----|--------------------|----------------|----------|---------------|-------------|
| 0  | SeasonID           | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | RaceID             | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | FinishingPos       | INTEGER        | Yes (1)  | null          | Order 3 (3) |
| 3  | DriverID           | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | TeamID             | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | FastestLap         | DECIMAL (5, 2) | Yes (1)  | null          | No (0)      |
| 6  | DNF                | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | LapCount           | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | TimeDeltaFromLead  | DECIMAL (5, 2) | Yes (1)  | null          | No (0)      |
| 9  | GridPenalty        | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | AverageLap         | INTEGER        | No (0)   | null          | No (0)      |
| 11 | RaceScore          | INTEGER        | No (0)   | null          | No (0)      |
| 12 | RaceTime           | DECIMAL (5, 2) | Yes (1)  | null          | No (0)      |
| 13 | IncidentSeverity   | INTEGER        | No (0)   | null          | No (0)      |
| 14 | RaceFormula        | INTEGER        | No (0)   | '1'           | Order 4 (4) |
| 15 | ChampionshipPoints | INTEGER        | No (0)   | '0'           | No (0)      |
| 16 | Performance        | INTEGER        | Yes (1)  | '2'           | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                                          | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|----------------------------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../../team/Teams.md)                                                              | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Seasons](../../season/Seasons.md)                                                        | SeasonID     | SeasonID       | NO ACTION | CASCADE   | NONE       |
| 2  | 0   | [Races](../Races.md)                                                                      | RaceID       | RaceID         | NO ACTION | CASCADE   | NONE       |
| 3  | 0   | [Staff_DriverData](../../staff/Staff_DriverData.md)                                  | DriverID     | StaffID        | CASCADE   | CASCADE   | NONE       |
| 4  | 0   | [Staff_Enum_DriverSessionPerformance](../../staff/Staff_Enum_DriverSessionPerformance.md) | Performance  | Value          | RESTRICT  | CASCADE   | NONE       |