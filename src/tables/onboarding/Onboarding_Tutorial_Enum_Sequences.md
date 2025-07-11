Onboarding_Tutorial_Enum_Sequences table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                  | Data Type | Not Null | Default Value | Primary Key |
|----|-----------------------|-----------|----------|---------------|-------------|
| 0  | SequenceID            | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name                  | TEXT      | Yes (1)  | null          | No (0)      |
| 2  | State                 | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 3  | CurrentStep           | TEXT      | No (0)   | 'NULL'        | No (0)      |
| 4  | PlayerStepReferenceID | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 5  | PlayerStepType        | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 6  | StaffID               | INTEGER   | No (0)   | null          | No (0)      |
| 7  | UnlockDay             | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                         | Local Column   | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------------|----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_BasicData](../staff/data/Staff_BasicData.md)                   | StaffID        | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Onboarding_Tutorial_Enum_States](Onboarding_Tutorial_Enum_States.md) | State          | State          | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Onboarding_Enum_PlayerStepTypes](Onboarding_Enum_PlayerStepTypes.md) | PlayerStepType | PlayerStepType | NO ACTION | NO ACTION | NONE       |