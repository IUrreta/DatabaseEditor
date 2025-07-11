Sponsorship_EngagementActivities_Effects table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                         | Data Type | Not Null | Default Value | Primary Key |
|----|------------------------------|-----------|----------|---------------|-------------|
| 0  | EngagementActivityInstanceID | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | ActiveEffectID               |           | Yes (1)  | null          | Order 2 (2) |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                           | Local Column                 | Foreign Column               | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------------------|------------------------------|------------------------------|-----------|-----------|------------|
| 0  | 0   | [Sponsorship_EngagementActivities](Sponsorship_EngagementActivities.md) | EngagementActivityInstanceID | EngagementActivityInstanceID | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Effects_ActiveEffects](../effect/Effects_ActiveEffects.md)             | ActiveEffectID               | ActiveEffectID               | RESTRICT  | CASCADE   | NONE       |