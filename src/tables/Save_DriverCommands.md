Save_DriverCommands table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type | Not Null | Default Value | Primary Key |
|----|----------------------|-----------|----------|---------------|-------------|
| 0  | LoadoutID            | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | LiftAndCoastStrategy | INTEGER   | Yes (1)  | '-1'          | No (0)      |
| 2  | RacePaceStrategy     | INTEGER   | Yes (1)  | '-1'          | No (0)      |
| 3  | ERSStrategy          | INTEGER   | Yes (1)  | '-1'          | No (0)      |
| 4  | FastLapCount         | INTEGER   | Yes (1)  | '-1'          | No (0)      |
| 5  | IncludeCooldownLaps  | INTEGER   | Yes (1)  | '-1'          | No (0)      |
| 6  | AdditionalLapOfFuel  | INTEGER   | Yes (1)  | '-1'          | No (0)      |

Table has no FKs that point to it. 