Staff_Enum_DevelopmentPlans table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name      | Data Type | Not Null | Default Value | Primary Key |
|----|-----------|-----------|----------|---------------|-------------|
| 0  | Value     | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | StaffType | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | Name      | TEXT      | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_StaffType](Staff_Enum_StaffType.md) | StaffType    | StaffType      | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                       | Local Column | Foreign Column  |
|----|-----|-------------------------------------|--------------|-----------------|
| 0  | 0   | [Staff_GameData](data/Staff_GameData.md) | Value        | DevelopmentPlan |