Scouting_Staff_PerformanceStats table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type | Not Null | Default Value | Primary Key |
|----|----------------|-----------|----------|---------------|-------------|
| 0  | StaffID        | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | StatID         | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | Val            | INTEGER   | Yes (1)  | '50'          | No (0)      |
| 3  | Max            | INTEGER   | Yes (1)  | '80'          | No (0)      |
| 4  | TeamID         | INTEGER   | Yes (1)  | null          | Order 3 (3) |
| 5  | DayScouted     | INTEGER   | Yes (1)  | null          | No (0)      |
| 6  | AccuracyOffset | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                                  | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|--------------------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../../team/Teams.md)                                                      | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Staff_Enum_PerformanceStatTypes](../../staff/Staff_Enum_PerformanceStatTypes.md) | StatID       | Value          | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Staff_GameData](../../staff/data/Staff_GameData.md)                              | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |