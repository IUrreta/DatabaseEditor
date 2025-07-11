Staff_Driver_RaceRecordSinceGameStart table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                       | Data Type | Not Null | Default Value | Primary Key |
|----|----------------------------|-----------|----------|---------------|-------------|
| 0  | StaffID                    | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Formula                    | INTEGER   | Yes (1)  | '1'           | Order 2 (2) |
| 2  | FirstRace                  | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 3  | FirstRaceTrackID           | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 4  | LastRace                   | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 5  | LastRaceTrackID            | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 6  | FirstWin                   | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 7  | FirstWinTrackID            | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 8  | LastWin                    | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 9  | LastWinTrackID             | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 10 | FirstPodium                | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 11 | FirstPodiumTrackID         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 12 | FirstPoints                | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 13 | FirstPointsTrackID         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 14 | TotalStarts                | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 15 | TotalFinishes              | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 16 | BestQualifying             | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 17 | BestQualifyingYear         | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 18 | BestQualifyingTrackID      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 19 | BestFinish                 | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 20 | BestFinishYear             | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 21 | BestFinishTrackID          | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 22 | TotalSprintWins            | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 23 | TotalPoles                 | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 24 | TotalWins                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 25 | TotalPodiums               | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 26 | TotalPointsScoringFinishes | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 27 | TotalPointsScored          | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 28 | TotalFastestLaps           | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 29 | BestChampionPlace          | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 30 | BestChampionshipYear       | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 31 | TotalChampionshipWins      | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 32 | TotalChampionshipPodiums   | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 33 | BestSprintFinish           | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 34 | BestSprintFinishYear       | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 35 | BestSprintFinishTrackID    | INTEGER   | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column            | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|-------------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_DriverData](Staff_DriverData.md) | StaffID                 | StaffID        | CASCADE   | CASCADE   | NONE       |
| 1  | 0   | [Races_Tracks](../../race/Races_Tracks.md)               | LastWinTrackID          | TrackID        | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Races_Tracks](../../race/Races_Tracks.md)               | LastRaceTrackID         | TrackID        | NO ACTION | NO ACTION | NONE       |
| 3  | 0   | [Races_Tracks](../../race/Races_Tracks.md)               | FirstWinTrackID         | TrackID        | NO ACTION | NO ACTION | NONE       |
| 4  | 0   | [Races_Tracks](../../race/Races_Tracks.md)               | FirstRaceTrackID        | TrackID        | NO ACTION | NO ACTION | NONE       |
| 5  | 0   | [Races_Tracks](../../race/Races_Tracks.md)               | FirstPointsTrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 6  | 0   | [Races_Tracks](../../race/Races_Tracks.md)               | FirstPodiumTrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 7  | 0   | [Races_Tracks](../../race/Races_Tracks.md)               | BestFinishTrackID       | TrackID        | NO ACTION | NO ACTION | NONE       |
| 8  | 0   | [Races_Tracks](../../race/Races_Tracks.md)               | BestQualifyingTrackID   | TrackID        | NO ACTION | NO ACTION | NONE       |
| 9  | 0   | [Races_Tracks](../../race/Races_Tracks.md)               | BestSprintFinishTrackID | TrackID        | RESTRICT  | CASCADE   | NONE       |