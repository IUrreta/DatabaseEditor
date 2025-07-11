Scouting_Staff_Bookmark table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name    | Data Type | Not Null | Default Value | Primary Key |
|----|---------|-----------|----------|---------------|-------------|
| 0  | TeamID  | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | StaffID | INTEGER   | Yes (1)  | null          | Order 2 (2) |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                     | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_GameData](../../staff/data/Staff_GameData.md) | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Teams](../../team/Teams.md)                         | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |