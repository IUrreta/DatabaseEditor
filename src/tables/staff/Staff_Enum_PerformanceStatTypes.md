Staff_Enum_PerformanceStatTypes table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | Value | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name  | TEXT      | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                                                           | Local Column | Foreign Column        | 
|----|-----|-----------------------------------------------------------------------------------------|--------------|-----------------------|
| 0  | 0   | [Staff_StaffTypePerformanceStatsTemplate](Staff_StaffTypePerformanceStatsTemplate.md)   | Value        | PerformanceStatType   |
| 1  | 0   | [Staff_Traits_Effects](Staff_Traits_Effects.md)                                         | Value        | TargetPerformanceStat |
| 2  | 0   | [Staff_PerformanceStats](Staff_PerformanceStats.md)                                     | Value        | StatID                |
| 3  | 0   | [Scouting_Staff_PerformanceStats](../scouting/staff/Scouting_Staff_PerformanceStats.md)       | Value        | StatID                |
| 4  | 0   | [Staff_DriverPerformanceEvaluations_Stats](Staff_DriverPerformanceEvaluations_Stats.md) | Value        | Stat                  |
| 5  | 0   | [Staff_PerformanceStats_StartOfMonth](Staff_PerformanceStats_StartOfMonth.md)           | Value        | StatID                |
| 6  | 0   | [Staff_PitCrew_PerformanceStats](Staff_PitCrew_PerformanceStats.md)                     | Value        | StatID                |
