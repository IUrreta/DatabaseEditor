Parts_EnginePurchase_MonthlyPayments table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type | Not Null | Default Value | Primary Key |
|----|----------------------|-----------|----------|---------------|-------------|
| 0  | TeamID               | INTEGER   | Yes (1)  | null          | No (0)      |
| 1  | EngineManufacturerID | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | MonthsLeft           | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                       | Local Column         | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------------|----------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_EngineManufacturers](enum/Parts_Enum_EngineManufacturers.md) | EngineManufacturerID | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Teams](../team/Teams.md)                                           | TeamID               | TeamID         | RESTRICT  | CASCADE   | NONE       |