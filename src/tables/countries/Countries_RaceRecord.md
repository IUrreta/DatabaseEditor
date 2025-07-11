Countries_RaceRecord table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type | Not Null | Default Value | Primary Key |
|----|--------------------|-----------|----------|---------------|-------------|
| 0  | CountryID          | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Formula            | INTEGER   | Yes (1)  | '1'           | Order 2 (2) |
| 2  | TotalRaces         | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 3  | TotalStarts        | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 4  | TotalPodiums       | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 5  | TotalWins          | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 6  | TotalChampionships | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Countries](Countries.md) | CountryID    | CountryID      | RESTRICT  | CASCADE   | NONE       |