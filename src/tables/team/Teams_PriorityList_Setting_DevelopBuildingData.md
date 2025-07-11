Teams_PriorityList_Setting_DevelopBuildingData table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type    | Not Null | Default Value | Primary Key |
|----|--------------------|--------------|----------|---------------|-------------|
| 0  | Value              | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | BuildingType       | INTEGER      | Yes (1)  | null          | No (0)      |
| 2  | Level              | INTEGER      | Yes (1)  | null          | No (0)      |
| 3  | DegrationThreshold | decimal(3,2) | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Building_Enum_Types](../building/Building_Enum_Types.md) | BuildingType | Type           | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                               | Local Column | Foreign Column            | 
|----|-----|---------------------------------------------|--------------|---------------------------|
| 0  | 0   | [Teams_PriorityList](Teams_PriorityList.md) | Value        | DevelopBuildingSettingsID |
