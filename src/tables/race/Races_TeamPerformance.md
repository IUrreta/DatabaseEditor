Races_TeamPerformance table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type | Not Null | Default Value | Primary Key |
|----|---------------|-----------|----------|---------------|-------------|
| 0  | SeasonID      | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID        | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | TrackID       | INTEGER   | Yes (1)  | null          | Order 3 (3) |
| 3  | Straights     | float     | Yes (1)  | null          | No (0)      |
| 4  | SlowCorners   | float     | Yes (1)  | null          | No (0)      |
| 5  | MediumCorners | float     | Yes (1)  | null          | No (0)      |
| 6  | FastCorners   | float     | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Tracks](Races_Tracks.md) | TrackID      | TrackID        | NO ACTION | CASCADE   | NONE       |
| 1  | 0   | [Teams](../team/Teams.md)       | TeamID       | TeamID         | NO ACTION | CASCADE   | NONE       |
| 2  | 0   | [Seasons](../season/Seasons.md) | SeasonID     | SeasonID       | NO ACTION | CASCADE   | NONE       |