Player_History table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name     | Data Type | Not Null | Default Value | Primary Key |
|----|----------|-----------|----------|---------------|-------------|
| 0  | TeamID   | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | StartDay | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | EndDay   | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md) | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |