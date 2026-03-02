SubTeam_Assignments table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type | Not Null | Default Value | Primary Key |
|----|----------------|-----------|----------|---------------|-------------|
| 0  | AssignmentID   | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID         | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | SubTeamType    | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | ActiveStaff    | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | AssignmentName | TEXT      | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                               | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)                   | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [SubTeam_Enum_Types](SubTeam_Enum_Types.md) | SubTeamType  | Type           | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                | Local Column | Foreign Column | 
|----|-----|----------------------------------------------|--------------|----------------|
| 0  | 0   | [Parts_Projects](../parts/Parts_Projects.md) | AssignmentID | AssignmentID   |
| 1  | 0   | [Scouting](../scouting/Scouting.md)          | AssignmentID | AssignmentID   |
