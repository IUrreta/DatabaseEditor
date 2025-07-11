Staff_State table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type | Not Null | Default Value | Primary Key |
|----|------------------|-----------|----------|---------------|-------------|
| 0  | StaffID          | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | UnspentXP        | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 2  | XPGainedLastRace | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 3  | XPGainedLastWeek | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 4  | Mentality        | INTEGER   | Yes (1)  | '50'          | No (0)      |
| 5  | MentalityOpinion | INTEGER   | Yes (1)  | '2'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                     | Local Column     | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------|------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_GameData](data/Staff_GameData.md) | StaffID          | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_Mentality](enum/Staff_Enum_Mentality.md)   | MentalityOpinion | Value          | RESTRICT  | CASCADE   | NONE       |