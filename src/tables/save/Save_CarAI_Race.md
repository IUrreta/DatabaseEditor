Save_CarAI_Race table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                             | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------------------|----------------|----------|---------------|-------------|
| 0  | CarID                            | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | RedFlagActive                    | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | SafetyCarActive                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | VirtualSafetyCarActive           | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | ChargingERS                      | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | BattleState                      | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | ConfidenceState                  | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | LastUpdatedPitstopStrategy       | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | LastUpdatedFuelDelta             | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 9  | LastTriggeredLowFuelEvent        | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 10 | LastUpdatedCommands              | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 11 | LastUpdatedWeatherReport         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 12 | WeatherReportMagnitudeDistortion | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 