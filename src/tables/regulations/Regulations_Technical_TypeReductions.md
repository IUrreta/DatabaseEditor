Regulations_Technical_TypeReductions table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type    | Not Null | Default Value | Primary Key |
|----|---------------|--------------|----------|---------------|-------------|
| 0  | GroupID       | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | PartType      | INTEGER      | Yes (1)  | null          | Order 2 (2) |
| 2  | TypeReduction | decimal(3,2) | Yes (1)  | '0.00'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                           | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_Type](../parts/Parts_Enum_Type.md)          | PartType     | Value          | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Regulations_ChangeGroups](Regulations_ChangeGroups.md) | GroupID      | GroupID        | CASCADE   | CASCADE   | NONE       |