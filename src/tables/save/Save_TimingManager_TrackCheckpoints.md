Save_TimingManager_TrackCheckpoints table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name       | Data Type      | Not Null | Default Value | Primary Key |
|----|------------|----------------|----------|---------------|-------------|
| 0  | CarIndex   | INTEGER        | Yes (1)  | null          | No (0)      |
| 1  | Checkpoint | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | RaceTime   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 