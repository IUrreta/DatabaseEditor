Difficulty_RaceSim table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type | Not Null | Default Value | Primary Key |
|----|---------------|-----------|----------|---------------|-------------|
| 0  | AIPerformance | INTEGER   | Yes (1)  | '2'           | Yes (1)     |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                       | Local Column  | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------|---------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Difficulty_Enum_Option](Difficulty_Enum_Option.md) | AIPerformance | Value          | NO ACTION | NO ACTION | NONE       |