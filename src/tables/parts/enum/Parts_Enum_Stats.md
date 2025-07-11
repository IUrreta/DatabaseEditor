Parts_Enum_Stats table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | Value | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name  | TEXT      | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it.

FKs this table points to

| ID | Seq | Foreign Table                                                                                                    | Local Column | Foreign Column | 
|----|-----|------------------------------------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Buildings_Effects_Parts](../../building/effects/Buildings_Effects_Parts.md)                                        | Value        | StatID         |
| 1  | 0   | [Regulations_Technical_StatReductions](../../regulations/tech/Regulations_Technical_StatReductions.md)                   | Value        | PartStat       |
| 2  | 0   | [Regulations_Technical_TypeStatComboReductions](../../regulations/tech/Regulations_Technical_TypeStatComboReductions.md) | Value        | PartStat       |
| 3  | 0   | [Parts_TeamExpertise](../Parts_TeamExpertise.md)                                                                    | Value        | PartStat       |
| 4  | 0   | [Parts_Designs_StatValues](../design/Parts_Designs_StatValues.md)                                                          | Value        | PartStat       |
| 5  | 0   | [Parts_StatDesignFocusModifiers](../Parts_StatDesignFocusModifiers.md)                                              | Value        | SourceStat     |
| 6  | 0   | [Parts_StatDesignFocusModifiers](../Parts_StatDesignFocusModifiers.md)                                              | Value        | ImpactStat     |
| 7  | 0   | [Parts_DesignFocusPresets](../design/Parts_DesignFocusPresets.md)                                                          | Value        | PartStat       |
