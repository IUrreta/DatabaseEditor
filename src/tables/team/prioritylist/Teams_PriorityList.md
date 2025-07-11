Teams_PriorityList table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                      | Data Type | Not Null | Default Value | Primary Key |
|----|---------------------------|-----------|----------|---------------|-------------|
| 0  | Value                     | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | FeatureTypes              | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | NodeExecutionBehaviour    | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | DevelopCarPartSettingsID  | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 4  | DevelopBuildingSettingsID | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 5  | DevelopStaffSettingsID    | INTEGER   | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                                                       | Local Column              | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------------------------------------------|---------------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams_PriorityList_Setting_DevelopBuildingData](Teams_PriorityList_Setting_DevelopBuildingData.md) | DevelopBuildingSettingsID | Value          | CASCADE   | CASCADE   | NONE       |
| 1  | 0   | [Teams_PriorityList_Setting_DevelopStaffData](Teams_PriorityList_Setting_DevelopStaffData.md)       | DevelopStaffSettingsID    | Value          | CASCADE   | CASCADE   | NONE       |
| 2  | 0   | [Teams_PriorityList_Enum_OnExecutionBehaviour](Teams_PriorityList_Enum_OnExecutionBehaviour.md)     | NodeExecutionBehaviour    | Value          | CASCADE   | NO ACTION | NONE       |
| 3  | 0   | [Teams_PriorityList_Enum_FeatureTypes](Teams_PriorityList_Enum_FeatureTypes.md)                     | FeatureTypes              | Value          | CASCADE   | NO ACTION | NONE       |
| 4  | 0   | [Teams_PriorityList_Setting_DevelopCarPartData](Teams_PriorityList_Setting_DevelopCarPartData.md)   | DevelopCarPartSettingsID  | Value          | CASCADE   | CASCADE   | NONE       |