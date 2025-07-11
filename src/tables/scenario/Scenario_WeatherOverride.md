Scenario_WeatherOverride table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------------|----------------|----------|---------------|-------------|
| 0  | Day             | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | AmbientTempHigh | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 2  | AmbientTempLow  | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | AmbientTempSkew | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | TrackTempHigh   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | TrackTempLow    | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | TrackTempSkew   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 