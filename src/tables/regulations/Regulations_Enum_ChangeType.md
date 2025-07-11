Regulations_Enum_ChangeType table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                  | Data Type    | Not Null | Default Value | Primary Key |
|----|-----------------------|--------------|----------|---------------|-------------|
| 0  | Value                 | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | Name                  | TEXT         | Yes (1)  | null          | No (0)      |
| 2  | LocKey                | TEXT         | Yes (1)  | null          | No (0)      |
| 3  | DescriptionLocKey     | TEXT         | Yes (1)  | null          | No (0)      |
| 4  | GroupSeasonDelay      | INTEGER      | Yes (1)  | '1'           | No (0)      |
| 5  | SkipSeasonProbability | decimal(3,2) | Yes (1)  | '0.00'        | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                             | Local Column | Foreign Column | 
|----|-----|-----------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Regulations_EventCalendar](Regulations_EventCalendar.md) | Value        | ChangeType     |
| 1  | 0   | [Regulations_Proposals](Regulations_Proposals.md)         | Value        | ChangeType     |
