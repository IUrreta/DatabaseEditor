Scouting_Staff_RaceEngineerDriverAssignments table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type      | Not Null | Default Value | Primary Key |
|----|-------------------|----------------|----------|---------------|-------------|
| 0  | RaceEngineerID    | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | DriverID          | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | RelationshipLevel | decimal (8, 3) | Yes (1)  | null          | No (0)      |
| 3  | TeamID            | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | DayScouted        | INTEGER        | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                     | Local Column   | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------|----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../../team/Teams.md)                         | TeamID         | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Staff_GameData](../../staff/data/Staff_GameData.md) | RaceEngineerID | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Staff_GameData](../../staff/data/Staff_GameData.md) | DriverID       | StaffID        | RESTRICT  | CASCADE   | NONE       |