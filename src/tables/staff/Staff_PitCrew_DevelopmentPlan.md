Staff_PitCrew_DevelopmentPlan table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type | Not Null | Default Value | Primary Key |
|----|-----------------|-----------|----------|---------------|-------------|
| 0  | TeamID          | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Day             | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | TrainingSession | INTEGER   | Yes (1)  | null          | Order 3 (3) |
| 3  | TrainingType    | INTEGER   | No (0)   | null          | No (0)      |
| 4  | TrainingFocus   | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                         | Local Column    | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------------|-----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_PitCrewTrainingFocus](Staff_Enum_PitCrewTrainingFocus.md) | TrainingFocus   | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_TrainingSession](Staff_Enum_TrainingSession.md)           | TrainingSession | Value          | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Staff_Enum_PitCrewTrainingType](Staff_Enum_PitCrewTrainingType.md)   | TrainingType    | Value          | RESTRICT  | CASCADE   | NONE       |
| 3  | 0   | [Teams](../team/Teams.md)                                             | TeamID          | TeamID         | RESTRICT  | CASCADE   | NONE       |