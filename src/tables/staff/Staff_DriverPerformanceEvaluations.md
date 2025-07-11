Staff_DriverPerformanceEvaluations table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type | Not Null | Default Value | Primary Key |
|----|------------------|-----------|----------|---------------|-------------|
| 0  | StaffID          | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Result           | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 2  | Day              | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | ExpectedPosition | INTEGER   | No (0)   | null          | No (0)      |
| 4  | ActualPosition   | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                  | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_DriverData](Staff_DriverData.md) | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                           | Local Column | Foreign Column | 
|----|-----|-----------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Staff_DriverPerformanceEvaluations_Stats](Staff_DriverPerformanceEvaluations_Stats.md) | StaffID      | StaffID        |
