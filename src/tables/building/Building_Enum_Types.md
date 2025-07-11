Building_Enum_Types table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type | Not Null | Default Value | Primary Key |
|----|---------------|-----------|----------|---------------|-------------|
| 0  | Type          | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name          | TEXT      | Yes (1)  | null          | No (0)      |
| 2  | BuildingGroup | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                   | Local Column  | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------|---------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Building_Enum_Groups](Building_Enum_Groups.md) | BuildingGroup | Value          | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                                               | Local Column | Foreign Column | 
|----|-----|-------------------------------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Buildings](Buildings.md)                                                                                   | Type         | Type           |
| 0  | 1   | [Buildings](Buildings.md)                                                                                   | Type         | RequiredType   |
| 1  | 0   | [Buildings_Effects_Parts](./effects/Buildings_Effects_Parts.md)                                             | Type         | BuildingType   |
| 2  | 0   | [Teams_PriorityList_Setting_DevelopBuildingData](../team/Teams_PriorityList_Setting_DevelopBuildingData.md) | Type         | BuildingType   |
| 3  | 0   | [Buildings_HQ](Buildings_HQ.md)                                                                             | Type         | BuildingType   |
| 4  | 0   | [Buildings_HQ_History](Buildings_HQ_History.md)                                                             | Type         | Type           |
| 5  | 0   | [Parts_Designs_BuildingEffects](../parts/Parts_Designs_BuildingEffects.md)                                  | Type         | BuildingType   |
