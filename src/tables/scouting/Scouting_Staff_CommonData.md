Scouting_Staff_CommonData table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type   | Not Null | Default Value | Primary Key |
|----|-----------------|-------------|----------|---------------|-------------|
| 0  | StaffID         | INTEGER     | Yes (1)  | '0'           | Yes (1)     |
| 1  | AnnualSalary    | bigint (20) | Yes (1)  | '0'           | No (0)      |
| 2  | TeamID          | INTEGER     | Yes (1)  | null          | Order 2 (2) |
| 3  | DayScouted      | INTEGER     | Yes (1)  | null          | No (0)      |
| 4  | Mentality       | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 5  | TeamSuitability | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 6  | TeamOpinion     | INTEGER     | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                     | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_GameData](../staff/data/Staff_GameData.md) | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |