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
| 2  | 0   | [Races_Enum_State](Races_Enum_State.md)             | State        | State          | NO ACTION | NO ACTION | NONE       |
| 3  | 0   | [Races_Enum_WeekendType](Races_Enum_WeekendType.md) | WeekendType  | Type           | NO ACTION | NO ACTION | NONE       |