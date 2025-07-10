Board_Confidence_RaceHistory table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name        | Data Type | Not Null | Default Value | Primary Key |
|----|-------------|-----------|----------|---------------|-------------|
| 0  | Day         | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TrackID     | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | Performance | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                 | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Tracks](../../race/Races_Tracks.md)                       | TrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Board_Enum_BoardPerformance](../Board_Enum_BoardPerformance.md) | Performance  | Value          | NO ACTION | NO ACTION | NONE       |