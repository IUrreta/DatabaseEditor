Teams table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                          | Data Type | Not Null | Default Value | Primary Key |
|----|-------------------------------|-----------|----------|---------------|-------------|
| 0  | Formula                       | INTEGER   | Yes (1)  | '1'           | No (0)      |
| 1  | PredictedRanking              | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | TeamID                        | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 3  | TeamName                      | TEXT      | Yes (1)  | null          | No (0)      |
| 4  | TeamNameLocKey                | TEXT      | Yes (1)  | null          | No (0)      |
| 5  | Location                      | TEXT      | Yes (1)  | null          | No (0)      |
| 6  | ProfileText                   | TEXT      | Yes (1)  | null          | No (0)      |
| 7  | SeasonsEnteredBeforeGameStart | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 8  | FirstYearWithCurrentBranding  | INTEGER   | Yes (1)  | null          | No (0)      |
| 9  | IsCustomTeam                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 10 | CountryID                     | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Countries](../countries/Countries.md) | CountryID    | CountryID      | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                                               | Local Column | Foreign Column                    |
|----|-----|-------------------------------------------------------------------------------------------------------------|--------------|-----------------------------------|
| 0  | 0   | [Staff_Contracts](../staff/data/Staff_Contracts.md)                                                         | TeamID       | TeamID                            |
| 1  | 0   | [Board_Objectives](../board/objectives/Board_Objectives.md)                                                 | TeamID       | TeamID                            |
| 2  | 0   | [Board_SeasonObjectives](../board/objectives/Board_SeasonObjectives.md)                                     | TeamID       | TeamID                            |
| 3  | 0   | [Finance_TeamBalance](../finance/Finance_TeamBalance.md)                                                    | TeamID       | TeamID                            |
| 4  | 0   | [Finance_Transactions](../finance/Finance_Transactions.md)                                                  | TeamID       | TeamID                            |
| 5  | 0   | [Parts_Designs](../parts/Parts_Designs.md)                                                                  | TeamID       | TeamID                            |
| 6  | 0   | [Parts_Designs_TeamData](../parts/Parts_Designs_TeamData.md)                                                | TeamID       | TeamID                            |
| 7  | 0   | [Parts_NamingConventions](../parts/Parts_NamingConventions.md)                                              | TeamID       | TeamID                            |
| 8  | 0   | [Parts_PowertrainRaceHistoryData](../parts/Parts_PowertrainRaceHistoryData.md)                              | TeamID       | TeamID                            |
| 9  | 0   | [Parts_TeamHistory](../parts/Parts_TeamHistory.md)                                                          | TeamID       | TeamID                            |
| 10 | 0   | [Races_TeamPerformance](../race/Races_TeamPerformance.md)                                                   | TeamID       | TeamID                            |
| 11 | 0   | [Races_TeamStandings](../race/Races_TeamStandings.md)                                                       | TeamID       | TeamID                            |
| 12 | 0   | [Regulations_TeamVotes](../regulations/Regulations_TeamVotes.md)                                            | TeamID       | TeamID                            |
| 13 | 0   | [SubTeam_Assignments](../subteam/SubTeam_Assignments.md)                                                    | TeamID       | TeamID                            |
| 14 | 0   | [SubTeam_Ownership](../subteam/SubTeam_Ownership.md)                                                        | TeamID       | TeamID                            |
| 15 | 0   | [Parts_TeamExpertise](../parts/Parts_TeamExpertise.md)                                                      | TeamID       | TeamID                            |
| 16 | 0   | [Save_Strategist](../save/Save_Strategist.md)                                                               | TeamID       | TeamID                            |
| 17 | 0   | [Save_Strategist_QualificationRun](../save/Save_Strategist_QualificationRun.md)                             | TeamID       | TeamID                            |
| 18 | 0   | [Races_PracticeResults](../race/Races_PracticeResults.md)                                                   | TeamID       | TeamID                            |
| 19 | 0   | [Buildings_HQ](../building/Buildings_HQ.md)                                                                 | TeamID       | TeamID                            |
| 20 | 0   | [Scouting_Staff_Bonuses](../scouting/Scouting_Staff_Bonuses.md)                                             | TeamID       | TeamID                            |
| 21 | 0   | [Scouting_Staff_PerformanceStats](../scouting/Scouting_Staff_PerformanceStats.md)                           | TeamID       | TeamID                            |
| 22 | 0   | [Scouting_Staff_RaceEngineerDriverAssignments](../scouting/Scouting_Staff_RaceEngineerDriverAssignments.md) | TeamID       | TeamID                            |
| 23 | 0   | [Scouting_Staff_Traits](../scouting/Scouting_Staff_Traits.md)                                               | TeamID       | TeamID                            |
| 24 | 0   | [Staff_NarrativeData](../staff/Staff_NarrativeData.md)                                                      | TeamID       | TeamID                            |
| 25 | 0   | [Parts_CarLoadout](../parts/Parts_CarLoadout.md)                                                            | TeamID       | TeamID                            |
| 26 | 0   | [Teams_RaceRecordPerSeason](racerecord/Teams_RaceRecordPerSeason.md)                                                   | TeamID       | TeamID                            |
| 27 | 0   | [Teams_RaceRecordSinceGameStart](racerecord/Teams_RaceRecordSinceGameStart.md)                                         | TeamID       | TeamID                            |
| 28 | 0   | [Buildings_HQ_History](../building/Buildings_HQ_History.md)                                                 | TeamID       | TeamID                            |
| 29 | 0   | [Races_PitCrewStandings](../race/Races_PitCrewStandings.md)                                                 | TeamID       | TeamID                            |
| 30 | 0   | [Races_PitStopResults](../race/Races_PitStopResults.md)                                                     | TeamID       | TeamID                            |
| 31 | 0   | [Races_PitStopTimings](../race/Races_PitStopTimings.md)                                                     | TeamID       | TeamID                            |
| 32 | 0   | [Staff_PitCrew_DevelopmentPlan](../staff/Staff_PitCrew_DevelopmentPlan.md)                                  | TeamID       | TeamID                            |
| 33 | 0   | [Staff_PitCrew_DevelopmentPlanGlobalData](../staff/Staff_PitCrew_DevelopmentPlanGlobalData.md)              | TeamID       | TeamID                            |
| 34 | 0   | [Staff_PitCrew_PerformanceStats](../staff/Staff_PitCrew_PerformanceStats.md)                                | TeamID       | TeamID                            |
| 35 | 0   | [Staff_PitCrew_RaceWeekendFatigue](../staff/Staff_PitCrew_RaceWeekendFatigue.md)                            | TeamID       | TeamID                            |
| 36 | 0   | [Teams_PitCrewRecordBeforeGameStart](pitcrew/Teams_PitCrewRecordBeforeGameStart.md)                                 | TeamID       | TeamID                            |
| 37 | 0   | [Teams_PitCrewRecordPerSeason](pitcrew/Teams_PitCrewRecordPerSeason.md)                                             | TeamID       | TeamID                            |
| 38 | 0   | [Teams_PitCrewRecordSinceGameStart](pitcrew/Teams_PitCrewRecordSinceGameStart.md)                                   | TeamID       | TeamID                            |
| 39 | 0   | [Teams_RaceRecordBeforeGameStart](racerecord/Teams_RaceRecordBeforeGameStart.md)                                       | TeamID       | TeamID                            |
| 40 | 0   | [Save_Strategist_Practice](../save/Save_Strategist_Practice.md)                                             | TeamID       | TeamID                            |
| 41 | 0   | [Player_History](../player/Player_History.md)                                                               | TeamID       | TeamID                            |
| 41 | 0   | [Parts_ParcFerme](../parts/Parts_ParcFerme.md)                                                              | TeamID       | TeamID                            |
| 42 | 0   | [Staff_CareerHistory](../staff/Staff_CareerHistory.md)                                                      | TeamID       | TeamID                            |
| 43 | 0   | [Teams_Colours](Teams_Colours.md)                                                                           | TeamID       | TeamID                            |
| 44 | 0   | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | HighestAnnualIncomeTeamID         |
| 44 | 1   | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | HighestTeamRatingTeamID           |
| 44 | 2   | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | BestSprintFinishTeamID            |
| 44 | 3   | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | BestConstructorChampionshipTeamID |
| 44 | 4   | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | BestDriverChampionshipTeamID      |
| 44 | 5   | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | BestFinishTeamID                  |
| 44 | 6   | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | BestQualifyingTeamID              |
| 44 | 7   | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | FirstPointsTeamID                 |
| 44 | 8   | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | FirstPodiumTeamID                 |
| 44 | 9   | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | LastWinTeamID                     |
| 44 | 10  | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | FirstWinTeamID                    |
| 44 | 11  | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | LastRaceTeamID                    |
| 44 | 12  | [Player_Record](../player/Player_Record.md)                                                                 | TeamID       | FirstRaceTeamID                   |
| 45 | 0   | [Scouting_Staff_Bookmark](../scouting/Scouting_Staff_Bookmark.md)                                           | TeamID       | TeamID                            |
| 46 | 0   | [Sponsorship_AvailablePackages](../sponsorship/Sponsorship_AvailablePackages.md)                            | TeamID       | TeamID                            |
| 47 | 0   | [Staff_Team_CAS](../staff/Staff_Team_CAS.md)                                                                | TeamID       | TeamID                            |
| 48 | 0   | [Teams_AI_Records](Teams_AI_Records.md)                                                                     | TeamID       | TeamID                            |
| 49 | 0   | [Parts_EnginePurchase_MonthlyPayments](../parts/Parts_EnginePurchase_MonthlyPayments.md)                    | TeamID       | TeamID                            |
| 50 | 0   | [Parts_Enum_EngineManufacturers](../parts/Parts_Enum_EngineManufacturers.md)                                | TeamID       | TeamID                            |
| 51 | 0   | [Staff_ContractPatience](../staff/Staff_ContractPatience.md)                                                | TeamID       | TeamID                            |
| 52 | 0   | [Sponsorship_ActivePackages](../sponsorship/Sponsorship_ActivePackages.md)                                  | TeamID       | TeamID                            |
| 53 | 0   | [Finance_TeamBudget_SpendingBuckets](../finance/Finance_TeamBudget_SpendingBuckets.md)                      | TeamID       | TeamID                            |
| 54 | 0   | [Finance_TeamBudget](../finance/Finance_TeamBudget.md)                                                      | TeamID       | TeamID                            |
| 55 | 0   | [Scouting](../scouting/Scouting.md)                                                                         | TeamID       | TeamID                            |
| 56 | 0   | [Sponsorship_EngagementActivities_Locks](../sponsorship/Sponsorship_EngagementActivities_Locks.md)          | TeamID       | TeamID                            |
| 57 | 0   | [Sponsorship_EngagementActivities_Choices](../sponsorship/Sponsorship_EngagementActivities_Choices.md)      | TeamID       | TeamID                            |
| 58 | 0   | [Player](../player/Player.md)                                                                               | TeamID       | TeamID                            |
| 59 | 0   | [Staff_ContractOffers](../staff/Staff_ContractOffers.md)                                                    | TeamID       | TeamID                            |
| 60 | 0   | [Staff_Contracts](../staff/Staff_Contracts.md)                                                              | TeamID       | TeamID                            |
| 61 | 0   | [Races_Results](../race/Races_Results.md)                                                                   | TeamID       | TeamID                            |
| 62 | 0   | [Races_SprintResults](../race/Races_SprintResults.md)                                                       | TeamID       | TeamID                            |
| 63 | 0   | [Races_FeatureRaceResults](../race/Races_FeatureRaceResults.md)                                             | TeamID       | TeamID                            |
| 64 | 0   | [Board_TeamRating](../board/Board_TeamRating.md)                                                            | TeamID       | TeamID                            |
| 65 | 0   | [Races_QualifyingResults](../race/Races_QualifyingResults.md)                                               | TeamID       | TeamID                            |
| 66 | 0   | [Races_GridPenalties](../race/Races_GridPenalties.md)                                                       | TeamID       | TeamID                            |
| 67 | 0   | [Sponsorship_EngagementActivities](../sponsorship/Sponsorship_EngagementActivities.md)                      | TeamID       | TeamID                            |
