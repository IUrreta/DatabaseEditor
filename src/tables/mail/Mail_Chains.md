Mail_Chains table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name           | Data Type | Not Null | Default Value | Primary Key |
|----|----------------|-----------|----------|---------------|-------------|
| 0  | ChainType      | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | ReferenceID    | INTEGER   | Yes (1)  | '- 1'         | Order 2 (2) |
| 2  | SubReferenceID | INTEGER   | Yes (1)  | '- 1'         | Order 3 (3) |
| 3  | LastTriggerDay | INTEGER   | Yes (1)  | null          | No (0)      |
| 4  | Cooldown       | INTEGER   | Yes (1)  | null          | No (0)      |
| 5  | Completed      | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                 | Local Column   | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------|----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Mail_Enum_ChainType](Mail_Enum_ChainType.md) | ChainType      | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Mail_ChainSequences](Mail_ChainSequences.md) | ChainType      | ChainType      | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Mail_ChainSequences](Mail_ChainSequences.md) | ReferenceID    | ReferenceID    | RESTRICT  | CASCADE   | NONE       |
| 3  | 0   | [Mail_ChainSequences](Mail_ChainSequences.md) | SubReferenceID | SubReferenceID | RESTRICT  | CASCADE   | NONE       |
