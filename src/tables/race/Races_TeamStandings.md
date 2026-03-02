Races_TeamStandings table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type | Not Null | Default Value | Primary Key |
|----|--------------------|-----------|----------|---------------|-------------|
| 0  | SeasonID           | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 1  | TeamID             | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 2  | Points             | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | Position           | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | LastPointsChange   | INTEGER   | No (0)   | '0'           | No (0)      |
| 5  | LastPositionChange | INTEGER   | No (0)   | '0'           | No (0)      |
| 6  | RaceFormula        | INTEGER   | No (0)   | '1'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)       | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Seasons](../season/Seasons.md) | SeasonID     | SeasonID       | NO ACTION | CASCADE   | NONE       |