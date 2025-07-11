Staff_Enum_PitStopStage table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | Value | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name  | TEXT      | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                           | Local Column | Foreign Column | 
|----|-----|---------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Races_PitStopTimings](../race/Races_PitStopTimings.md) | Value        | PitStopStage   |
