Parts_Enum_DevSpeeds table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type    | Not Null | Default Value | Primary Key |
|----|-----------------|--------------|----------|---------------|-------------|
| 0  | Value           | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | Name            | TEXT         | Yes (1)  | null          | No (0)      |
| 2  | SpeedMultiplier | decimal(4,2) | Yes (1)  | null          | No (0)      |
| 3  | CostMultiplier  | decimal(4,2) | Yes (1)  | null          | No (0)      |
| 4  | ExpertisePerDay | decimal(4,2) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 