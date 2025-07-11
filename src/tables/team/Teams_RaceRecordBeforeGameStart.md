Teams_RaceRecordBeforeGameStart table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                                | Data Type | Not Null | Default Value | Primary Key |
|----|-------------------------------------|-----------|----------|---------------|-------------|
| 0  | TeamID                              | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | FirstRace                           | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 2  | FirstRaceTrackID                    | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 3  | LastRace                            | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 4  | LastRaceTrackID                     | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 5  | FirstWin                            | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 6  | FirstWinTrackID                     | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 7  | LastWin                             | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 8  | LastWinTrackID                      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 9  | FirstPodium                         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 10 | FirstPodiumTrackID                  | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 11 | FirstPoints                         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 12 | FirstPointsTrackID                  | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 13 | TotalDriverStarts                   | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 14 | TotalDriverFinishes                 | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 15 | TotalDriverQualifying               | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 16 | BestQualifyingYear                  | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 17 | BestQualifying                      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 18 | BestQualifyingTrackID               | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 19 | BestFinish                          | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 20 | BestFinishYear                      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 21 | BestFinishTrackID                   | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 22 | TotalDriverSprintWins               | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 23 | TotalDriverPoles                    | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 24 | TotalDriverWins                     | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 25 | TotalDriverPodiums                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 26 | TotalDriverPointsScoringFinishes    | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 27 | TotalDriverPoints                   | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 28 | TotalDriverFastestLaps              | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 29 | BestDriverFinishes                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 30 | BestDriverChampionshipPlace         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 31 | BestDriverChampionshipYear          | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 32 | TotalDriverChampionshipWins         | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 33 | TotalDriverChampionshipPodiums      | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 34 | BestConstructorChampionshipPlace    | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 35 | BestConstructorChampionshipYear     | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 36 | TotalConstructorChampionshipWins    | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 37 | TotalConstructorChampionshipPodiums | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 38 | TotalUniqueStarts                   | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 39 | TotalUniqueFinishes                 | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 40 | TotalUniquePodiums                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 41 | BestSprintFinish                    | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 42 | BestSprintFinishYear                | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 43 | BestSprintFinishTrackID             | INTEGER   | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                           | Local Column            | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------|-------------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)               | TeamID                  | TeamID         | NO ACTION | CASCADE   | NONE       |
| 1  | 0   | [Races_Tracks](../race/Races_Tracks.md) | LastWinTrackID          | TrackID        | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Races_Tracks](../race/Races_Tracks.md) | LastRaceTrackID         | TrackID        | NO ACTION | NO ACTION | NONE       |
| 3  | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstWinTrackID         | TrackID        | NO ACTION | NO ACTION | NONE       |
| 4  | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstRaceTrackID        | TrackID        | NO ACTION | NO ACTION | NONE       |
| 5  | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstPointsTrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 6  | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstPodiumTrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 7  | 0   | [Races_Tracks](../race/Races_Tracks.md) | BestQualifyingTrackID   | TrackID        | NO ACTION | NO ACTION | NONE       |
| 8  | 0   | [Races_Tracks](../race/Races_Tracks.md) | BestFinishTrackID       | TrackID        | NO ACTION | NO ACTION | NONE       |
| 9  | 0   | [Races_Tracks](../race/Races_Tracks.md) | BestSprintFinishTrackID | TrackID        | RESTRICT  | CASCADE   | NONE       |