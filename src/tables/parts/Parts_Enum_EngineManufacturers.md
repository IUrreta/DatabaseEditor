Parts_Enum_EngineManufacturers table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                              | Data Type | Not Null | Default Value | Primary Key |
|----|-----------------------------------|-----------|----------|---------------|-------------|
| 0  | Value                             | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name                              | TEXT      | Yes (1)  | null          | No (0)      |
| 2  | TeamID                            | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | EngineDesignID                    | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | ErsDesignID                       | INTEGER   | Yes (1)  | null          | No (0)      |
| 5  | GearboxDesignID                   | INTEGER   | Yes (1)  | null          | No (0)      |
| 6  | Cost                              | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 7  | StartOfSeasonUpfrontCost          | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 8  | StartOfSeasonMonthlyCost          | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 9  | StartOfSeasonMonthlyCostNumMonths | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                     | Local Column    | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------|-----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md)         | TeamID          | TeamID         | CASCADE   | NO ACTION | NONE       |
| 1  | 0   | [Parts_Designs](Parts_Designs.md) | EngineDesignID  | DesignID       | CASCADE   | NO ACTION | NONE       |
| 2  | 0   | [Parts_Designs](Parts_Designs.md) | GearboxDesignID | DesignID       | CASCADE   | NO ACTION | NONE       |
| 3  | 0   | [Parts_Designs](Parts_Designs.md) | ErsDesignID     | DesignID       | CASCADE   | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                       | Local Column | Foreign Column             | 
|----|-----|---------------------------------------------------------------------|--------------|----------------------------|
| 0  | 0   | [Parts_TeamHistory](Parts_TeamHistory.md)                           | Value        | EngineManufacturer         |
| 1  | 0   | [Player_PreSeason](../player/Player_PreSeason.md)                   | Value        | SelectedEngineManufacturer |
| 2  | 0   | [Parts_Enum_EngineManufacturers](Parts_Enum_EngineManufacturers.md) | Value        | EngineManufacturerID       |
