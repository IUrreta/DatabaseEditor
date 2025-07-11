Staff_RaceEngineerDriverAssignments table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                | Data Type      | Not Null | Default Value | Primary Key |
|----|---------------------|----------------|----------|---------------|-------------|
| 0  | RaceEngineerID      | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 1  | DriverID            | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 2  | DaysTogether        | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 3  | RelationshipLevel   | decimal (8, 3) | Yes (1)  | '0.0'         | No (0)      |
| 4  | IsCurrentAssignment | INTEGER        | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                  | Local Column   | Foreign Column | On Update | On Delete | Match Type |
|----|-----|------------------------------------------------|----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_GameData](Staff_GameData.md)     | RaceEngineerID | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_DriverData](Staff_DriverData.md) | DriverID       | StaffID        | CASCADE   | CASCADE   | NONE       |