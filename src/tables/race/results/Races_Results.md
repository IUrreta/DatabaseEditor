Races_Results table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                        | Data Type       | Not Null | Default Value | Primary Key |
|----|-----------------------------|-----------------|----------|---------------|-------------|
| 0  | Season                      | INTEGER         | Yes (1)  | null          | Yes (1)     |
| 1  | RaceID                      | INTEGER         | Yes (1)  | null          | Order 2 (2) |
| 2  | FinishingPos                | INTEGER         | Yes (1)  | null          | Order 3 (3) |
| 3  | DriverID                    | INTEGER         | Yes (1)  | null          | No (0)      |
| 4  | TeamID                      | INTEGER         | Yes (1)  | null          | No (0)      |
| 5  | Laps                        | INTEGER         | Yes (1)  | null          | No (0)      |
| 6  | Time                        | decimal (8, 3)  | Yes (1)  | null          | No (0)      |
| 7  | FastestLap                  | decimal (8, 3)  | Yes (1)  | null          | No (0)      |
| 8  | Points                      | INTEGER         | Yes (1)  | null          | No (0)      |
| 9  | DNF                         | INTEGER         | Yes (1)  | null          | No (0)      |
| 10 | SuccessfulOvertakes         | INTEGER         | Yes (1)  | null          | No (0)      |
| 11 | FailedOvertakes             | INTEGER         | Yes (1)  | null          | No (0)      |
| 12 | SuccessfulDefends           | INTEGER         | Yes (1)  | null          | No (0)      |
| 13 | FailedDefends               | INTEGER         | Yes (1)  | null          | No (0)      |
| 14 | SafetyCarDeployments        | INTEGER         | Yes (1)  | null          | No (0)      |
| 15 | VirtualSafetyCarDeployments | INTEGER         | Yes (1)  | '0'           | No (0)      |
| 16 | StartingPos                 | INTEGER         | Yes (1)  | null          | No (0)      |
| 17 | FuelUsed                    | decimal (10, 4) | Yes (1)  | '0.0'         | No (0)      |
| 18 | Performance                 | INTEGER         | Yes (1)  | '2'           | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                                          | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|----------------------------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../../team/Teams.md)                                                              | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Seasons](../../season/Seasons.md)                                                        | Season       | SeasonID       | NO ACTION | CASCADE   | NONE       |
| 2  | 0   | [Races](../Races.md)                                                                      | RaceID       | RaceID         | NO ACTION | CASCADE   | NONE       |
| 3  | 0   | [Staff_DriverData](../../staff/data/Staff_DriverData.md)                                  | DriverID     | StaffID        | CASCADE   | CASCADE   | NONE       |
| 4  | 0   | [Staff_Enum_DriverSessionPerformance](../../staff/Staff_Enum_DriverSessionPerformance.md) | Performance  | Value          | RESTRICT  | CASCADE   | NONE       |