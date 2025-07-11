Mail_Inbox_AttachmentStats table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type | Not Null | Default Value | Primary Key |
|----|------------------|-----------|----------|---------------|-------------|
| 0  | AttachmentStatID | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | AttachmentID     | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | Name             | TEXT      | Yes (1)  | null          | No (0)      |
| 3  | Type             | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | Status           | INTEGER   | Yes (1)  | null          | No (0)      |
| 5  | Icon             | TEXT      | No (0)   | 'NULL'        | No (0)      |
| 6  | Modifiers        | TEXT      | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                     | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Mail_Enum_Attachment_Status](Mail_Enum_Attachment_Status.md)     | Status       | Status         | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Mail_Enum_Attachment_StatType](Mail_Enum_Attachment_StatType.md) | Type         | Type           | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Mail_Inbox_Attachments](Mail_Inbox_Attachments.md)               | AttachmentID | AttachmentID   | NO ACTION | CASCADE   | NONE       |