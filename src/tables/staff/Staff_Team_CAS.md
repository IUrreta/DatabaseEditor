Staff_Team_CAS table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type | Not Null | Default Value | Primary Key |
|----|-----------|-----------|----------|---------------|-------------|
| 0  | StaffID   | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID    | INTEGER   | No (0)   | null          | No (0)      |
| 2  | PosInTeam | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                       | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)                           | TeamID       | TeamID         | CASCADE   | RESTRICT  | NONE       |
| 1  | 0   | [Staff_GameData](Staff_GameData.md)   | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Staff_BasicData](Staff_BasicData.md) | StaffID      | StaffID        | NO ACTION | NO ACTION | NONE       |