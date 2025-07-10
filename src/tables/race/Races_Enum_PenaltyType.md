Races_Enum_PenaltyType table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type | Not Null | Default Value | Primary Key |
|----|----------------------|-----------|----------|---------------|-------------|
| 0  | Type                 | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name                 | TEXT      | Yes (1)  | null          | No (0)      |
| 2  | GridPenalty          | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | FirstOffenceModifier | INTEGER   | Yes (1)  | '1'           | No (0)      |

Table has no FKs that point to it. 