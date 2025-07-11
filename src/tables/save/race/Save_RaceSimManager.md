Save_RaceSimManager table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------|----------------|----------|---------------|-------------|
| 0  | ID                   | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | SimTime              | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 2  | RaceEventFlags       | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | DRSTimeLastDetected1 | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | DRSTimeLastDetected2 | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | DRSTimeLastDetected3 | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | SafetyCarState       | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 7  | ShownCarLeaving      | BOOLEAN        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 