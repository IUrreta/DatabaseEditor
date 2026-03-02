Regulations_Proposals_ChangeGroups table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name       | Data Type | Not Null | Default Value | Primary Key |
|----|------------|-----------|----------|---------------|-------------|
| 0  | ProposalID | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | GroupID    | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | State      | INTEGER   | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                           | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Regulations_Proposals](Regulations_Proposals.md)       | ProposalID   | ProposalID     | NO ACTION | CASCADE   | NONE       |
| 1  | 0   | [Regulations_ChangeGroups](Regulations_ChangeGroups.md) | GroupID      | GroupID        | NO ACTION | NO ACTION | NONE       |