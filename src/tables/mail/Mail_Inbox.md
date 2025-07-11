Mail_Inbox table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                  | Data Type | Not Null | Default Value | Primary Key |
|----|-----------------------|-----------|----------|---------------|-------------|
| 0  | MailID                | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Day                   | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 2  | Subject               | TEXT      | No (0)   | 'NULL'        | No (0)      |
| 3  | Icon                  | TEXT      | No (0)   | 'NULL'        | No (0)      |
| 4  | ReferenceID           | INTEGER   | Yes (1)  | '-1'          | No (0)      |
| 5  | SenderName            | TEXT      | No (0)   | 'NULL'        | No (0)      |
| 6  | SenderSubLabel        | TEXT      | No (0)   | 'NULL'        | No (0)      |
| 7  | SenderIcon            | TEXT      | No (0)   | 'NULL'        | No (0)      |
| 8  | StretchOddAttachments | INTEGER   | No (0)   | '0'           | No (0)      |
| 9  | Filters               | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 10 | Unread                | INTEGER   | Yes (1)  | '1'           | No (0)      |
| 11 | BlockType             | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 12 | InitialBlockType      | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 13 | OnReadTrigger         | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 14 | Flagged               | INTEGER   | No (0)   | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                 | Local Column     | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------|------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Mail_Enum_Trigger](Mail_Enum_Trigger.md)     | OnReadTrigger    | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Mail_Enum_BlockType](Mail_Enum_BlockType.md) | InitialBlockType | Type           | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Mail_Enum_BlockType](Mail_Enum_BlockType.md) | BlockType        | Type           | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                         | Local Column | Foreign Column | 
|----|-----|-------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Mail_Dilemmas_Responses](Mail_Dilemmas_Responses.md) | MailID       | MailID         |
| 1  | 0   | [Mail_Inbox_Attachments](Mail_Inbox_Attachments.md)   | MailID       | MailID         |
| 2  | 0   | [Mail_Inbox_Links](Mail_Inbox_Links.md)               | MailID       | MailID         |
| 3  | 0   | [Mail_ChainSequences](Mail_ChainSequences.md)         | MailID       | MailID         |
| 4  | 0   | [Mail_Inbox_Sections](Mail_Inbox_Sections.md)         | MailID       | MailID         |
