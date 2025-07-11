Staff_PitCrew_DevelopmentPlanGlobalData table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type | Not Null | Default Value | Primary Key |
|----|--------------------|-----------|----------|---------------|-------------|
| 0  | TeamID             | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TrainingInProgress | BOOLEAN   | Yes (1)  | 'false'       | No (0)      |
| 2  | TrainingCost       | BIGINT    | Yes (1)  | '0'           | No (0)      |
| 3  | TrainingPreset     | INTEGER   | Yes (1)  | '1'           | No (0)      |
| 4  | TrainingFocus      | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 5  | IsDirty            | BOOLEAN   | Yes (1)  | 'false'       | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                                     | Local Column   | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------------------------|----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_PitCrewTrainingGlobalFocus](../enum/pitcrew/Staff_Enum_PitCrewTrainingGlobalFocus.md) | TrainingFocus  | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_PitCrewTrainingPreset](../enum/pitcrew/Staff_Enum_PitCrewTrainingPreset.md)           | TrainingPreset | Value          | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Teams](../../team/Teams.md)                                                         | TeamID         | TeamID         | RESTRICT  | CASCADE   | NONE       |