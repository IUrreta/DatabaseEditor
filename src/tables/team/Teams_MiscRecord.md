Teams_MiscRecord table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                    | Data Type   | Not Null | Default Value | Primary Key |
|----|-------------------------|-------------|----------|---------------|-------------|
| 0  | TeamID                  | INTEGER     | Yes (1)  | null          | Yes (1)     |
| 1  | HighestAnnualIncome     | bigint (20) | Yes (1)  | null          | No (0)      |
| 2  | HighestAnnualIncomeYear | INTEGER     | No (0)   | 'NULL'        | No (0)      |
| 3  | HighestTeamRating       | INTEGER     | Yes (1)  | null          | No (0)      |
| 4  | HighestTeamRatingYear   | INTEGER     | No (0)   | 'NULL'        | No (0)      |

Table has no FKs that point to it. 