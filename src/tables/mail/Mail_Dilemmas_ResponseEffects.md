Mail_Dilemmas_ResponseEffects table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type     | Not Null | Default Value | Primary Key |
|----|----------------|---------------|----------|---------------|-------------|
| 0  | MailID         | INTEGER       | Yes (1)  | null          | Yes (1)     |
| 1  | ResponseNumber | INTEGER       | Yes (1)  | null          | Order 2 (2) |
| 2  | EffectNumber   | INTEGER       | Yes (1)  | null          | Order 3 (3) |
| 3  | Label          | TEXT          | Yes (1)  | null          | No (0)      |
| 4  | Status         | TEXT          | Yes (1)  | null          | No (0)      |
| 5  | Icon           | TEXT          | No (0)   | 'NULL'        | No (0)      |
| 6  | ReferenceID    | INTEGER       | Yes (1)  | '-1'          | No (0)      |
| 7  | SubReferenceID | INTEGER       | No (0)   | 'NULL'        | No (0)      |
| 8  | Effect         | INTEGER       | Yes (1)  | null          | No (0)      |
| 9  | EffectType     | INTEGER       | Yes (1)  | null          | No (0)      |
| 10 | Value          | decimal(10,6) | Yes (1)  | null          | No (0)      |
| 11 | Duration       | INTEGER       | No (0)   | 'NULL'        | No (0)      |
| 12 | Hidden         | INTEGER       | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                         | Local Column   | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------|----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Mail_Dilemmas_Responses](Mail_Dilemmas_Responses.md) | MailID         | MailID         | CASCADE   | CASCADE   | NONE       |
| 0  | 1   | [Mail_Dilemmas_Responses](Mail_Dilemmas_Responses.md) | ResponseNumber | ResponseNumber | CASCADE   | CASCADE   | NONE       |