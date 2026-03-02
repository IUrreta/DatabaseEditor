Finance_TeamBalance table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name    | Data Type  | Not Null | Default Value | Primary Key |
|----|---------|------------|----------|---------------|-------------|
| 0  | TeamID  | INTEGER    | Yes (1)  | null          | No (0)      |
| 1  | Balance | bigint(20) | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../../team/Teams.md) | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |