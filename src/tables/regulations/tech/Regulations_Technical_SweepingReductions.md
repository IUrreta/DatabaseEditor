Regulations_Technical_SweepingReductions table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type    | Not Null | Default Value | Primary Key |
|----|-------------------|--------------|----------|---------------|-------------|
| 0  | GroupID           | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | SweepingReduction | decimal(3,2) | Yes (1)  | '0.00'        | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                           | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Regulations_ChangeGroups](../Regulations_ChangeGroups.md) | GroupID      | GroupID        | NO ACTION | NO ACTION | NONE       |