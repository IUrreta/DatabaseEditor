Player_State table

[Column Guide](columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type | Not Null | Default Value | Primary Key |
|----|---------------|-----------|----------|---------------|-------------|
| 0  | Day           | INTEGER   | Yes (1)  | 0             | Yes (1)     |
| 1  | CurrentSeason | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](foreignKeyDetails.md)

| ID | Seq | Foreign Table         | Local Column  | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------|---------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Seasons](Seasons.md) | CurrentSeason | SeasonID       | NO ACTION | NO ACTION | NONE       |