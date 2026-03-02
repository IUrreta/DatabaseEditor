Races table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                   | Data Type      | Not Null | Default Value | Primary Key |
|----|------------------------|----------------|----------|---------------|-------------|
| 0  | RaceID                 | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | SeasonID               | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | Day                    | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | TrackID                | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | State                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | RainPractice           | decimal (4, 3) | Yes (1)  | null          | No (0)      |
| 6  | TemperaturePractice    | decimal (3, 1) | Yes (1)  | null          | No (0)      |
| 7  | WeatherStatePractice   | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | RainQualifying         | decimal (4, 3) | Yes (1)  | null          | No (0)      |
| 9  | TemperatureQualifying  | decimal (3, 1) | Yes (1)  | null          | No (0)      |
| 10 | WeatherStateQualifying | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | RainRace               | decimal (4, 3) | Yes (1)  | null          | No (0)      |
| 12 | TemperatureRace        | decimal (3, 1) | Yes (1)  | null          | No (0)      |
| 13 | WeatherStateRace       | INTEGER        | Yes (1)  | null          | No (0)      |
| 14 | WeekendType            | INTEGER        | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

--------------------------------------------------------------------------------------------------------------------------------------
| ID | Seq | Foreign Table                                       | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Tracks](Races_Tracks.md)                     | TrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Seasons](../season/Seasons.md)                     | SeasonID     | SeasonID       | NO ACTION | CASCADE   | NONE       |
| 2  | 0   | [Races_Enum_State](enum/Races_Enum_State.md)             | State        | State          | NO ACTION | NO ACTION | NONE       |
| 3  | 0   | [Races_Enum_WeekendType](enum/Races_Enum_WeekendType.md) | WeekendType  | Type           | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                        | Local Column | Foreign Column | 
|----|-----|----------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Races_PracticeResults](results/Races_PracticeResults.md)                    | RaceID       | RaceID         |
| 1  | 0   | [Races_PitStopResults](pit/Races_PitStopResults.md)                      | RaceID       | RaceID         |
| 2  | 0   | [Races_PitStopTimings](pit/Races_PitStopTimings.md)                      | RaceID       | RaceID         |
| 3  | 0   | [Parts_InspectionResults](../parts/Parts_InspectionResults.md)       | RaceID       | RaceID         |
| 4  | 0   | [Races_Results](results/Races_Results.md)                                    | RaceID       | RaceID         |
| 5  | 0   | [Races_SprintResults](results/Races_SprintResults.md)                        | RaceID       | RaceID         |
| 6  | 0   | [Races_FeatureRaceResults](Races_FeatureRaceResults.md)              | RaceID       | RaceID         |
| 7  | 0   | [Save_Weekend](../save/Save_Weekend.md)                              | RaceID       | RaceID         |
| 8  | 0   | [Sponsorship_RaceBonuses](../sponsorship/Sponsorship_RaceBonuses.md) | RaceID       | RaceID         |
| 9  | 0   | [Races_QualifyingResults](results/Races_QualifyingResults.md)                | RaceID       | RaceID         |
