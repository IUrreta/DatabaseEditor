Save_Events table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name         | Data Type      | Not Null | Default Value | Primary Key |
|----|--------------|----------------|----------|---------------|-------------|
| 0  | ID           | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Type         | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | CarID        | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | PriorityBand | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | RaceTime     | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | Lap          | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | Payload      | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it.