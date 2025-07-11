Staff_DriverData table

[Column Guide](../../columnFlagsGuide.md)

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

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                 | Local Column          | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------|-----------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_GameData](Staff_GameData.md)           | StaffID               | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_DriverNumbers](Staff_DriverNumbers.md) | LastKnownDriverNumber | Number         | NO ACTION | NO ACTION | NONE       |

----------------------------------------------------------

FKs this table points to

| ID | Seq | Foreign Table                                                                                                   | Local Column | Foreign Column     |
|----|-----|-----------------------------------------------------------------------------------------------------------------|--------------|--------------------|
| 0  | 0   | [Races_Tracks](../../race/Races_Tracks.md)                                                                      | StaffID      | FastestLapDriverID | 
| 1  | 0   | [Races_Strategies](../../race/Races_Strategies.md)                                                              | StaffID      | DriverID           | 
| 2  | 0   | [Scouting_Staff_DriverRivalryEventLogs](../../scouting/staff/Scouting_Staff_DriverRivalryEventLogs.md)                | StaffID      | RivalID            | 
| 2  | 1   | [Scouting_Staff_DriverRivalryEventLogs](../../scouting/staff/Scouting_Staff_DriverRivalryEventLogs.md)                | StaffID      | DriverID           | 
| 3  | 0   | [Staff_DriverRivalryEventLogs](../Staff_DriverRivalryEventLogs.md)                                              | StaffID      | RivalID            | 
| 3  | 1   | [Staff_DriverRivalryEventLogs](../Staff_DriverRivalryEventLogs.md)                                              | StaffID      | DriverID           | 
| 4  | 0   | [Races_PracticeResults](../../race/results/Races_PracticeResults.md)                                                    | StaffID      | DriverID           | 
| 5  | 0   | [Staff_RaceEngineerDriverAssignments](../Staff_RaceEngineerDriverAssignments.md)                                | StaffID      | DriverID           | 
| 6  | 0   | [Races_DriverStandings](../../race/Races_DriverStandings.md)                                                    | StaffID      | DriverID           | 
| 7  | 0   | [Staff_DriverPerformanceEvaluations](../Staff_DriverPerformanceEvaluations.md)                                  | StaffID      | StaffID            | 
| 8  | 0   | [Staff_Driver_RaceRecordPerSeason](../Staff_Driver_RaceRecordPerSeason.md)                                      | StaffID      | StaffID            | 
| 9  | 0   | [Races_PitStopResults](../../race/pit/Races_PitStopResults.md)                                                      | StaffID      | DriverID           | 
| 9  | 1   | [Races_PitStopTimings](../../race/pit/Races_PitStopTimings.md)                                                      | StaffID      | DriverID           | 
| 10 | 0   | [Teams_PitCrewRecordBeforeGameStart](../../team/pitcrew/Teams_PitCrewRecordBeforeGameStart.md)                          | StaffID      | DriverID           | 
| 11 | 0   | [Teams_PitCrewRecordPerSeason](../../team/pitcrew/Teams_PitCrewRecordPerSeason.md)                                      | StaffID      | DriverID           | 
| 12 | 0   | [Teams_PitCrewRecordSinceGameStart](../../team/pitcrew/Teams_PitCrewRecordSinceGameStart.md)                            | StaffID      | DriverID           | 
| 13 | 0   | [Sponsorship_ActivePackages_SecondaryBonuses](../../sponsorship/Sponsorship_ActivePackages_SecondaryBonuses.md) | StaffID      | AffiliateID        | 
| 14 | 0   | [Sponsorship_EngagementActivities_Choices](../../sponsorship/engagement/Sponsorship_EngagementActivities_Choices.md)       | StaffID      | AffiliateID        | 
| 15 | 0   | [Sponsorship_AffiliateEngagementActivities](../../sponsorship/engagement/Sponsorship_AffiliateEngagementActivities.md)     | StaffID      | StaffID            | 
| 16 | 0   | [Staff_Driver_RaceRecordSinceGameStart](../Staff_Driver_RaceRecordSinceGameStart.md)                            | StaffID      | StaffID            | 
| 17 | 0   | [Staff_Driver_RaceRecordBeforeGameStart](../Staff_Driver_RaceRecordBeforeGameStart.md)                          | StaffID      | StaffID            | 
| 18 | 0   | [Races_Results](../../race/results/Races_Results.md)                                                                    | StaffID      | DriverID           | 
| 19 | 0   | [Races_SprintResults](../../race/results/Races_SprintResults.md)                                                        | StaffID      | DriverID           | 
| 20 | 0   | [Races_FeatureRaceResults](../../race/Races_FeatureRaceResults.md)                                              | StaffID      | DriverID           | 
| 21 | 0   | [Sponsorship_RaceBonuses](../../sponsorship/Sponsorship_RaceBonuses.md)                                         | StaffID      | DriverID           | 
| 22 | 0   | [Races_QualifyingResults](../../race/results/Races_QualifyingResults.md)                                                | StaffID      | DriverID           | 
