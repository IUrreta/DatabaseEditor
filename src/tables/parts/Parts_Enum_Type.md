Parts_Enum_Type table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                          | Data Type    | Not Null | Default Value | Primary Key |
|----|-------------------------------|--------------|----------|---------------|-------------|
| 0  | Value                         | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | Name                          | TEXT         | Yes (1)  | null          | No (0)      |
| 2  | LocKey                        | TEXT         | Yes (1)  | null          | No (0)      |
| 3  | BaseDesignCost                | INTEGER      | Yes (1)  | null          | No (0)      |
| 4  | BaseManufactureCost           | INTEGER      | Yes (1)  | null          | No (0)      |
| 5  | BaseDesignWork                | INTEGER      | Yes (1)  | null          | No (0)      |
| 6  | BaseManufactureWork           | INTEGER      | Yes (1)  | null          | No (0)      |
| 7  | PreSeasonDesignCostMultiplier | decimal(3,2) | Yes (1)  | '0.50'        | No (0)      |
| 8  | PreSeasonBuildCostMultiplier  | decimal(3,2) | Yes (1)  | '0.50'        | No (0)      |
| 9  | PreSeasonQuantity             | int(3)       | Yes (1)  | '0'           | No (0)      |
| 10 | NegativeFocusMulOnSelf        | decimal(5,3) | Yes (1)  | null          | No (0)      |
| 11 | NegativeFocusMulOnOthers      | decimal(5,3) | Yes (1)  | null          | No (0)      |
| 12 | DamagePristineThreshold       | decimal(5,3) | Yes (1)  | '1.000'       | No (0)      |
| 13 | DamageMinorThreshold          | decimal(5,3) | Yes (1)  | '0.300'       | No (0)      |
| 14 | DamageMajorThreshold          | decimal(5,3) | Yes (1)  | '0.100'       | No (0)      |
| 15 | DamageDestroyedThreshold      | decimal(5,3) | Yes (1)  | '0.010'       | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                                                                                    | Local Column | Foreign Column | 
|----|-----|------------------------------------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Buildings_Effects_Parts](../building/effects/Buildings_Effects_Parts.md)                                        | Value        | PartType       |
| 1  | 0   | [Parts_DamageEffects](Parts_DamageEffects.md)                                                                    | Value        | PartType       |
| 2  | 0   | [Parts_Designs](Parts_Designs.md)                                                                                | Value        | PartType       |
| 3  | 0   | [Parts_Designs_TeamData](Parts_Designs_TeamData.md)                                                              | Value        | PartType       |
| 4  | 0   | [Regulations_Technical_TypeReductions](../regulations/Regulations_Technical_TypeReductions.md)                   | Value        | PartType       |
| 5  | 0   | [Regulations_Technical_TypeStatComboReductions](../regulations/Regulations_Technical_TypeStatComboReductions.md) | Value        | PartType       |
| 6  | 0   | [Parts_TeamExpertise](Parts_TeamExpertise.md)                                                                    | Value        | PartType       |
| 7  | 0   | [Parts_StatDesignFocusModifiers](Parts_StatDesignFocusModifiers.md)                                              | Value        | PartType       |
| 8  | 0   | [Parts_DesignFocusPresets](Parts_DesignFocusPresets.md)                                                          | Value        | PartType       |
| 9  | 0   | [Parts_CarLoadout](Parts_CarLoadout.md)                                                                          | Value        | PartType       |
