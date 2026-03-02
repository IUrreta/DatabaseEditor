Staff_Mentality_Events table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name        | Data Type | Not Null | Default Value | Primary Key |
|----|-------------|-----------|----------|---------------|-------------|
| 0  | EventID     | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | StaffID     | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | Event       | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | Opinion     | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | Value       | INTEGER   | Yes (1)  | null          | No (0)      |
| 5  | DecayDay    | INTEGER   | Yes (1)  | null          | No (0)      |
| 6  | ReferenceID | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_Mentality](../enum/mentality/Staff_Enum_Mentality.md)           | Opinion      | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_MentalityEvent](../enum/mentality/Staff_Enum_MentalityEvent.md) | Event        | Value          | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Staff_GameData](../data/Staff_GameData.md)         | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |