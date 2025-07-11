Mail_ChainSequences table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type | Not Null | Default Value | Primary Key |
|----|----------------|-----------|----------|---------------|-------------|
| 0  | ChainType      | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | ReferenceID    | INTEGER   | Yes (1)  | '- 1'         | Order 2 (2) |
| 2  | SubReferenceID | INTEGER   | Yes (1)  | '- 1'         | Order 3 (3) |
| 3  | Position       | INTEGER   | Yes (1)  | null          | Order 4 (4) |
| 4  | MailID         | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                 | Local Column   | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------|----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Mail_Chains](Mail_Chains.md) | ChainType      | ChainType      | RESTRICT  | CASCADE   | NONE       |
| 0  | 1   | [Mail_Chains](Mail_Chains.md) | ReferenceID    | ReferenceID    | RESTRICT  | CASCADE   | NONE       |
| 0  | 2   | [Mail_Chains](Mail_Chains.md) | SubReferenceID | SubReferenceID | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Mail_Inbox](inbox/Mail_Inbox.md)   | MailID         | MailID         | RESTRICT  | CASCADE   | NONE       |