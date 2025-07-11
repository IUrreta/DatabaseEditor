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
| 2  | 0   | [Countries](../Countries.md)                          | CountryID          | CountryID      | RESTRICT  | RESTRICT  | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                       | Local Column | Foreign Column | 
|----|-----|-------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Board_Confidence_RaceHistory](../board/confidence/Board_Confidence_RaceHistory.md) | TrackID      | TrackID        |
| 1  | 0   | [Parts_PowertrainRaceHistoryData](../parts/Parts_PowertrainRaceHistoryData.md)      | TrackID      | TrackID        |
| 2  | 0   | [Parts_RecommendedTrackStats](../parts/Parts_RecommendedTrackStats.md)              | TrackID      | TrackID        |
| 3  | 0   | [Races_Strategies](Races_Strategies.md)                                             | TrackID      | TrackID        |
| 4  | 0   | [Races_TeamPerformance](Races_TeamPerformance.md)                                   | TrackID      | TrackID        |
