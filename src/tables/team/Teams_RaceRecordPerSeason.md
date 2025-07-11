Teams_RaceRecordPerSeason table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                                | Data Type | Not Null | Default Value | Primary Key |
|----|-------------------------------------|-----------|----------|---------------|-------------|
| 0  | TeamID                              | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | SeasonID                            | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | FirstRace                           | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 3  | FirstRaceTrackID                    | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 4  | LastRace                            | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 5  | LastRaceTrackID                     | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 6  | FirstWin                            | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 7  | FirstWinTrackID                     | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 8  | LastWin                             | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 9  | LastWinTrackID                      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 10 | FirstPodium                         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 11 | FirstPodiumTrackID                  | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 12 | FirstPoints                         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 13 | FirstPointsTrackID                  | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 14 | TotalDriverStarts                   | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 15 | TotalDriverFinishes                 | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 16 | TotalDriverQualifying               | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 17 | BestQualifyingYear                  | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 18 | BestQualifying                      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 19 | BestQualifyingTrackID               | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 20 | BestFinish                          | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 21 | BestFinishYear                      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 22 | BestFinishTrackID                   | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 23 | TotalDriverSprintWins               | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 24 | TotalDriverPoles                    | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 25 | TotalDriverWins                     | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 26 | TotalDriverPodiums                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 27 | TotalDriverPointsScoringFinishes    | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 28 | TotalDriverPoints                   | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 29 | TotalDriverFastestLaps              | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 30 | BestDriverFinishes                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 31 | BestDriverChampionshipPlace         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 32 | BestDriverChampionshipYear          | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 33 | TotalDriverChampionshipWins         | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 34 | TotalDriverChampionshipPodiums      | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 35 | BestConstructorChampionshipPlace    | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 36 | BestConstructorChampionshipYear     | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 37 | TotalConstructorChampionshipWins    | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 38 | TotalConstructorChampionshipPodiums | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 39 | TotalUniqueStarts                   | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 40 | TotalUniqueFinishes                 | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 41 | TotalUniquePodiums                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 42 | BestSprintFinish                    | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 43 | BestSprintFinishYear                | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 44 | BestSprintFinishTrackID             | INTEGER   | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                           | Local Column            | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------|-------------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)               | TeamID                  | TeamID         | NO ACTION | CASCADE   | NONE       |
| 1  | 0   | [Seasons](../season/Seasons.md)         | SeasonID                | SeasonID       | CASCADE   | CASCADE   | NONE       |
| 2  | 0   | [Races_Tracks](../race/Races_Tracks.md) | LastWinTrackID          | TrackID        | NO ACTION | NO ACTION | NONE       |
| 3  | 0   | [Races_Tracks](../race/Races_Tracks.md) | LastRaceTrackID         | TrackID        | NO ACTION | NO ACTION | NONE       |
| 4  | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstWinTrackID         | TrackID        | NO ACTION | NO ACTION | NONE       |
| 5  | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstRaceTrackID        | TrackID        | NO ACTION | NO ACTION | NONE       |
| 6  | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstPointsTrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 7  | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstPodiumTrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 8  | 0   | [Races_Tracks](../race/Races_Tracks.md) | BestQualifyingTrackID   | TrackID        | NO ACTION | NO ACTION | NONE       |
| 9  | 0   | [Races_Tracks](../race/Races_Tracks.md) | BestFinishTrackID       | TrackID        | NO ACTION | NO ACTION | NONE       |
| 10 | 0   | [Races_Tracks](../race/Races_Tracks.md) | BestSprintFinishTrackID | TrackID        | RESTRICT  | CASCADE   | NONE       |