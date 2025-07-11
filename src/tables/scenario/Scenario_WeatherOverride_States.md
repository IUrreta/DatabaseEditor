Scenario_WeatherOverride_States table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name       | Data Type      | Not Null | Default Value | Primary Key |
|----|------------|----------------|----------|---------------|-------------|
| 0  | StateIndex | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | StateType  | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | Rain       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 