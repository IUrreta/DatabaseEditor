Races_FeederSeries_RaceLength table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type | Not Null | Default Value | Primary Key |
|----|---------------|-----------|----------|---------------|-------------|
| 0  | TrackID       | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | RaceFormula   | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | SprintLength  | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | FeatureLength | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Tracks](Races_Tracks.md) | TrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |