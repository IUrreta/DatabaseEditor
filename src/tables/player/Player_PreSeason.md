Player_PreSeason table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                       | Data Type | Not Null | Default Value | Primary Key |
|----|----------------------------|-----------|----------|---------------|-------------|
| 0  | SelectedEngineManufacturer | INTEGER   | Yes (1)  | '1'           | Yes (1)     |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                                | Local Column               | Foreign Column | On Update | On Delete | Match Type |
|----|-----|------------------------------------------------------------------------------|----------------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_EngineManufacturers](../parts/Parts_Enum_EngineManufacturers.md) | SelectedEngineManufacturer | Value          | NO ACTION | NO ACTION | NONE       |