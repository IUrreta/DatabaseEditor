Staff_DriverPerformanceEvaluations_Stats table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type | Not Null | Default Value | Primary Key |
|----|-------------------|-----------|----------|---------------|-------------|
| 0  | StaffID           | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Stat              | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | PristineValue     | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | DeterioratedValue | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                               | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_PerformanceStatTypes](Staff_Enum_PerformanceStatTypes.md)       | Stat         | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_DriverPerformanceEvaluations](Staff_DriverPerformanceEvaluations.md) | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |