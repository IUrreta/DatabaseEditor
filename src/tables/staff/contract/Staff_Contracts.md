Staff_Contracts table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                    | Data Type      | Not Null | Default Value | Primary Key |
|----|-------------------------|----------------|----------|---------------|-------------|
| 0  | StaffID                 | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | ContractType            | INTEGER        | Yes (1)  | '0'           | Order 2 (2) |
| 2  | TeamID                  | INTEGER        | Yes (1)  | null          | Order 3 (3) |
| 3  | PosInTeam               | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | StartDay                | INTEGER        | Yes (1)  | '43831'       | No (0)      |
| 5  | EndSeason               | INTEGER        | Yes (1)  | '2022'        | No (0)      |
| 6  | Salary                  | INTEGER        | Yes (1)  | '100000'      | No (0)      |
| 7  | StartingBonus           | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 8  | RaceBonus               | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 9  | RaceBonusTargetPos      | INTEGER        | Yes (1)  | '1'           | No (0)      |
| 10 | BreakoutClause          | decimal (3, 2) | Yes (1)  | '0.5'         | No (0)      |
| 11 | AffiliateDualRoleClause | INTEGER        | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|--------------------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../../team/Teams.md)                                    | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_GameData](../data/Staff_GameData.md)                   | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Staff_Enum_ContractType](../enum/contract/Staff_Enum_ContractType.md) | ContractType | Value          | RESTRICT  | CASCADE   | NONE       |