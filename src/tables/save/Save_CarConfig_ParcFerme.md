Save_CarConfig_ParcFerme table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type     | Not Null | Default Value | Primary Key |
|----|--------------------|---------------|----------|---------------|-------------|
| 0  | LoadoutID          | INTEGER       | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID             | INTEGER       | Yes (1)  | null          | Order 2 (2) |
| 2  | SetupToe           | DECIMAL(6, 3) | Yes (1)  | null          | No (0)      |
| 3  | SetupCamber        | DECIMAL(6, 3) | Yes (1)  | null          | No (0)      |
| 4  | SetupAntiRollBars  | DECIMAL(6, 3) | Yes (1)  | null          | No (0)      |
| 5  | SetupRearWingAngle | DECIMAL(6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 