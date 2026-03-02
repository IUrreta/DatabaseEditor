Staff_ContractPatience table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                        | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------------------------|----------------|----------|---------------|-------------|
| 0  | StaffID                     | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | TeamID                      | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | Patience                    | DECIMAL (4, 3) | Yes (1)  | '1.0'         | No (0)      |
| 3  | LastNegotiationDay          | INTEGER        | No (0)   | null          | No (0)      |
| 4  | SuitabilityRating           | INTEGER        | No (0)   | '50'          | No (0)      |
| 5  | TeamOpinionRating           | INTEGER        | No (0)   | '100'         | No (0)      |
| 6  | OptimalAppealRangeMin       | decimal (3, 2) | No (0)   | '0.5'         | No (0)      |
| 7  | OptimalAppealRangeMax       | decimal (3, 2) | No (0)   | '0.8'         | No (0)      |
| 8  | PreviousAppealRangeMin      | decimal (3, 2) | No (0)   | '0.5'         | No (0)      |
| 9  | PreviousAppealRangeMax      | decimal (3, 2) | No (0)   | '0.8'         | No (0)      |
| 10 | ContractAcceptanceThreshold | decimal (3, 2) | No (0)   | '0.7'         | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                     | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../../team/Teams.md)                         | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_GameData](../data/Staff_GameData.md) | StaffID      | StaffID        | RESTRICT  | CASCADE   | NONE       |