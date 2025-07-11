Staff_Traits_Seeding table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                     | Data Type    | Not Null | Default Value | Primary Key |
|----|--------------------------|--------------|----------|---------------|-------------|
| 0  | TraitID                  | INTEGER      | Yes (1)  | null          | Order 2 (2) |
| 1  | StaffType                | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 2  | StartingTraitProbability | decimal(3,2) | Yes (1)  | '1.00'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Traits_Definitions](./trait/Staff_Traits_Definitions.md) | TraitID      | TraitID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Staff_Enum_StaffType](Staff_Enum_StaffType.md)                 | StaffType    | StaffType      | CASCADE   | CASCADE   | NONE       |