Staff_Driver_Achievements table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name        | Data Type | Not Null | Default Value | Primary Key |
|----|-------------|-----------|----------|---------------|-------------|
| 0  | StaffID     | INTEGER   | Yes (1)  | null          | No (0)      |
| 1  | Award       | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | TrackRecord | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                              | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|--------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_GameData](Staff_GameData.md) | StaffID      | StaffID        | NO ACTION | CASCADE   | NONE       |