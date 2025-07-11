Regulations_ChangeGroups_VotingPairs table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type | Not Null | Default Value | Primary Key |
|----|-------------------|-----------|----------|---------------|-------------|
| 0  | VotePairID        | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | ChangeGroup1      | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | ChangeGroup2      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 3  | DescriptionLocKey | TEXT      | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                       | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Regulations_ChangeGroups](Regulations_ChangeGroups_VotingPairs.md) | ChangeGroup2 | GroupID        | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Regulations_ChangeGroups](Regulations_ChangeGroups_VotingPairs.md) | ChangeGroup1 | GroupID        | NO ACTION | NO ACTION | NONE       |