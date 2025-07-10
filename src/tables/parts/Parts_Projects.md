Parts_Projects table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type | Not Null | Default Value | Primary Key |
|----|------------------|-----------|----------|---------------|-------------|
| 0  | ProjectID        | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | DesignID         | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | AssignmentID     | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | ManufactureSpeed | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | Quantity         | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 5  | Progress         | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 6  | NewDesign        | INTEGER   | Yes (1)  | null          | No (0)      |
| 7  | StartDay         | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                    | Local Column     | Foreign Column | On Update | On Delete | Match Type |
|----|-----|--------------------------------------------------|------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_DevSpeeds](Parts_Enum_DevSpeeds.md)  | ManufactureSpeed | Value          | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Parts_Designs](Parts_Designs.md)                | DesignID         | DesignID       | NO ACTION | CASCADE   | NONE       |
| 2  | 0   | [SubTeam_Assignments](../SubTeam_Assignments.md) | AssignmentID     | AssignmentID   | NO ACTION | NO ACTION | NONE       |