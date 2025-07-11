Scouting table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                       | Data Type       | Not Null | Default Value | Primary Key |
|----|----------------------------|-----------------|----------|---------------|-------------|
| 0  | TeamID                     | INTEGER         | Yes (1)  | null          | Yes (1)     |
| 1  | StaffID                    | INTEGER         | Yes (1)  | null          | Order 2 (2) |
| 2  | AssignmentID               | INTEGER         | No (0)   | 'NULL'        | No (0)      |
| 3  | ScoutType                  | INTEGER         | No (0)   | 'NULL'        | No (0)      |
| 4  | StartDay                   | INTEGER         | No (0)   | 'NULL'        | No (0)      |
| 5  | WorkLeft                   | decimal (10, 5) | No (0)   | 'NULL'        | No (0)      |
| 6  | Accuracy                   | INTEGER         | No (0)   | 'NULL'        | No (0)      |
| 7  | LastScoutedType            | INTEGER         | No (0)   | 'NULL'        | No (0)      |
| 8  | LastScoutedEndDay          | INTEGER         | No (0)   | 'NULL'        | No (0)      |
| 9  | LastScoutedAccuracy        | INTEGER         | No (0)   | 'NULL'        | No (0)      |
| 10 | LastScoutedDaysUtilExpired | INTEGER         | No (0)   | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                            | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|----------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)                                | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_GameData](../staff/Staff_GameData.md)        | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [SubTeam_Assignments](../subteam/SubTeam_Assignments.md) | AssignmentID | AssignmentID   | CASCADE   | CASCADE   | NONE       |
| 3  | 0   | [Scouting_Enum_ScoutType](Scouting_Enum_ScoutType.md)    | ScoutType    | Value          | NO ACTION | NO ACTION | NONE       |
