Staff_Traits_Incompatibility table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name     | Data Type | Not Null | Default Value | Primary Key |
|----|----------|-----------|----------|---------------|-------------|
| 0  | TraitID1 | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TraitID2 | INTEGER   | Yes (1)  | null          | Order 2 (2) |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Traits_Definitions](./trait/Staff_Traits_Definitions.md) | TraitID2     | TraitID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Staff_Traits_Definitions](./trait/Staff_Traits_Definitions.md) | TraitID1     | TraitID        | NO ACTION | NO ACTION | NONE       |