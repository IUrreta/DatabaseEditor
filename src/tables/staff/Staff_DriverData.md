Staff_DriverData table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                          | Data Type | Not Null | Default Value                | Primary Key |
|----|-------------------------------|-----------|----------|------------------------------|-------------|
| 0  | StaffID                       | INTEGER   | Yes (1)  | null                         | Yes (1)     |
| 1  | Improvability                 | INTEGER   | Yes (1)  | '50'                         | No (0)      |
| 2  | Aggression                    | INTEGER   | Yes (1)  | '50'                         | No (0)      |
| 3  | DriverCode                    | TEXT      | Yes (1)  | ''[DriverCode_Placeholder]'' | No (0)      |
| 4  | WantsChampionDriverNumber     | INTEGER   | No (0)   | 'NULL'                       | No (0)      |
| 5  | LastKnownDriverNumber         | INTEGER   | No (0)   | 'NULL'                       | No (0)      |
| 6  | AssignedCarNumber             | INTEGER   | No (0)   | 'NULL'                       | No (0)      |
| 7  | HasSuperLicense               | INTEGER   | Yes (1)  | '0'                          | No (0)      |
| 8  | HasWonF2                      | INTEGER   | No (0)   | null                         | No (0)      |
| 9  | HasWonF3                      | INTEGER   | No (0)   | null                         | No (0)      |
| 10 | HasRacedEnoughToJoinF1        | INTEGER   | Yes (1)  | '0'                          | No (0)      |
| 11 | PerformanceEvaluationDay      | INTEGER   | No (0)   | null                         | No (0)      |
| 12 | Marketability                 | INTEGER   | Yes (1)  | '50'                         | No (0)      |
| 13 | TargetMarketability           | INTEGER   | Yes (1)  | '50'                         | No (0)      |
| 14 | MarketabilityProgress         | INTEGER   | Yes (1)  | '0'                          | No (0)      |
| 15 | FeederSeriesAssignedCarNumber | INTEGER   | No (0)   | null                         | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table       | Local Column          | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------|-----------------------|----------------|-----------|-----------|------------|
| 0  | 0   | Staff_GameData      | StaffID               | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | Staff_DriverNumbers | LastKnownDriverNumber | Number         | NO ACTION | NO ACTION | NONE       |

----------------------------------------------------------

FKs this table points to

| ID | Seq | Foreign Table                           | Local Column | Foreign Column     |
|----|-----|-----------------------------------------|--------------|--------------------|
| 0  | 0   | [Races_Tracks](../race/Races_Tracks.md) | StaffID      | FastestLapDriverID | 
