Finance_TeamBudget_SpendingBuckets table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type      | Not Null | Default Value | Primary Key |
|----|-------------------|----------------|----------|---------------|-------------|
| 0  | TeamID            | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | SeasonID          | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | Category          | INTEGER        | Yes (1)  | null          | Order 3 (3) |
| 3  | IsReserved        | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 4  | EstimatedSpending | bigint (20)    | Yes (1)  | '0'           | No (0)      |
| 5  | AllocatedAmount   | bigint (20)    | Yes (1)  | '0'           | No (0)      |
| 6  | RemainingAmount   | bigint         | Yes (1)  | '0'           | No (0)      |
| 7  | Weight            | decimal (3, 2) | No (0)   | '0'           | No (0)      |
| 8  | UsedAmount        | bigint (20)    | No (0)   | '0'           | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                 | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Finance_Enum_BudgetCategory](../Finance_Enum_BudgetCategory.md) | Category     | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Seasons](../../season/Seasons.md)                               | SeasonID     | SeasonID       | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Teams](../../team/Teams.md)                                     | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
