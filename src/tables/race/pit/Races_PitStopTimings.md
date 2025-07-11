Races_PitStopTimings table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type      | Not Null | Default Value | Primary Key |
|----|---------------|----------------|----------|---------------|-------------|
| 0  | SeasonID      | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | RaceID        | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | TeamID        | INTEGER        | Yes (1)  | null          | Order 3 (3) |
| 3  | DriverID      | INTEGER        | Yes (1)  | null          | Order 4 (4) |
| 4  | PitStopID     | INTEGER        | Yes (1)  | null          | Order 5 (5) |
| 5  | PitStopStage  | INTEGER        | Yes (1)  | null          | Order 6 (6) |
| 6  | Duration      | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 7  | IncidentDelay | DECIMAL (6, 3) | Yes (1)  | '0.0'         | No (0)      |
| 8  | Lap           | INTEGER        | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                  | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|----------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_DriverData](../../staff/Staff_DriverData.md)          | DriverID     | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Seasons](../../season/Seasons.md)                                | SeasonID     | SeasonID       | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Races](../Races.md))                                             | RaceID       | RaceID         | RESTRICT  | CASCADE   | NONE       |
| 3  | 0   | [Teams](../../team/Teams.md)                                      | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 4  | 0   | [Staff_Enum_PitStopStage](../../staff/Staff_Enum_PitStopStage.md) | PitStopStage | Value          | RESTRICT  | CASCADE   | NONE       |