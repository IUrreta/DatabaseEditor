Board_TeamRating table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                      | Data Type | Not Null | Default Value | Primary Key |
|----|---------------------------|-----------|----------|---------------|-------------|
| 0  | TeamID                    | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | SeasonID                  | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | PtsFromConstructorResults | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | PtsFromDriverResults      | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | PtsFromSeasonsEntered     | INTEGER   | Yes (1)  | null          | No (0)      |
| 5  | PtsFromChampionshipsWon   | INTEGER   | Yes (1)  | null          | No (0)      |
| 6  | PtsFromNewTeamHype        | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)       | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Seasons](../season/Seasons.md) | SeasonID     | SeasonID       | RESTRICT  | CASCADE   | NONE       |