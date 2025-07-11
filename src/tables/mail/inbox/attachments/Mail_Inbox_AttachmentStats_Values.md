Mail_Inbox_AttachmentStats_Values table

[Column Guide](../../../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type       | Not Null | Default Value | Primary Key |
|----|------------------|-----------------|----------|---------------|-------------|
| 0  | AttachmentStatID | INTEGER         | Yes (1)  | null          | Yes (1)     |
| 1  | Number           | INTEGER         | Yes (1)  | null          | Order 2 (2) |
| 2  | Value            | DECIMAL (10, 5) | Yes (1)  | null          | No (0)      |
| 3  | NumOfDecimals    | INTEGER         | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                               | Local Column     | Foreign Column   | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------|------------------|------------------|-----------|-----------|------------|
| 0  | 0   | [Mail_Inbox_AttachmentStats](Mail_Inbox_AttachmentStats.md) | AttachmentStatID | AttachmentStatID | RESTRICT  | CASCADE   | NONE       |