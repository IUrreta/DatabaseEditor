Sponsorship_AffiliateEngagementActivities table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                         | Data Type | Not Null | Default Value | Primary Key |
|----|------------------------------|-----------|----------|---------------|-------------|
| 0  | EngagementActivityInstanceID | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | StaffID                      | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                           | Local Column                 | Foreign Column               | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------------------|------------------------------|------------------------------|-----------|-----------|------------|
| 0  | 0   | [Staff_DriverData](../../staff/data/Staff_DriverData.md)                   | StaffID                      | StaffID                      | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Sponsorship_EngagementActivities](Sponsorship_EngagementActivities.md) | EngagementActivityInstanceID | EngagementActivityInstanceID | RESTRICT  | CASCADE   | NONE       |