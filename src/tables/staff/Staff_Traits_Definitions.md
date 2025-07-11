Staff_Traits_Definitions table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type    | Not Null | Default Value          | Primary Key |
|----|-----------------|--------------|----------|------------------------|-------------|
| 0  | TraitID         | INTEGER      | Yes (1)  | null                   | Yes (1)     |
| 1  | LocKey          | TEXT         | Yes (1)  | ''[StaffTrait_Name_]'' | No (0)      |
| 2  | Icon            | TEXT         | Yes (1)  | ''placeholder''        | No (0)      |
| 3  | Cause           | INTEGER      | No (0)   | 'NULL'                 | No (0)      |
| 4  | CauseSpawnType  | INTEGER      | No (0)   | 'NULL'                 | No (0)      |
| 5  | CauseSpawnParam | decimal(8,3) | No (0)   | 'NULL'                 | No (0)      |
| 6  | Solution        | INTEGER      | No (0)   | 'NULL'                 | No (0)      |
| 7  | Condition       | INTEGER      | No (0)   | 'NULL'                 | No (0)      |
| 8  | ConditionParam  | TEXT         | No (0)   | 'NULL'                 | No (0)      |
| 9  | DurationInDays  | INTEGER      | No (0)   | 'NULL'                 | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                                 | Local Column   | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------------------------|----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_TraitSolutions](./trait/Staff_Enum_TraitSolutions.md)             | Solution       | Value          | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Staff_Enum_TraitConditions](./trait/Staff_Enum_TraitConditions.md)           | Condition      | Value          | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Staff_Enum_TraitCauseSpawnTypes](./trait/Staff_Enum_TraitCauseSpawnTypes.md) | CauseSpawnType | Value          | NO ACTION | NO ACTION | NONE       |
| 3  | 0   | [Staff_Enum_TraitCauses](./trait/Staff_Enum_TraitCauses.md)                   | Cause          | Value          | NO ACTION | NO ACTION | NONE       |