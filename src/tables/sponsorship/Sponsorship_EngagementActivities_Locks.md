Sponsorship_EngagementActivities_Locks table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name   | Data Type | Not Null | Default Value | Primary Key |
|----|--------|-----------|----------|---------------|-------------|
| 0  | TeamID | INTEGER   | Yes (1)  | null          | Yes (1)     |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md) | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |