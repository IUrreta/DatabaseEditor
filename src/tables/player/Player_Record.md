Player_Record table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                                | Data Type   | Not Null | Default Value | Primary Key |
|----|-------------------------------------|-------------|----------|---------------|-------------|
| 0  | StartSeason                         | INTEGER     | Yes (1)  | null          | Yes (1)     |
| 1  | FirstRace                           | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 2  | FirstRaceTrackID                    | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 3  | FirstRaceTeamID                     | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 4  | LastRace                            | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 5  | LastRaceTrackID                     | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 6  | LastRaceTeamID                      | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 7  | FirstWin                            | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 8  | FirstWinTrackID                     | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 9  | FirstWinTeamID                      | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 10 | LastWin                             | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 11 | LastWinTrackID                      | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 12 | LastWinTeamID                       | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 13 | FirstPodium                         | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 14 | FirstPodiumTrackID                  | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 15 | FirstPodiumTeamID                   | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 16 | FirstPoints                         | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 17 | FirstPointsTrackID                  | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 18 | FirstPointsTeamID                   | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 19 | TotalDriverStarts                   | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 20 | TotalDriverFinishes                 | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 21 | BestQualifying                      | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 22 | BestQualifyingYear                  | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 23 | BestQualifyingTrackID               | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 24 | BestQualifyingTeamID                | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 25 | BestFinish                          | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 26 | BestFinishYear                      | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 27 | BestFinishTrackID                   | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 28 | BestFinishTeamID                    | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 29 | TotalDriverSprintWins               | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 30 | TotalDriverPoles                    | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 31 | TotalDriverWins                     | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 32 | TotalDriverPodiums                  | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 33 | TotalDriverPointsScoringFinishes    | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 34 | TotalDriverPoints                   | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 35 | TotalDriverFastestLaps              | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 36 | BestDriverChampionshipPlace         | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 37 | BestDriverChampionshipYear          | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 38 | BestDriverChampionshipTeamID        | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 39 | TotalDriverChampionshipWins         | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 40 | TotalDriverChampionshipPodiums      | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 41 | BestConstructorChampionshipPlace    | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 42 | BestConstructorChampionshipYear     | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 43 | BestConstructorChampionshipTeamID   | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 44 | TotalConstructorChampionshipWins    | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 45 | TotalConstructorChampionshipPodiums | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 46 | TotalUniqueStarts                   | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 47 | TotalUniqueFinishes                 | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 48 | TotalUniquePodiums                  | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 49 | BestSprintFinish                    | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 50 | BestSprintFinishYear                | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 51 | BestSprintFinishTrackID             | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 52 | BestSprintFinishTeamID              | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 53 | HighestTeamRating                   | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 54 | HighestTeamRatingYear               | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 55 | HighestTeamRatingTeamID             | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 56 | HighestAnnualIncome                 | BIGINT (20) | No (0)   | 'NULL'        | No (0)      |
| 57 | HighestAnnualIncomeYear             | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 58 | HighestAnnualIncomeTeamID           | INTEGER     | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                           | Local Column                      | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------|-----------------------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)               | HighestAnnualIncomeTeamID         | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Teams](../team/Teams.md)               | HighestTeamRatingTeamID           | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Teams](../team/Teams.md)               | BestSprintFinishTeamID            | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 3  | 0   | [Races_Tracks](../race/Races_Tracks.md) | BestSprintFinishTrackID           | TrackID        | RESTRICT  | CASCADE   | NONE       |
| 4  | 0   | [Teams](../team/Teams.md)               | BestConstructorChampionshipTeamID | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 5  | 0   | [Teams](../team/Teams.md)               | BestDriverChampionshipTeamID      | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 6  | 0   | [Teams](../team/Teams.md)               | BestFinishTeamID                  | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 7  | 0   | [Races_Tracks](../race/Races_Tracks.md) | BestFinishTrackID                 | TrackID        | RESTRICT  | CASCADE   | NONE       |
| 8  | 0   | [Teams](../team/Teams.md)               | BestQualifyingTeamID              | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 9  | 0   | [Races_Tracks](../race/Races_Tracks.md) | BestQualifyingTrackID             | TrackID        | RESTRICT  | CASCADE   | NONE       |
| 10 | 0   | [Teams](../team/Teams.md)               | FirstPointsTeamID                 | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 11 | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstPointsTrackID                | TrackID        | RESTRICT  | CASCADE   | NONE       |
| 12 | 0   | [Teams](../team/Teams.md)               | FirstPodiumTeamID                 | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 13 | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstPodiumTrackID                | TrackID        | RESTRICT  | CASCADE   | NONE       |
| 14 | 0   | [Teams](../team/Teams.md)               | LastWinTeamID                     | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 15 | 0   | [Races_Tracks](../race/Races_Tracks.md) | LastWinTrackID                    | TrackID        | RESTRICT  | CASCADE   | NONE       |
| 16 | 0   | [Teams](../team/Teams.md)               | FirstWinTeamID                    | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 17 | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstWinTrackID                   | TrackID        | RESTRICT  | CASCADE   | NONE       |
| 18 | 0   | [Teams](../team/Teams.md)               | LastRaceTeamID                    | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 19 | 0   | [Races_Tracks](../race/Races_Tracks.md) | LastRaceTrackID                   | TrackID        | RESTRICT  | CASCADE   | NONE       |
| 20 | 0   | [Teams](../team/Teams.md)               | FirstRaceTeamID                   | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 21 | 0   | [Races_Tracks](../race/Races_Tracks.md) | FirstRaceTrackID                  | TrackID        | RESTRICT  | CASCADE   | NONE       |