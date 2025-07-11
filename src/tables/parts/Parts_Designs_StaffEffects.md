Parts_Designs_StaffEffects table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------|----------------|----------|---------------|-------------|
| 0  | DesignID  | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | PartStat  | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | StaffType | INTEGER        | Yes (1)  | null          | Order 3 (3) |
| 3  | Value     | DECIMAL (8, 4) | No (0)   | '0.0'         | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                            | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|----------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_StaffType](../staff/Staff_Enum_StaffType.md) | StaffType    | StaffType      | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Parts_Designs_StatValues](Parts_Designs_StatValues.md)  | DesignID     | DesignID       | RESTRICT  | CASCADE   | NONE       |
| 1  | 1   | [Parts_Designs_StatValues](Parts_Designs_StatValues.md)  | PartStat     | PartStat       | RESTRICT  | CASCADE   | NONE       |