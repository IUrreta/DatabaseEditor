Finance_Transactions table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type  | Not Null | Default Value | Primary Key |
|----|-----------------|------------|----------|---------------|-------------|
| 0  | TeamID          | INTEGER    | Yes (1)  | null          | No (0)      |
| 1  | Day             | INTEGER    | Yes (1)  | '0'           | No (0)      |
| 2  | Value           | bigint(20) | Yes (1)  | '0'           | No (0)      |
| 3  | TransactionType | INTEGER    | Yes (1)  | null          | No (0)      |
| 4  | Reference       | INTEGER    | No (0)   | 'NULL'        | No (0)      |
| 5  | AffectsCostCap  | INTEGER    | No (0)   | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                   | Local Column    | Foreign Column  | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------|-----------------|-----------------|-----------|-----------|------------|
| 0  | 0   | [Finance_Enum_TransactionType](Finance_Enum_TransactionType.md) | TransactionType | TransactionType | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Teams](../team/Teams.md)                                       | TeamID          | TeamID          | NO ACTION | NO ACTION | NONE       |