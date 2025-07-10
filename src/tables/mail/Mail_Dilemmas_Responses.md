Mail_Dilemmas_Responses table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type | Not Null | Default Value | Primary Key |
|----|----------------|-----------|----------|---------------|-------------|
| 0  | MailID         | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | ResponseNumber | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | Selected       | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 3  | Label          | TEXT      | Yes (1)  | null          | No (0)      |
| 4  | Icon           | TEXT      | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table               | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Mail_Inbox](Mail_Inbox.md) | MailID       | MailID         | CASCADE   | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                     | Local Column   | Foreign Column | 
|----|-----|-------------------------------------------------------------------|----------------|----------------|
| 0  | 0   | [Mail_Dilemmas_ResponseEffects](Mail_Dilemmas_ResponseEffects.md) | MailID         | MailID         |
| 1  | 0   | [Mail_Dilemmas_ResponseEffects](Mail_Dilemmas_ResponseEffects.md) | ResponseNumber | ResponseNumber |
