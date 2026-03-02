SubTeam_Enum_Types table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type      | Not Null | Default Value | Primary Key |
|----|------------------|----------------|----------|---------------|-------------|
| 0  | Type             | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Name             | TEXT           | Yes (1)  | null          | No (0)      |
| 2  | HireCost         | bigint (20)    | Yes (1)  | null          | No (0)      |
| 3  | MonthlyRunCost   | bigint (20)    | Yes (1)  | null          | No (0)      |
| 4  | ModifierIncrease | decimal (5, 2) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                 | Local Column | Foreign Column | 
|----|-----|-----------------------------------------------|--------------|----------------|
| 0  | 0   | [SubTeam_Assignments](SubTeam_Assignments.md) | Type         | SubTeamType    |
| 1  | 0   | [SubTeam_Ownership](SubTeam_Ownership.md)     | Type         | SubTeamType    |
