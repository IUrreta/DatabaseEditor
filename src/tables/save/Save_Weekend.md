Save_Weekend table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                   | Data Type      | Not Null | Default Value | Primary Key |
|----|------------------------|----------------|----------|---------------|-------------|
| 0  | ID                     | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | RaceID                 | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | WeekendStage           | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | CurrentGuiScreen       | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | ActiveStepID           | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | CurrentStageInnerStep  | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | PreviousStageInnerStep | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | TrackRubber            | decimal (6, 3) | Yes (1)  | null          | No (0)      |
| 8  | SimulatedP1            | INTEGER        | Yes (1)  | null          | No (0)      |
| 9  | SimulatedP2            | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | SimulatedP3            | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | SimulatedQ1            | INTEGER        | Yes (1)  | null          | No (0)      |
| 12 | SimulatedQ2            | INTEGER        | Yes (1)  | null          | No (0)      |
| 13 | SimulatedQ3            | INTEGER        | Yes (1)  | null          | No (0)      |
| 14 | MidSessionSave         | BOOLEAN        | Yes (1)  | '0'           | No (0)      |
| 15 | TimeRemaining          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 16 | CurrentLap             | INTEGER        | Yes (1)  | null          | No (0)      |
| 17 | LapCount               | INTEGER        | Yes (1)  | null          | No (0)      |
| 18 | SessionSkippedTime     | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 19 | SessionDelayTime       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 20 | SimulatedSQ1           | INTEGER        | Yes (1)  | null          | No (0)      |
| 21 | SimulatedSQ2           | INTEGER        | Yes (1)  | null          | No (0)      |
| 22 | SimulatedSQ3           | INTEGER        | Yes (1)  | null          | No (0)      |
| 23 | SimulatedSprint        | INTEGER        | Yes (1)  | null          | No (0)      |
| 24 | SimulatedRace          | INTEGER        | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Races](../race/Races.md) | RaceID       | RaceID         | NO ACTION | CASCADE   | NONE       |