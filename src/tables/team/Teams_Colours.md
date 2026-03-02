Teams_Colours table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name     | Data Type | Not Null | Default Value | Primary Key |
|----|----------|-----------|----------|---------------|-------------|
| 0  | ColourID | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID   | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | Colour   | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table     | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](Teams.md) | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |