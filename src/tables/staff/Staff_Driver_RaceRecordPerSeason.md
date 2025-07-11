Staff_Driver_RaceRecordPerSeason table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                       | Data Type | Not Null | Default Value | Primary Key |
|----|----------------------------|-----------|----------|---------------|-------------|
| 0  | StaffID                    | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | SeasonID                   | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | TeamID                     | INTEGER   | Yes (1)  | null          | Order 3 (3) |
| 3  | FirstRace                  | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 4  | FirstRaceTrackID           | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 5  | LastRace                   | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 6  | LastRaceTrackID            | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 7  | FirstWin                   | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 8  | FirstWinTrackID            | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 9  | LastWin                    | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 10 | LastWinTrackID             | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 11 | FirstPodium                | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 12 | FirstPodiumTrackID         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 13 | FirstPoints                | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 14 | FirstPointsTrackID         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 15 | TotalStarts                | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 16 | TotalFinishes              | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 17 | BestQualifying             | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 18 | BestQualifyingYear         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 19 | BestQualifyingTrackID      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 20 | BestFinish                 | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 21 | BestFinishYear             | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 22 | BestFinishTrackID          | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 23 | TotalSprintWins            | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 24 | TotalPoles                 | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 25 | TotalWins                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 26 | TotalPodiums               | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 27 | TotalPointsScoringFinishes | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 28 | TotalPointsScored          | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 29 | TotalFastestLaps           | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 30 | BestChampionPlace          | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 31 | BestChampionshipYear       | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 32 | TotalChampionshipWins      | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 33 | TotalChampionshipPodiums   | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 34 | BestSprintFinish           | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 35 | BestSprintFinishYear       | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 36 | BestSprintFinishTrackID    | INTEGER   | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                  | Local Column            | Foreign Column | On Update | On Delete | Match Type |
|----|-----|------------------------------------------------|-------------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_DriverData](./data/Staff_DriverData.md) | StaffID                 | StaffID        | CASCADE   | CASCADE   | NONE       |
| 1  | 0   | [Seasons](../season/Seasons.md)                | SeasonID                | SeasonID       | CASCADE   | CASCADE   | NONE       |
| 2  | 0   | [Races_Tracks](../race/Races_Tracks.md)        | LastWinTrackID          | TrackID        | NO ACTION | NO ACTION | NONE       |
| 3  | 0   | [Races_Tracks](../race/Races_Tracks.md)        | LastRaceTrackID         | TrackID        | NO ACTION | NO ACTION | NONE       |
| 4  | 0   | [Races_Tracks](../race/Races_Tracks.md)        | FirstWinTrackID         | TrackID        | NO ACTION | NO ACTION | NONE       |
| 5  | 0   | [Races_Tracks](../race/Races_Tracks.md)        | FirstRaceTrackID        | TrackID        | NO ACTION | NO ACTION | NONE       |
| 6  | 0   | [Races_Tracks](../race/Races_Tracks.md)        | FirstPointsTrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 7  | 0   | [Races_Tracks](../race/Races_Tracks.md)        | FirstPodiumTrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 8  | 0   | [Races_Tracks](../race/Races_Tracks.md)        | BestQualifyingTrackID   | TrackID        | NO ACTION | NO ACTION | NONE       |
| 9  | 0   | [Races_Tracks](../race/Races_Tracks.md)        | BestFinishTrackID       | TrackID        | NO ACTION | NO ACTION | NONE       |
| 10 | 0   | [Races_Tracks](../race/Races_Tracks.md)        | BestSprintFinishTrackID | TrackID        | RESTRICT  | CASCADE   | NONE       |