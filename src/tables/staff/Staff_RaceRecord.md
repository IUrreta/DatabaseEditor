Staff_RaceRecord table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                          | Data Type | Not Null | Default Value | Primary Key |
|----|-------------------------------|-----------|----------|---------------|-------------|
| 0  | StaffID                       | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Formula                       | INTEGER   | Yes (1)  | '1'           | Order 2 (2) |
| 2  | TotalStarts                   | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | TotalPodiums                  | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | TotalWins                     | INTEGER   | Yes (1)  | null          | No (0)      |
| 5  | TotalConstructorChampionships | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                     | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_GameData](../staff/data/Staff_GameData.md) | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |