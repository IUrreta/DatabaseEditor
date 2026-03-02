Difficulty_Enum_Option table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | Value | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name  | TEXT      | No (0)   | null          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                             | Local Column | Foreign Column        | 
|----|-----|-----------------------------------------------------------|--------------|-----------------------|
| 0  | 0   | [Difficulty_RaceSim](Difficulty_RaceSim.md)               | Value        | AIPerformance         |
| 1  | 0   | [Difficulty_TeamManagement](Difficulty_TeamManagement.md) | Value        | AIDesignExpertiseGain |
