Save_WeatherHistory table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type      | Not Null | Default Value | Primary Key |
|----|--------------------|----------------|----------|---------------|-------------|
| 0  | Time               | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Rain               | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 2  | WaterOnTrack       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | AmbientTemperature | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | TrackTemperature   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | WeatherState       | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | TimeUntilTrackDry  | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 7  | RubberOnTrack      | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 