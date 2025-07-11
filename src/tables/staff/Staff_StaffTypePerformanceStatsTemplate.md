Staff_StaffTypePerformanceStatsTemplate table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                | Data Type | Not Null | Default Value | Primary Key |
|----|---------------------|-----------|----------|---------------|-------------|
| 0  | StaffType           | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | PerformanceStatType | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | SeededValMin        | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | SeededValMax        | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                         | Local Column        | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------------|---------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_StaffType](enum/Staff_Enum_StaffType.md)                       | StaffType           | StaffType      | CASCADE   | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_PerformanceStatTypes](enum/Staff_Enum_PerformanceStatTypes.md) | PerformanceStatType | Value          | NO ACTION | NO ACTION | NONE       |