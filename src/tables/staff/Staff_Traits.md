Staff_Traits table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name     | Data Type | Not Null | Default Value | Primary Key |
|----|----------|-----------|----------|---------------|-------------|
| 0  | StaffID  | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TraitID  | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | DayAdded | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                  | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|----------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Traits_Definitions](./Staff_Traits_Definitions.md) | TraitID      | TraitID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Staff_GameData](Staff_GameData.md)                      | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |