Save_CarRaceEventSummary table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                       | Data Type | Not Null | Default Value | Primary Key |
|----|----------------------------|-----------|----------|---------------|-------------|
| 0  | CarIndex                   | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | SuccessfulOvertakes        | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 2  | FailedOvertakes            | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 3  | SuccessfulDefends          | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 4  | FailedDefends              | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 5  | LapsDuringSafetyCar        | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 6  | LapsDuringVirtualSafetyCar | INTEGER   | Yes (1)  | '0'           | No (0)      |

Table has no FKs that point to it. 