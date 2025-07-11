Save_Strategist_QualificationRun table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------|----------------|----------|---------------|-------------|
| 0  | TeamID               | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | LoadoutID            | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | RunStartTime         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | RunEstimatedEndTime  | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | TyreSetID            | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | FastLapCount         | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | CurrentState         | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | IncludeCooldownLaps  | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 8  | AdditionalLapsOfFuel | INTEGER        | Yes (1)  | null          | No (0)      |
| 9  | CurrentRun           | BOOLEAN        | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md) | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |