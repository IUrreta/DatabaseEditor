Sponsorship_ActivePackages_SecondaryBonuses table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type | Not Null | Default Value | Primary Key |
|----|----------------|-----------|----------|---------------|-------------|
| 0  | TeamID         | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | SponsorID      | TEXT      | Yes (1)  | null          | Order 2 (2) |
| 2  | ActiveEffectID | INTEGER   | Yes (1)  | null          | Order 3 (3) |
| 3  | AffiliateID    | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                               | Local Column   | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------|----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Sponsorship_ActivePackages](Sponsorship_ActivePackages.md) | TeamID         | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 0  | 1   | [Sponsorship_ActivePackages](Sponsorship_ActivePackages.md) | SponsorID      | SponsorID      | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_DriverData](../staff/data/Staff_DriverData.md)       | AffiliateID    | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Effects_ActiveEffects](../effect/Effects_ActiveEffects.md) | ActiveEffectID | ActiveEffectID | RESTRICT  | CASCADE   | NONE       |