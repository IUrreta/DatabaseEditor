Staff_NarrativeData table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type | Not Null | Default Value | Primary Key |
|----|-----------|-----------|----------|---------------|-------------|
| 0  | StaffID   | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | GenSource | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | JobTitle  | TEXT      | Yes (1)  | null          | No (0)      |
| 3  | TeamID    | INTEGER   | No (0)   | null          | No (0)      |
| 4  | IsActive  | INTEGER   | Yes (1)  | '1'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                              | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|----------------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)                                                  | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_NarrativeGenSource](../staff/Staff_Enum_NarrativeGenSource.md) | GenSource    | Value          | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Staff_BasicData](Staff_BasicData.md)                        | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |