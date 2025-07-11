Save_CarConfig_Effects table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type      | Not Null | Default Value | Primary Key |
|----|------------------|----------------|----------|---------------|-------------|
| 0  | LoadoutID        | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID           | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | EffectID         | INTEGER        | Yes (1)  | null          | Order 3 (3) |
| 3  | AmountOfFeedback | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 4  | RemainingTime    | decimal (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 5  | TimeModifier     | decimal (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 6  | FeedbackZoneMin  | decimal (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 7  | FeedbackZoneMax  | decimal (6, 3) | No (0)   | 'NULL'        | No (0)      |
| 8  | PerfectSetup     | decimal (6, 3) | No (0)   | 'NULL'        | No (0)      |

Table has no FKs that point to it. 