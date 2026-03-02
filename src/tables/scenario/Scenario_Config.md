Scenario_Config table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type | Not Null | Default Value | Primary Key |
|----|------------------|-----------|----------|---------------|-------------|
| 0  | ScenarioID       | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | ScenarioType     | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | ScenarioDLCID    | TEXT (64) | Yes (1)  | ''''          | No (0)      |
| 3  | ScenarioCategory | TEXT (64) | Yes (1)  | ''''          | No (0)      |
| 4  | DifficultyRating | INTEGER   | Yes (1)  | '2'           | No (0)      |

Table has no FKs that point to it. 