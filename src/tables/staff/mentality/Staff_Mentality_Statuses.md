Staff_Mentality_Statuses table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name    | Data Type | Not Null | Default Value | Primary Key |
|----|---------|-----------|----------|---------------|-------------|
| 0  | StaffID | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Status  | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | Opinion | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | Value   | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                               | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_Mentality](../enum/Staff_Enum_Mentality.md)             | Opinion      | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_MentalityStatus](../enum/Staff_Enum_MentalityStatus.md) | Status       | Value          | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Staff_GameData](../data/Staff_GameData.md)           | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |