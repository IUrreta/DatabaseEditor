Parts_PowertrainRaceHistoryData table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type | Not Null | Default Value | Primary Key |
|----|------------------|-----------|----------|---------------|-------------|
| 0  | TrackID          | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID           | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | AssociatedCar    | INTEGER   | Yes (1)  | null          | Order 3 (3) |
| 3  | EnginePartsUsed  | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | ERSPartsUsed     | INTEGER   | Yes (1)  | null          | No (0)      |
| 5  | GearboxPartsUsed | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                           | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Tracks](../race/Races_Tracks.md) | TrackID      | TrackID        | NO ACTION | CASCADE   | NONE       |
| 1  | 0   | [Teams](../team/Teams.md)               | TeamID       | TeamID         | NO ACTION | CASCADE   | NONE       |