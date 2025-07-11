Seasons table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type  | Not Null | Default Value | Primary Key |
|----|--------------------|------------|----------|---------------|-------------|
| 0  | SeasonID           | INTEGER    | Yes (1)  | null          | Yes (1)     |
| 1  | PrizePool          | bigint(20) | Yes (1)  | 500000000     | No (0)      |
| 2  | EntryBaseFee       | bigint(20) | Yes (1)  | 556509        | No (0)      |
| 3  | EntryPerPointFirst | bigint(20) | Yes (1)  | 6677          | No (0)      |
| 4  | EntryPerPointOther | bigint(20) | Yes (1)  | 5563          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                                                          | Local Column | Foreign Column | 
|----|-----|----------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Player_State](../player/Player_State.md)                                              | SeasonID     | CurrentSeason  |
| 1  | 0   | [Races](../race/Races.md)                                                              | SeasonID     | SeasonID       |
| 2  | 0   | [Board_Confidence](../board/confidence/Board_Confidence.md)                            | SeasonID     | Season         |
| 3  | 0   | [Board_SeasonObjectives](../board/objectives/Board_SeasonObjectives.md)                | SeasonID     | SeasonID       |
| 4  | 0   | [Parts_TeamHistory](../parts/Parts_TeamHistory.md)                                     | SeasonID     | SeasonID       |
| 5  | 0   | [Races_Strategies](../race/Races_Strategies.md)                                        | SeasonID     | SeasonID       |
| 6  | 0   | [Races_TeamPerformance](../race/Races_TeamPerformance.md)                              | SeasonID     | SeasonID       |
| 7  | 0   | [Races_TeamStandings](../race/Races_TeamStandings.md)                                  | SeasonID     | SeasonID       |
| 8  | 0   | [Races_PracticeResults](../race/Races_PracticeResults.md)                              | SeasonID     | SeasonID       |
| 9  | 0   | [Races_DriverStandings](../race/Races_DriverStandings.md)                              | SeasonID     | SeasonID       |
| 10 | 0   | [Staff_Driver_RaceRecordPerSeason](../staff/Staff_Driver_RaceRecordPerSeason.md)       | SeasonID     | SeasonID       |
| 11 | 0   | [Teams_RaceRecordPerSeason](../team/Teams_RaceRecordPerSeason.md)                      | SeasonID     | SeasonID       |
| 12 | 0   | [Races_PitCrewStandings](../race/Races_PitCrewStandings.md)                            | SeasonID     | SeasonID       |
| 13 | 0   | [Races_PitStopResults](../race/Races_PitStopResults.md)                                | SeasonID     | SeasonID       |
| 14 | 0   | [Races_PitStopTimings](../race/Races_PitStopTimings.md)                                | SeasonID     | SeasonID       |
| 15 | 0   | [Teams_PitCrewRecordPerSeason](../team/Teams_PitCrewRecordPerSeason.md)                | SeasonID     | SeasonID       |
| 16 | 0   | [Teams_AI_Records](../team/Teams_AI_Records.md)                                        | SeasonID     | SeasonID       |
| 17 | 0   | [Finance_TeamBudget_SpendingBuckets](../finance/Finance_TeamBudget_SpendingBuckets.md) | SeasonID     | SeasonID       |
| 18 | 0   | [Finance_TeamBudget](../finance/Finance_TeamBudget.md)                                 | SeasonID     | SeasonID       |
| 19 | 0   | [Races_Results](../race/Races_Results.md)                                              | SeasonID     | SeasonID       |
| 20 | 0   | [Races_SprintResults](../race/Races_SprintResults.md)                                  | SeasonID     | SeasonID       |
| 21 | 0   | [Races_FeatureRaceResults](../race/Races_FeatureRaceResults.md)                        | SeasonID     | SeasonID       |
| 22 | 0   | [Board_TeamRating](../board/Board_TeamRating.md)                                       | SeasonID     | SeasonID       |
| 23 | 0   | [Races_QualifyingResults](../race/Races_QualifyingResults.md)                          | SeasonID     | SeasonID       |
