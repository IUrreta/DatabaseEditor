Races_DriverStandings table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type | Not Null | Default Value | Primary Key |
|----|--------------------|-----------|----------|---------------|-------------|
| 0  | SeasonID           | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | DriverID           | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | Points             | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | Position           | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | LastPointsChange   | INTEGER   | No (0)   | '0'           | No (0)      |
| 5  | LastPositionChange | INTEGER   | No (0)   | '0'           | No (0)      |
| 6  | RaceFormula        | INTEGER   | Yes (1)  | '1'           | Order 3 (3) |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Seasons](../season/Seasons.md)                       | SeasonID     | SeasonID       | NO ACTION | CASCADE   | NONE       |
| 1  | 0   | [Staff_DriverData](../staff/data/Staff_DriverData.md) | DriverID     | StaffID        | CASCADE   | CASCADE   | NONE       |