Staff_PitCrew_PerformanceStats table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type      | Not Null | Default Value | Primary Key |
|----|---------------|----------------|----------|---------------|-------------|
| 0  | TeamID        | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | StatID        | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | Val           | decimal (4, 1) | Yes (1)  | null          | No (0)      |
| 3  | MonthStartVal | DECIMAL (4, 1) | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)                                             | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_PerformanceStatTypes](Staff_Enum_PerformanceStatTypes.md) | StatID       | Value          | RESTRICT  | CASCADE   | NONE       |