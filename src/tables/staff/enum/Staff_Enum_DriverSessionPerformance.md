Staff_Enum_DriverSessionPerformance table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | Value | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name  | TEXT      | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it.

FKs this table points to

| ID | Seq | Foreign Table                                                   | Local Column | Foreign Column | 
|----|-----|-----------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Races_Results](../../race/results/Races_Results.md)                       | Value        | Performance    |
| 1  | 0   | [Races_SprintResults](../../race/results/Races_SprintResults.md)           | Value        | Performance    |
| 2  | 0   | [Races_FeatureRaceResults](../../race/Races_FeatureRaceResults.md) | Value        | Performance    |
