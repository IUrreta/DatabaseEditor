Sponsorship_EngagementActivities_Choices table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type | Not Null | Default Value | Primary Key |
|----|----------------------|-----------|----------|---------------|-------------|
| 0  | TeamID               | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | EngagementActivityID | TEXT      | Yes (1)  | null          | Order 2 (2) |
| 2  | AffiliateID          | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_DriverData](../../staff/driver/Staff_DriverData.md) | AffiliateID  | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Teams](../../team/Teams.md)                             | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |