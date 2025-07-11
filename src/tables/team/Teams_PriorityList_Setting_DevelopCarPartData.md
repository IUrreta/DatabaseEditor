Teams_PriorityList_Setting_DevelopCarPartData table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name         | Data Type | Not Null | Default Value | Primary Key |
|----|--------------|-----------|----------|---------------|-------------|
| 0  | Value        | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | AverageValue | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | Speed        | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                            | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|----------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_DevSpeeds](../parts/Parts_Enum_DevSpeeds.md) | Speed        | Value          | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                               | Local Column | Foreign Column           | 
|----|-----|---------------------------------------------|--------------|--------------------------|
| 0  | 0   | [Teams_PriorityList](Teams_PriorityList.md) | Value        | DevelopCarPartSettingsID |
