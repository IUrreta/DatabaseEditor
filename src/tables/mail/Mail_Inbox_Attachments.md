Mail_Inbox_Attachments table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name         | Data Type | Not Null | Default Value | Primary Key |
|----|--------------|-----------|----------|---------------|-------------|
| 0  | AttachmentID | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | MailID       | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | Name         | TEXT      | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table               | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Mail_Inbox](Mail_Inbox.md) | MailID       | MailID         | NO ACTION | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                               | Local Column | Foreign Column | 
|----|-----|-------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Mail_Inbox_AttachmentStats](Mail_Inbox_AttachmentStats.md) | AttachmentID | AttachmentID   |
