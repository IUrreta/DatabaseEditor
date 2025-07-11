Save_TimingManager_Sectors table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                | Data Type      | Not Null | Default Value | Primary Key |
|----|---------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex            | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Lap                 | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | Sector              | INTEGER        | Yes (1)  | null          | Order 3 (3) |
| 3  | RaceTime            | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | DeltaFromPreviousMS | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | State               | INTEGER        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 