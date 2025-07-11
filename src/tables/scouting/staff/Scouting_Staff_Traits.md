Scouting_Staff_Traits table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name       | Data Type | Not Null | Default Value | Primary Key |
|----|------------|-----------|----------|---------------|-------------|
| 0  | StaffID    | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TraitID    | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | TeamID     | INTEGER   | Yes (1)  | null          | Order 3 (3) |
| 3  | DayScouted | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                    | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Traits_Definitions](../../staff/Staff_Traits_Definitions.md) | TraitID      | TraitID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Teams](../../team/Teams.md)                                        | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Staff_GameData](../../staff/data/Staff_GameData.md)                | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |