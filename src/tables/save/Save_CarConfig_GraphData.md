
Save_CarConfig_GraphData table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------|----------------|----------|---------------|-------------|
| 0  | ID                   | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | LoadoutID            | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | EngineWear           | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | GearboxWear          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | ErsWear              | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | FuelLevel            | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | TrackAcclimatisation | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 7  | PartsKnowledge       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 