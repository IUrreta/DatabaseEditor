Races_GridPenalties table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type | Not Null | Default Value | Primary Key |
|----|------------------|-----------|----------|---------------|-------------|
| 0  | PenaltyID        | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID           | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | CarID            | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | ReasonForPenalty | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | SessionReceived  | INTEGER   | Yes (1)  | null          | No (0)      |
| 5  | Served           | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 6  | PitLaneStart     | INTEGER   | Yes (1)  | null          | No (0)      |
| 7  | ServeInRace      | INTEGER   | Yes (1)  | '1'           | No (0)      |
| 8  | ServeInSprint    | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                       | Local Column     | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------|------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)                           | TeamID           | TeamID         | NO ACTION | CASCADE   | NONE       |
| 1  | 0   | [Races_Enum_PenaltyType](enum/Races_Enum_PenaltyType.md) | ReasonForPenalty | Type           | NO ACTION | CASCADE   | NONE       |