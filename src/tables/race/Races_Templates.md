Races_Templates table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------------|----------------|----------|---------------|-------------|
| 0  | TrackID         | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | RainMin         | decimal (4, 3) | Yes (1)  | null          | No (0)      |
| 2  | RainMax         | decimal (4, 3) | Yes (1)  | null          | No (0)      |
| 3  | TemperatureMin  | decimal (3, 1) | Yes (1)  | null          | No (0)      |
| 4  | TemperatureMax  | decimal (3, 1) | Yes (1)  | null          | No (0)      |
| 5  | WeekOfYear      | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | TemperatureSkew | decimal (4, 3) | Yes (1)  | null          | No (0)      |
| 7  | WeekendType     | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | StartingWeekDay |                | Yes (1)  | '4'           | No (0)      |
| 9  | Disabled        | INTEGER        | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                       | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Tracks](Races_Tracks.md)                     | TrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Races_Enum_WeekendType](Races_Enum_WeekendType.md) | WeekendType  | Type           | RESTRICT  | RESTRICT  | NONE       |