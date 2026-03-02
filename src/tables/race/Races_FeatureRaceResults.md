Races_FeatureRaceResults table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type      | Not Null | Default Value | Primary Key |
|----|--------------------|----------------|----------|---------------|-------------|
| 0  | SeasonID           | INT            | No (0)   | null          | Yes (1)     |
| 1  | RaceID             | INT            | No (0)   | null          | Order 2 (2) |
| 2  | FinishingPos       | INT            | No (0)   | null          | Order 3 (3) |
| 3  | DriverID           | INT            | No (0)   | null          | No (0)      |
| 4  | TeamID             | INT            | No (0)   | null          | No (0)      |
| 5  | FastestLap         | NUM            | No (0)   | null          | No (0)      |
| 6  | LapCount           | INT            | No (0)   | null          | No (0)      |
| 7  | TimeDeltaFromLead  | NUM            | No (0)   | null          | No (0)      |
| 8  | AverageLap         | NUM            | No (0)   | null          | No (0)      |
| 9  | RaceScore          | NUM            | No (0)   | null          | No (0)      |
| 10 | RaceTime           | NUM            | No (0)   | null          | No (0)      |
| 11 | IncidentSeverity   | INT            | No (0)   | null          | No (0)      |
| 12 | RaceFormula        | INT            | No (0)   | null          | Order 4 (4) |
| 13 | PitStopTime        | DECIMAL (5, 2) | No (0)   | null          | No (0)      |
| 14 | ChampionshipPoints | INTEGER        | No (0)   | '0'           | No (0)      |
| 15 | Performance        | INTEGER        | Yes (1)  | '2'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                                          | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|----------------------------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_DriverData](../staff/driver/Staff_DriverData.md)                                  | DriverID     | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Teams](../team/Teams.md)                                                              | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Races](../race/Races.md)                                                              | RaceID       | RaceID         | NO ACTION | CASCADE   | NONE       |
| 3  | 0   | [Seasons](../season/Seasons.md)                                                        | SeasonID     | SeasonID       | NO ACTION | CASCADE   | NONE       |
| 4  | 0   | [Staff_Enum_DriverSessionPerformance](../staff/enum/Staff_Enum_DriverSessionPerformance.md) | Performance  | Value          | RESTRICT  | CASCADE   | NONE       |