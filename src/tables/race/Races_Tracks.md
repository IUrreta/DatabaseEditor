Races_Tracks table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                  | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------------------|----------------|----------|---------------|-------------|
| 0  | TrackID               | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Name                  | TEXT           | Yes (1)  | null          | No (0)      |
| 2  | CountryID             | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | Laps                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | FirstRace             | bigint (20)    | Yes (1)  | null          | No (0)      |
| 5  | ProfileText           | mediumtext     | Yes (1)  | null          | No (0)      |
| 6  | TrackLength           | decimal (8, 3) | Yes (1)  | null          | No (0)      |
| 7  | TypeOfTrack           | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | FastestLap            | decimal (8, 3) | Yes (1)  | null          | No (0)      |
| 9  | FastestLapDriverID    | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | LastWinner            | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | LastPolePosition      | INTEGER        | Yes (1)  | null          | No (0)      |
| 12 | MostWins              | INTEGER        | Yes (1)  | null          | No (0)      |
| 13 | FastestLapYear        | INTEGER        | Yes (1)  | null          | No (0)      |
| 14 | SafetyCarChance       | decimal (8, 2) | Yes (1)  | '0.0'         | No (0)      |
| 15 | PitLaneTimeLoss       | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 16 | GreenFlagTimeLoss     | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 17 | SafetyCarTimeLoss     | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 18 | StartFinishLineOffset | decimal (8, 3) | Yes (1)  | '0.0'         | No (0)      |
| 19 | SprintLaps            | INTEGER        | Yes (1)  | '20'          | No (0)      |
| 20 | IsF2Race              | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 21 | IsF3Race              | INTEGER        | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column       | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|--------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Enum_TrackType](Races_Enum_TrackType.md)       | TypeOfTrack        | Value          | RESTRICT  | RESTRICT  | NONE       |
| 1  | 0   | [Staff_DriverData](../staff/data/Staff_DriverData.md) | FastestLapDriverID | StaffID        | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Countries](../countries/Countries.md)                          | CountryID          | CountryID      | RESTRICT  | RESTRICT  | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                                | Local Column | Foreign Column          | 
|----|-----|----------------------------------------------------------------------------------------------|--------------|-------------------------|
| 0  | 0   | [Board_Confidence_RaceHistory](../board/confidence/Board_Confidence_RaceHistory.md)          | TrackID      | TrackID                 |
| 1  | 0   | [Parts_PowertrainRaceHistoryData](../parts/Parts_PowertrainRaceHistoryData.md)               | TrackID      | TrackID                 |
| 2  | 0   | [Parts_RecommendedTrackStats](../parts/Parts_RecommendedTrackStats.md)                       | TrackID      | TrackID                 |
| 3  | 0   | [Races_Strategies](Races_Strategies.md)                                                      | TrackID      | TrackID                 |
| 4  | 0   | [Races_TeamPerformance](Races_TeamPerformance.md)                                            | TrackID      | TrackID                 |
| 5  | 0   | [Races_FeederSeries_RaceLength](Races_FeederSeries_RaceLength.md)                            | TrackID      | TrackID                 |
| 6  | 0   | [Seasons_PreSeasonTesting](../season/Seasons_PreSeasonTesting.md)                            | TrackID      | TrackID                 |
| 7  | 0   | [Staff_Driver_RaceRecordPerSeason](../staff/Staff_Driver_RaceRecordPerSeason.md)             | TrackID      | LastWinTrackID          |
| 7  | 1   | [Staff_Driver_RaceRecordPerSeason](../staff/Staff_Driver_RaceRecordPerSeason.md)             | TrackID      | LastRaceTrackID         |
| 7  | 2   | [Staff_Driver_RaceRecordPerSeason](../staff/Staff_Driver_RaceRecordPerSeason.md)             | TrackID      | FirstWinTrackID         |
| 7  | 3   | [Staff_Driver_RaceRecordPerSeason](../staff/Staff_Driver_RaceRecordPerSeason.md)             | TrackID      | FirstRaceTrackID        |
| 7  | 4   | [Staff_Driver_RaceRecordPerSeason](../staff/Staff_Driver_RaceRecordPerSeason.md)             | TrackID      | FirstPointsTrackID      |
| 7  | 5   | [Staff_Driver_RaceRecordPerSeason](../staff/Staff_Driver_RaceRecordPerSeason.md)             | TrackID      | FirstPodiumTrackID      |
| 7  | 6   | [Staff_Driver_RaceRecordPerSeason](../staff/Staff_Driver_RaceRecordPerSeason.md)             | TrackID      | BestQualifyingTrackID   |
| 7  | 7   | [Staff_Driver_RaceRecordPerSeason](../staff/Staff_Driver_RaceRecordPerSeason.md)             | TrackID      | BestFinishTrackID       |
| 7  | 8   | [Staff_Driver_RaceRecordPerSeason](../staff/Staff_Driver_RaceRecordPerSeason.md)             | TrackID      | BestSprintFinishTrackID |
| 8  | 0   | [Teams_RaceRecordPerSeason](../team/Teams_RaceRecordPerSeason.md)                            | TrackID      | LastWinTrackID          |
| 8  | 1   | [Teams_RaceRecordPerSeason](../team/Teams_RaceRecordPerSeason.md)                            | TrackID      | LastRaceTrackID         |
| 8  | 2   | [Teams_RaceRecordPerSeason](../team/Teams_RaceRecordPerSeason.md)                            | TrackID      | FirstWinTrackID         |
| 8  | 3   | [Teams_RaceRecordPerSeason](../team/Teams_RaceRecordPerSeason.md)                            | TrackID      | FirstRaceTrackID        |
| 8  | 4   | [Teams_RaceRecordPerSeason](../team/Teams_RaceRecordPerSeason.md)                            | TrackID      | FirstPointsTrackID      |
| 8  | 5   | [Teams_RaceRecordPerSeason](../team/Teams_RaceRecordPerSeason.md)                            | TrackID      | FirstPodiumTrackID      |
| 8  | 6   | [Teams_RaceRecordPerSeason](../team/Teams_RaceRecordPerSeason.md)                            | TrackID      | BestQualifyingTrackID   |
| 8  | 7   | [Teams_RaceRecordPerSeason](../team/Teams_RaceRecordPerSeason.md)                            | TrackID      | BestFinishTrackID       |
| 8  | 8   | [Teams_RaceRecordPerSeason](../team/Teams_RaceRecordPerSeason.md)                            | TrackID      | BestSprintFinishTrackID |
| 9  | 0   | [Teams_RaceRecordSinceGameStart](../team/Teams_RaceRecordSinceGameStart.md)                  | TrackID      | LastWinTrackID          |
| 9  | 1   | [Teams_RaceRecordSinceGameStart](../team/Teams_RaceRecordSinceGameStart.md)                  | TrackID      | LastRaceTrackID         |
| 9  | 2   | [Teams_RaceRecordSinceGameStart](../team/Teams_RaceRecordSinceGameStart.md)                  | TrackID      | FirstWinTrackID         |
| 9  | 3   | [Teams_RaceRecordSinceGameStart](../team/Teams_RaceRecordSinceGameStart.md)                  | TrackID      | FirstRaceTrackID        |
| 9  | 4   | [Teams_RaceRecordSinceGameStart](../team/Teams_RaceRecordSinceGameStart.md)                  | TrackID      | FirstPointsTrackID      |
| 9  | 5   | [Teams_RaceRecordSinceGameStart](../team/Teams_RaceRecordSinceGameStart.md)                  | TrackID      | FirstPodiumTrackID      |
| 9  | 6   | [Teams_RaceRecordSinceGameStart](../team/Teams_RaceRecordSinceGameStart.md)                  | TrackID      | BestQualifyingTrackID   |
| 9  | 7   | [Teams_RaceRecordSinceGameStart](../team/Teams_RaceRecordSinceGameStart.md)                  | TrackID      | BestFinishTrackID       |
| 9  | 8   | [Teams_RaceRecordSinceGameStart](../team/Teams_RaceRecordSinceGameStart.md)                  | TrackID      | BestSprintFinishTrackID |
| 10 | 0   | [Teams_RaceRecordBeforeGameStart](../team/Teams_RaceRecordBeforeGameStart.md)                | TrackID      | LastWinTrackID          |
| 10 | 1   | [Teams_RaceRecordBeforeGameStart](../team/Teams_RaceRecordBeforeGameStart.md)                | TrackID      | LastRaceTrackID         |
| 10 | 2   | [Teams_RaceRecordBeforeGameStart](../team/Teams_RaceRecordBeforeGameStart.md)                | TrackID      | FirstWinTrackID         |
| 10 | 3   | [Teams_RaceRecordBeforeGameStart](../team/Teams_RaceRecordBeforeGameStart.md)                | TrackID      | FirstRaceTrackID        |
| 10 | 4   | [Teams_RaceRecordBeforeGameStart](../team/Teams_RaceRecordBeforeGameStart.md)                | TrackID      | FirstPointsTrackID      |
| 10 | 5   | [Teams_RaceRecordBeforeGameStart](../team/Teams_RaceRecordBeforeGameStart.md)                | TrackID      | FirstPodiumTrackID      |
| 10 | 6   | [Teams_RaceRecordBeforeGameStart](../team/Teams_RaceRecordBeforeGameStart.md)                | TrackID      | BestQualifyingTrackID   |
| 10 | 7   | [Teams_RaceRecordBeforeGameStart](../team/Teams_RaceRecordBeforeGameStart.md)                | TrackID      | BestFinishTrackID       |
| 10 | 8   | [Teams_RaceRecordBeforeGameStart](../team/Teams_RaceRecordBeforeGameStart.md)                | TrackID      | BestSprintFinishTrackID |
| 11 | 0   | [Races_Templates](Races_Templates.md)                                                        | TrackID      | TrackID                 |
| 12 | 0   | [Player_Record](../player/Player_Record.md)                                                  | TrackID      | BestSprintFinishTrackID |
| 12 | 1   | [Player_Record](../player/Player_Record.md)                                                  | TrackID      | BestFinishTrackID       |
| 12 | 2   | [Player_Record](../player/Player_Record.md)                                                  | TrackID      | BestQualifyingTrackID   |
| 12 | 3   | [Player_Record](../player/Player_Record.md)                                                  | TrackID      | FirstPointsTrackID      |
| 12 | 4   | [Player_Record](../player/Player_Record.md)                                                  | TrackID      | FirstPodiumTrackID      |
| 12 | 5   | [Player_Record](../player/Player_Record.md)                                                  | TrackID      | LastWinTrackID          |
| 12 | 6   | [Player_Record](../player/Player_Record.md)                                                  | TrackID      | FirstWinTrackID         |
| 12 | 7   | [Player_Record](../player/Player_Record.md)                                                  | TrackID      | LastRaceTrackID         |
| 12 | 8   | [Player_Record](../player/Player_Record.md)                                                  | TrackID      | FirstRaceTrackID        |
| 13 | 0   | [Staff_Driver_RaceRecordSinceGameStart](../staff/Staff_Driver_RaceRecordSinceGameStart.md)   | TrackID      | LastWinTrackID          |
| 13 | 1   | [Staff_Driver_RaceRecordSinceGameStart](../staff/Staff_Driver_RaceRecordSinceGameStart.md)   | TrackID      | LastRaceTrackID         |
| 13 | 2   | [Staff_Driver_RaceRecordSinceGameStart](../staff/Staff_Driver_RaceRecordSinceGameStart.md)   | TrackID      | FirstWinTrackID         |
| 13 | 3   | [Staff_Driver_RaceRecordSinceGameStart](../staff/Staff_Driver_RaceRecordSinceGameStart.md)   | TrackID      | FirstRaceTrackID        |
| 13 | 4   | [Staff_Driver_RaceRecordSinceGameStart](../staff/Staff_Driver_RaceRecordSinceGameStart.md)   | TrackID      | FirstPointsTrackID      |
| 13 | 5   | [Staff_Driver_RaceRecordSinceGameStart](../staff/Staff_Driver_RaceRecordSinceGameStart.md)   | TrackID      | FirstPodiumTrackID      |
| 13 | 6   | [Staff_Driver_RaceRecordSinceGameStart](../staff/Staff_Driver_RaceRecordSinceGameStart.md)   | TrackID      | BestQualifyingTrackID   |
| 13 | 7   | [Staff_Driver_RaceRecordSinceGameStart](../staff/Staff_Driver_RaceRecordSinceGameStart.md)   | TrackID      | BestFinishTrackID       |
| 13 | 8   | [Staff_Driver_RaceRecordSinceGameStart](../staff/Staff_Driver_RaceRecordSinceGameStart.md)   | TrackID      | BestSprintFinishTrackID |
| 14 | 0   | [Staff_Driver_RaceRecordBeforeGameStart](../staff/Staff_Driver_RaceRecordBeforeGameStart.md) | TrackID      | LastWinTrackID          |
| 14 | 1   | [Staff_Driver_RaceRecordBeforeGameStart](../staff/Staff_Driver_RaceRecordBeforeGameStart.md) | TrackID      | LastRaceTrackID         |
| 14 | 2   | [Staff_Driver_RaceRecordBeforeGameStart](../staff/Staff_Driver_RaceRecordBeforeGameStart.md) | TrackID      | FirstWinTrackID         |
| 14 | 3   | [Staff_Driver_RaceRecordBeforeGameStart](../staff/Staff_Driver_RaceRecordBeforeGameStart.md) | TrackID      | FirstRaceTrackID        |
| 14 | 4   | [Staff_Driver_RaceRecordBeforeGameStart](../staff/Staff_Driver_RaceRecordBeforeGameStart.md) | TrackID      | FirstPointsTrackID      |
| 14 | 5   | [Staff_Driver_RaceRecordBeforeGameStart](../staff/Staff_Driver_RaceRecordBeforeGameStart.md) | TrackID      | FirstPodiumTrackID      |
| 14 | 6   | [Staff_Driver_RaceRecordBeforeGameStart](../staff/Staff_Driver_RaceRecordBeforeGameStart.md) | TrackID      | BestQualifyingTrackID   |
| 14 | 7   | [Staff_Driver_RaceRecordBeforeGameStart](../staff/Staff_Driver_RaceRecordBeforeGameStart.md) | TrackID      | BestFinishTrackID       |
| 14 | 8   | [Staff_Driver_RaceRecordBeforeGameStart](../staff/Staff_Driver_RaceRecordBeforeGameStart.md) | TrackID      | BestSprintFinishTrackID |
