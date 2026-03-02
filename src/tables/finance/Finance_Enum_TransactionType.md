Finance_Enum_TransactionType table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type | Not Null | Default Value | Primary Key |
|----|-----------------|-----------|----------|---------------|-------------|
| 0  | TransactionType | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name            | TEXT      | No (0)   | 'NULL'        | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                   | Local Column    | Foreign Column  | 
|----|-----|-------------------------------------------------|-----------------|-----------------|
| 0  | 0   | [Finance_Transactions](Finance_Transactions.md) | TransactionType | TransactionType |
