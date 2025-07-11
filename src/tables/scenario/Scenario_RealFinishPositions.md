Scenario_RealFinishPositions table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type | Not Null | Default Value | Primary Key |
|----|----------------|-----------|----------|---------------|-------------|
| 0  | CarID          | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | FinishPosition | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | Points         | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | Pitstops       | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | IsDNF          | INTEGER   | Yes (1)  | null          | No (0)      |
| 5  | HasFastestLap  | INTEGER   | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 