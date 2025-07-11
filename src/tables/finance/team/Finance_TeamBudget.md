Finance_TeamBudget table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type   | Not Null | Default Value | Primary Key |
|----|-------------------|-------------|----------|---------------|-------------|
| 0  | TeamID            | INTEGER     | Yes (1)  | null          | Yes (1)     |
| 1  | SeasonID          | INTEGER     | Yes (1)  | null          | Order 2 (2) |
| 2  | InitialBalance    | bigint (20) | Yes (1)  | '0'           | No (0)      |
| 3  | FinalBalance      | bigint (20) | Yes (1)  | '0'           | No (0)      |
| 4  | ProjectedIncome   | bigint (20) | Yes (1)  | '0'           | No (0)      |
| 5  | ProjectedSpending | bigint (20) | Yes (1)  | '0'           | No (0)      |
| 6  | TotalIncome       | bigint (20) | Yes (1)  | '0'           | No (0)      |
| 7  | TotalSpending     | bigint (20) | Yes (1)  | '0'           | No (0)      |
| 8  | StrategyPresetID  | TEXT        | No (0)   | null          | No (0)      |
| 9  | LastRebalanceDay  | INTEGER     | No (0)   | '- 1'         | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Seasons](../../season/Seasons.md) | SeasonID     | SeasonID       | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Teams](../../team/Teams.md)       | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
