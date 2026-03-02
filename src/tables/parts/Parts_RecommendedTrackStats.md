Parts_RecommendedTrackStats table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type | Not Null | Default Value | Primary Key |
|----|-----------|-----------|----------|---------------|-------------|
| 0  | TrackID   | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | CarStat   | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | IsCrucial | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                 | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Tracks](../race/Races_Tracks.md)       | TrackID      | TrackID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Parts_Enum_CarStats](enum/Parts_Enum_CarStats.md) | CarStat      | Value          | CASCADE   | NO ACTION | NONE       |