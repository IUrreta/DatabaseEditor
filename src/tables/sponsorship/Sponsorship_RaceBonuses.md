Sponsorship_RaceBonuses table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name       | Data Type | Not Null | Default Value | Primary Key |
|----|------------|-----------|----------|---------------|-------------|
| 0  | DriverID   | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | RaceID     | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | Difficulty | INTEGER   | Yes (1)  | null          | Order 3 (3) |
| 3  | Position   | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | Selected   | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 5  | Achieved   | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Sponsorship_Enum_RaceBonusDifficulty](Sponsorship_Enum_RaceBonusDifficulty.md) | Difficulty   | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Races](../race/Races.md)                                                       | RaceID       | RaceID         | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Staff_DriverData](../staff/Staff_DriverData.md)                           | DriverID     | StaffID        | RESTRICT  | CASCADE   | NONE       |