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
| 0  | 0   | [Countries](../Countries.md) | CountryID    | CountryID      | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                   | Local Column | Foreign Column |
|----|-----|---------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Staff_Contracts](../staff/data/Staff_Contracts.md)                             | TeamID       | TeamID         |
| 1  | 0   | [Board_Objectives](../board/objectives/Board_Objectives.md)                     | TeamID       | TeamID         |
| 2  | 0   | [Board_SeasonObjectives](../board/objectives/Board_SeasonObjectives.md)         | TeamID       | TeamID         |
| 3  | 0   | [Finance_TeamBalance](../finance/Finance_TeamBalance.md)                        | TeamID       | TeamID         |
| 4  | 0   | [Finance_Transactions](../finance/Finance_Transactions.md)                      | TeamID       | TeamID         |
| 5  | 0   | [Parts_Designs](../parts/Parts_Designs.md)                                      | TeamID       | TeamID         |
| 6  | 0   | [Parts_Designs_TeamData](../parts/Parts_Designs_TeamData.md)                    | TeamID       | TeamID         |
| 7  | 0   | [Parts_NamingConventions](../parts/Parts_NamingConventions.md)                  | TeamID       | TeamID         |
| 8  | 0   | [Parts_PowertrainRaceHistoryData](../parts/Parts_PowertrainRaceHistoryData.md)  | TeamID       | TeamID         |
| 9  | 0   | [Parts_TeamHistory](../parts/Parts_TeamHistory.md)                              | TeamID       | TeamID         |
| 10 | 0   | [Races_TeamPerformance](../race/Races_TeamPerformance.md)                       | TeamID       | TeamID         |
| 11 | 0   | [Races_TeamStandings](../race/Races_TeamStandings.md)                           | TeamID       | TeamID         |
| 12 | 0   | [Regulations_TeamVotes](../regulations/Regulations_TeamVotes.md)                | TeamID       | TeamID         |
| 13 | 0   | [SubTeam_Assignments](../subteam/SubTeam_Assignments.md)                        | TeamID       | TeamID         |
| 14 | 0   | [SubTeam_Ownership](../subteam/SubTeam_Ownership.md)                            | TeamID       | TeamID         |
| 15 | 0   | [Parts_TeamExpertise](../parts/Parts_TeamExpertise.md)                          | TeamID       | TeamID         |
| 16 | 0   | [Save_Strategist](../save/Save_Strategist.md)                                   | TeamID       | TeamID         |
| 17 | 0   | [Save_Strategist_QualificationRun](../save/Save_Strategist_QualificationRun.md) | TeamID       | TeamID         |
| 18 | 0   | [Races_PracticeResults](../race/Races_PracticeResults.md)                       | TeamID       | TeamID         |
