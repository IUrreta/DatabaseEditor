Teams table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                          | Data Type | Not Null | Default Value | Primary Key |
|----|-------------------------------|-----------|----------|---------------|-------------|
| 0  | Formula                       | INTEGER   | Yes (1)  | '1'           | No (0)      |
| 1  | PredictedRanking              | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | TeamID                        | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 3  | TeamName                      | TEXT      | Yes (1)  | null          | No (0)      |
| 4  | TeamNameLocKey                | TEXT      | Yes (1)  | null          | No (0)      |
| 5  | Location                      | TEXT      | Yes (1)  | null          | No (0)      |
| 6  | ProfileText                   | TEXT      | Yes (1)  | null          | No (0)      |
| 7  | SeasonsEnteredBeforeGameStart | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 8  | FirstYearWithCurrentBranding  | INTEGER   | Yes (1)  | null          | No (0)      |
| 9  | IsCustomTeam                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 10 | CountryID                     | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Countries](../Countries.md) | CountryID    | CountryID      | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                           | Local Column | Foreign Column |
|----|-----|-------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Staff_Contracts](../staff/data/Staff_Contracts.md)                     | TeamID       | TeamID         |
| 1  | 0   | [Board_Objectives](../board/objectives/Board_Objectives.md)             | TeamID       | TeamID         |
| 2  | 0   | [Board_SeasonObjectives](../board/objectives/Board_SeasonObjectives.md) | TeamID       | TeamID         |
