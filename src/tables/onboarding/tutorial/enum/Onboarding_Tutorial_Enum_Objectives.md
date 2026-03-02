Onboarding_Tutorial_Enum_Objectives table

[Column Guide](../../../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type | Not Null | Default Value | Primary Key |
|----|-----------|-----------|----------|---------------|-------------|
| 0  | Objective | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name      | TEXT      | Yes (1)  | null          | No (0)      |
| 2  | State     | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Onboarding_Tutorial_Enum_States](Onboarding_Tutorial_Enum_States.md) | State        | State          | NO ACTION | NO ACTION | NONE       |