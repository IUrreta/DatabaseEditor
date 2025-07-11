Regulations_ChangeGroups table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name       | Data Type | Not Null | Default Value | Primary Key |
|----|------------|-----------|----------|---------------|-------------|
| 0  | GroupID    | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | ChangeType | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | LocKey     | TEXT      | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                 | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Regulations_Enum_ChangeType](enum/Regulations_Enum_ChangeType.md) | ChangeType   | Value          | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                                     | Local Column | Foreign Column | 
|----|-----|---------------------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Regulations_ChangeGroups_VotingPairs](Regulations_ChangeGroups_VotingPairs.md)                   | GroupID      | ChangeGroup1   |
| 1  | 0   | [Regulations_ChangeGroups_VotingPairs](Regulations_ChangeGroups_VotingPairs.md)                   | GroupID      | ChangeGroup2   |
| 2  | 0   | [Regulations_NonTechnical](nontech/Regulations_NonTechnical.md)                                           | GroupID      | GroupID        |
| 3  | 0   | [Regulations_Proposals_ChangeGroups](Regulations_Proposals_ChangeGroups.md)                       | GroupID      | GroupID        |
| 4  | 0   | [Regulations_TeamVotes](Regulations_TeamVotes.md)                                                 | GroupID      | GroupID        |
| 5  | 0   | [Regulations_Technical_StatReductions](tech/Regulations_Technical_StatReductions.md)                   | GroupID      | GroupID        |
| 6  | 0   | [Regulations_Technical_SweepingReductions](tech/Regulations_Technical_SweepingReductions.md)           | GroupID      | GroupID        |
| 7  | 0   | [Regulations_Technical_TypeReductions](tech/Regulations_Technical_TypeReductions.md)                   | GroupID      | GroupID        |
| 8  | 0   | [Regulations_Technical_TypeStatComboReductions](tech/Regulations_Technical_TypeStatComboReductions.md) | GroupID      | GroupID        |
