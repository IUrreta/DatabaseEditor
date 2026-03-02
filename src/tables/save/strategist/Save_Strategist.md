Save_Strategist table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------|----------------|----------|---------------|-------------|
| 0  | TeamID               | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | LoadoutID            | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | CurrentStintIndex    | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | LapsOnTyres          | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | StartOfLapWear       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | EnforcedPitLap       | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | CustomRunLength      | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | CustomRunFuel        | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 8  | ActiveRun            | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 9  | CarRunIndex          | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | RunStartTime         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 11 | RunEndTime           | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 12 | PitstopRequestActive | BOOLEAN        | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../../team/Teams.md) | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |