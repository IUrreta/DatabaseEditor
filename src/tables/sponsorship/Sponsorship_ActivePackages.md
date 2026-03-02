Sponsorship_ActivePackages table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name        | Data Type | Not Null | Default Value | Primary Key |
|----|-------------|-----------|----------|---------------|-------------|
| 0  | TeamID      | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | SponsorID   | TEXT      | Yes (1)  | null          | Order 2 (2) |
| 2  | SponsorType | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | Engagement  | INTEGER   | No (0)   | '0'           | No (0)      |
| 4  | Slot        | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md) | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                                 | Local Column | Foreign Column | 
|----|-----|-----------------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Sponsorship_ActivePackages_SecondaryBonuses](Sponsorship_ActivePackages_SecondaryBonuses.md) | TeamID       | TeamID         |
| 0  | 1   | [Sponsorship_ActivePackages_SecondaryBonuses](Sponsorship_ActivePackages_SecondaryBonuses.md) | SponsorID    | SponsorID      |
