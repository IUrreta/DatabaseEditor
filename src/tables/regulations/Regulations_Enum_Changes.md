Regulations_Enum_Changes table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type   | Not Null | Default Value | Primary Key |
|----|-------------------|-------------|----------|---------------|-------------|
| 0  | ChangeID          | INTEGER     | Yes (1)  | null          | Yes (1)     |
| 1  | Name              | TEXT        | Yes (1)  | null          | No (0)      |
| 2  | ChangeType        | INTEGER     | Yes (1)  | null          | No (0)      |
| 3  | CurrentValue      | bigint (20) | Yes (1)  | null          | No (0)      |
| 4  | PreviousValue     | INTEGER     | Yes (1)  | '0'           | No (0)      |
| 5  | MinValue          | bigint (20) | Yes (1)  | null          | No (0)      |
| 6  | MaxValue          | bigint (20) | Yes (1)  | null          | No (0)      |
| 7  | LocKey            | TEXT        | Yes (1)  | null          | No (0)      |
| 8  | DescriptionLocKey | TEXT        | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                 | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Regulations_Enum_ChangeType](Regulations_Enum_ChangeType.md) | ChangeType   | Value          | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                           | Local Column | Foreign Column | 
|----|-----|---------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Regulations_NonTechnical](Regulations_NonTechnical.md) | GroupID      | GroupID        |
