Seasons_PreSeasonTesting table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type | Not Null | Default Value | Primary Key |
|----|----------------------|-----------|----------|---------------|-------------|
| 0  | PeriodID             | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TrackID              | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | WeeksBeforeFirstRace | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | FirstDayOfWeek       | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | Length               | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                           | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Tracks](../race/Races_Tracks.md) | TrackID      | TrackID        | RESTRICT  | CASCADE   | NONE       |