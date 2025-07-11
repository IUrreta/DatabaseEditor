Effects_ActiveEffects table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------|----------------|----------|---------------|-------------|
| 0  | ActiveEffectID | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Effect         | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | EffectType     | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | Source         | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | Value          | DECIMAL (3, 2) | Yes (1)  | null          | No (0)      |
| 5  | ReferenceID    | INTEGER        | No (0)   | null          | No (0)      |
| 6  | SubReferenceID | INTEGER        | No (0)   | null          | No (0)      |
| 7  | EndDay         | INTEGER        | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Effects_Enum_Source](Effects_Enum_Source.md)         | Source       | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Effects_Enum_EffectType](Effects_Enum_EffectType.md) | EffectType   | Type           | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Effects_Enum_Effect](Effects_Enum_Effect.md)         | Effect       | Value          | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                                                | Local Column   | Foreign Column | 
|----|-----|--------------------------------------------------------------------------------------------------------------|----------------|----------------|
| 0  | 0   | [Sponsorship_EngagementActivities_Effects](../sponsorship/engagement/Sponsorship_EngagementActivities_Effects.md)       | ActiveEffectID | ActiveEffectID |
| 1  | 0   | [Sponsorship_ActivePackages_SecondaryBonuses](../sponsorship/Sponsorship_ActivePackages_SecondaryBonuses.md) | ActiveEffectID | ActiveEffectID |
