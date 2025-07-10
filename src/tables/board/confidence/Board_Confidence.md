Board_Confidence table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name       | Data Type | Not Null | Default Value | Primary Key |
|----|------------|-----------|----------|---------------|-------------|
| 0  | Season     | INTEGER   | Yes (1)  | '2022'        | Yes (1)     |
| 1  | Confidence | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Seasons](../../season/Seasons.md) | Season       | SeasonID       | CASCADE   | CASCADE   | NONE       |