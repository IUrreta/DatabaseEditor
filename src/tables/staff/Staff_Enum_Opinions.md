Staff_Enum_Opinions table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | Value | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name  | TEXT      | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                   | Local Column | Foreign Column                   | 
|----|-----|-------------------------------------------------|--------------|----------------------------------|
| 0  | 0   | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | BreakoutClauseOpinion            |
| 0  | 1   | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | StartingBonusOpinion             |
| 0  | 2   | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | SalaryOpinion                    |
| 0  | 3   | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | RaceBonusTargetPosOpinion        |
| 0  | 4   | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | RaceBonusOpinion                 |
| 0  | 5   | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | PosInTeamOpinion                 |
| 0  | 6   | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | LengthOpinion                    |
| 0  | 7   | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | OfferDeadlineOpinion             |
| 0  | 8   | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | AffiliateDualRoleClauseOpinion   |
| 0  | 9   | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | AffiliatePendingF1RacePosOpinion |
| 0  | 10  | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | AffiliateCountOpinion            |
| 0  | 11  | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | AffiliateAgeOpinion              |
| 0  | 12  | [Staff_ContractOffers](Staff_ContractOffers.md) | Value        | StartDateTypeOpinion             |
