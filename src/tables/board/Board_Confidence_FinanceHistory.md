Board_Confidence_FinanceHistory table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type  | Not Null | Default Value | Primary Key |
|----|-----------|------------|----------|---------------|-------------|
| 0  | Day       | INTEGER    | Yes (1)  | null          | Yes (1)     |
| 1  | Overdraft | bigint(20) | No (0)   | '0'           | No (0)      |
| 2  | Overspend | bigint(20) | No (0)   | '0'           | No (0)      |

Table has no FKs that point to it. 