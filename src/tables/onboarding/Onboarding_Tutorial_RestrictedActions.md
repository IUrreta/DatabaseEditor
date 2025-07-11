Onboarding_Tutorial_RestrictedActions table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                    | Data Type | Not Null | Default Value | Primary Key |
|----|-------------------------|-----------|----------|---------------|-------------|
| 0  | TutorialIsActiveSetting | INTEGER   | No (0)   | null          | Yes (1)     |
| 1  | BlockDaysAdvancement    | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                                             | Local Column            | Foreign Column  | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------------------------------------|-------------------------|-----------------|-----------|-----------|------------|
| 0  | 0   | [Onboarding_Tutorial_Enum_IsActiveSettings](Onboarding_Tutorial_Enum_IsActiveSettings.md) | TutorialIsActiveSetting | IsActiveSetting | NO ACTION | NO ACTION | NONE       |