Staff_Traits_Effects table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                  | Data Type    | Not Null | Default Value | Primary Key |
|----|-----------------------|--------------|----------|---------------|-------------|
| 0  | TraitID               | INTEGER      | Yes (1)  | null          | No (0)      |
| 1  | Effect                | decimal(6,3) | Yes (1)  | null          | No (0)      |
| 2  | IsPercentage          | INTEGER      | Yes (1)  | '0'           | No (0)      |
| 3  | Target                | INTEGER      | Yes (1)  | null          | No (0)      |
| 4  | TargetPerformanceStat | INTEGER      | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                         | Local Column          | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------------|-----------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Traits_Definitions](./trait/Staff_Traits_Definitions.md)       | TraitID               | TraitID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Staff_Enum_PerformanceStatTypes](Staff_Enum_PerformanceStatTypes.md) | TargetPerformanceStat | Value          | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Staff_Enum_TraitTargets](./trait/Staff_Enum_TraitTargets.md)         | Target                | Value          | NO ACTION | NO ACTION | NONE       |