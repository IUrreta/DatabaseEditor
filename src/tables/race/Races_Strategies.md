Races_Strategies table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type | Not Null | Default Value | Primary Key |
|----|------------------|-----------|----------|---------------|-------------|
| 0  | StrategyID       | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | DriverID         | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | StintID          | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | TrackID          | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | SeasonID         | INTEGER   | Yes (1)  | null          | No (0)      |
| 5  | StartingLap      | INTEGER   | Yes (1)  | null          | No (0)      |
| 6  | EndingLap        | INTEGER   | Yes (1)  | null          | No (0)      |
| 7  | TyreSet          | INTEGER   | Yes (1)  | null          | No (0)      |
| 8  | PitLap           | INTEGER   | Yes (1)  | null          | No (0)      |
| 9  | PitWindowStart   | INTEGER   | Yes (1)  | null          | No (0)      |
| 10 | PitWindowOptimal | INTEGER   | Yes (1)  | null          | No (0)      |
| 11 | PitWindowEnd     | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races_Tracks](Races_Tracks.md)                       | TrackID      | TrackID        | NO ACTION | CASCADE   | NONE       |
| 1  | 0   | [Seasons](../season/Seasons.md)                       | SeasonID     | SeasonID       | NO ACTION | CASCADE   | NONE       |
| 2  | 0   | [Staff_DriverData](../staff/driver/Staff_DriverData.md) | DriverID     | StaffID        | NO ACTION | CASCADE   | NONE       |