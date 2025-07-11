Parts_Designs_StatValues table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------------|----------------|----------|---------------|-------------|
| 0  | DesignID        | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | PartStat        | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | Value           | decimal (8, 4) | Yes (1)  | null          | No (0)      |
| 3  | UnitValue       | decimal (8, 4) | Yes (1)  | '0.0'         | No (0)      |
| 4  | DesignFocus     | decimal (8, 4) | Yes (1)  | '0.0'         | No (0)      |
| 5  | ExpertiseGain   | decimal (8, 4) | Yes (1)  | '0.0'         | No (0)      |
| 6  | ExpertiseEffect | decimal (8, 4) | Yes (1)  | '0.0'         | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                           | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_Stats](Parts_Enum_Stats.md) | PartStat     | Value          | CASCADE   | NO ACTION | NONE       |
| 1  | 0   | [Parts_Designs](Parts_Designs.md)       | DesignID     | DesignID       | CASCADE   | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                     | Local Column | Foreign Column | 
|----|-----|-------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Parts_Designs_StaffEffects](Parts_Designs_StaffEffects.md)       | DesignID     | DesignID       |
| 0  | 1   | [Parts_Designs_StaffEffects](Parts_Designs_StaffEffects.md)       | PartStat     | PartStat       |
| 1  | 0   | [Parts_Designs_BuildingEffects](Parts_Designs_BuildingEffects.md) | DesignID     | DesignID       |
| 1  | 1   | [Parts_Designs_BuildingEffects](Parts_Designs_BuildingEffects.md) | PartStat     | PartStat       |
