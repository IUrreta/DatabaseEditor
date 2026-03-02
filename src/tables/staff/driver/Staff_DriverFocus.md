Staff_DriverFocus table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type | Not Null | Default Value | Primary Key |
|----|-------------------|-----------|----------|---------------|-------------|
| 0  | StaffID           | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | CurrentFocusType  | INTEGER   | No (0)   | '0'           | No (0)      |
| 2  | SelectedFocusType | INTEGER   | No (0)   | '0'           | No (0)      |
| 3  | Intensity         | INTEGER   | No (0)   | '1'           | No (0)      |
| 4  | ReferenceID       | INTEGER   | No (0)   | null          | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                       | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_BasicData](../data/Staff_BasicData.md) | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |