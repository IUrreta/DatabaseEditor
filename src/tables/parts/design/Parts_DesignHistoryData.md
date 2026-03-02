Parts_DesignHistoryData table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name         | Data Type | Not Null | Default Value | Primary Key |
|----|--------------|-----------|----------|---------------|-------------|
| 0  | DesignID     | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | RaceUsage    | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 2  | RaceWins     | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 3  | RacePodiums  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 4  | NumPartsUsed | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                     | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Designs](Parts_Designs.md) | DesignID     | DesignID       | CASCADE   | CASCADE   | NONE       |