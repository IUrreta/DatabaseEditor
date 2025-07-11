Mail_Inbox_Sections table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name         | Data Type | Not Null | Default Value | Primary Key |
|----|--------------|-----------|----------|---------------|-------------|
| 0  | MailID       | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Number       | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | Title        | TEXT      | No (0)   | null          | No (0)      |
| 3  | Text         | TEXT      | No (0)   | null          | No (0)      |
| 4  | Image        | TEXT      | No (0)   | null          | No (0)      |
| 5  | ImageCaption | TEXT      | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table               | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Mail_Inbox](Mail_Inbox.md) | MailID       | MailID         | RESTRICT  | CASCADE   | NONE       |