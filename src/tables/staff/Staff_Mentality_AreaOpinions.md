Staff_Mentality_AreaOpinions table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name     | Data Type | Not Null | Default Value | Primary Key |
|----|----------|-----------|----------|---------------|-------------|
| 0  | StaffID  | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Category | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | Opinion  | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_Mentality](Staff_Enum_Mentality.md)                 | Opinion      | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_MentalityCategory](Staff_Enum_MentalityCategory.md) | Category     | Value          | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Staff_GameData](Staff_GameData.md)               | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |