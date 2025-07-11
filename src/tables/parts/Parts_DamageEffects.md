Parts_DamageEffects table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type | Not Null | Default Value | Primary Key |
|----|----------------|-----------|----------|---------------|-------------|
| 0  | PartType       | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | DamageState    | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | EffectString   | TEXT      | Yes (1)  | null          | Order 3 (3) |
| 3  | EffectStrength | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_Type](enum/Parts_Enum_Type.md)                 | PartType     | Value          | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Parts_Enum_DamageStates](enum/Parts_Enum_DamageStates.md) | DamageState  | Value          | NO ACTION | NO ACTION | NONE       |