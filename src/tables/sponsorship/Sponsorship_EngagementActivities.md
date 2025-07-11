Sponsorship_EngagementActivities table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                         | Data Type | Not Null | Default Value | Primary Key |
|----|------------------------------|-----------|----------|---------------|-------------|
| 0  | EngagementActivityInstanceID | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID                       | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | EngagementActivityID         | TEXT      | Yes (1)  | null          | No (0)      |
| 3  | Period                       | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | EngagementGained             | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 5  | SponsorID                    | TEXT      | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md) | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                             | Local Column                 | Foreign Column               | 
|----|-----|-------------------------------------------------------------------------------------------|------------------------------|------------------------------|
| 0  | 0   | [Sponsorship_EngagementActivities_Effects](Sponsorship_EngagementActivities_Effects.md)   | EngagementActivityInstanceID | EngagementActivityInstanceID |
| 1  | 0   | [Sponsorship_AffiliateEngagementActivities](Sponsorship_AffiliateEngagementActivities.md) | EngagementActivityInstanceID | EngagementActivityInstanceID |
