Regulations_Proposals table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name         | Data Type | Not Null | Default Value | Primary Key |
|----|--------------|-----------|----------|---------------|-------------|
| 0  | ProposalID   | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | ChangeType   | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | VoteDay      | INTEGER   | Yes (1)  | null          | No (0)      |
| 3  | TargetSeason | INTEGER   | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                 | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Regulations_Enum_ChangeType](Regulations_Enum_ChangeType.md) | ChangeType   | Value          | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                               | Local Column | Foreign Column | 
|----|-----|-----------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Regulations_Proposals_ChangeGroups](Regulations_Proposals_ChangeGroups.md) | ProposalID   | ProposalID     |
| 1  | 0   | [Regulations_TeamVotes](Regulations_TeamVotes.md)                           | ProposalID   | ProposalID     |
