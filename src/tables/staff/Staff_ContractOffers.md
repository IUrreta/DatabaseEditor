Staff_ContractOffers table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                                  | Data Type      | Not Null | Default Value                | Primary Key |
|----|---------------------------------------|----------------|----------|------------------------------|-------------|
| 0  | StaffID                               | INTEGER        | Yes (1)  | null                         | Yes (1)     |
| 1  | OfferType                             | INTEGER        | Yes (1)  | '0'                          | Order 2 (2) |
| 2  | ContractState                         | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 3  | OfferDay                              | INTEGER        | Yes (1)  | '0'                          | No (0)      |
| 4  | PatienceWhenOffered                   | DECIMAL (3, 2) | Yes (1)  | '1.0'                        | No (0)      |
| 5  | TeamID                                | INTEGER        | Yes (1)  | null                         | Order 3 (3) |
| 6  | PosInTeam                             | INTEGER        | Yes (1)  | null                         | No (0)      |
| 7  | PosInTeamOpinionScore                 | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 8  | PosInTeamOpinion                      | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 9  | PosInTeamOpinionStr                   | TEXT           | Yes (1)  | ''[OPINION_STRING_NEUTRAL]'' | No (0)      |
| 10 | StartDay                              | INTEGER        | Yes (1)  | '43831'                      | No (0)      |
| 11 | EndSeason                             | INTEGER        | Yes (1)  | '2022'                       | No (0)      |
| 12 | LengthOpinionScore                    | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 13 | LengthOpinion                         | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 14 | LengthOpinionStr                      | TEXT           | Yes (1)  | ''[OPINION_STRING_NEUTRAL]'' | No (0)      |
| 15 | Salary                                | INTEGER        | Yes (1)  | '100000'                     | No (0)      |
| 16 | SalaryOpinionScore                    | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 17 | SalaryOpinion                         | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 18 | SalaryOpinionStr                      | TEXT           | Yes (1)  | ''[OPINION_STRING_NEUTRAL]'' | No (0)      |
| 19 | StartingBonus                         | INTEGER        | Yes (1)  | '0'                          | No (0)      |
| 20 | StartingBonusOpinionScore             | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 21 | StartingBonusOpinion                  | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 22 | StartingBonusOpinionStr               | TEXT           | Yes (1)  | ''[OPINION_STRING_NEUTRAL]'' | No (0)      |
| 23 | RaceBonus                             | INTEGER        | Yes (1)  | '0'                          | No (0)      |
| 24 | RaceBonusOpinionScore                 | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 25 | RaceBonusOpinion                      | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 26 | RaceBonusOpinionStr                   | TEXT           | Yes (1)  | ''[OPINION_STRING_NEUTRAL]'' | No (0)      |
| 27 | RaceBonusTargetPos                    | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 28 | RaceBonusTargetPosOpinionScore        | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 29 | RaceBonusTargetPosOpinion             | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 30 | RaceBonusTargetPosOpinionStr          | TEXT           | Yes (1)  | ''[OPINION_STRING_NEUTRAL]'' | No (0)      |
| 31 | BreakoutClause                        | DECIMAL (3, 2) | Yes (1)  | '0'                          | No (0)      |
| 32 | BreakoutClauseOpinionScore            | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 33 | BreakoutClauseOpinion                 | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 34 | BreakoutClauseOpinionStr              | TEXT           | Yes (1)  | 'OPINION_STRING_NEUTRAL'     | No (0)      |
| 35 | StartDateType                         | INTEGER        | Yes (1)  | '0'                          | No (0)      |
| 36 | StartDateTypeOpinionScore             | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 37 | StartDateTypeOpinion                  | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 38 | StartDateTypeOpinionStr               | TEXT           | Yes (1)  | ''[OPINION_STRING_NEUTRAL]'' | No (0)      |
| 39 | AffiliateAgeOpinionScore              | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 40 | AffiliateAgeOpinion                   | INTEGER        | No (0)   | '1'                          | No (0)      |
| 41 | AffiliateAgeOpinionStr                | TEXT           | Yes (1)  | 'OPINION_STRING_NEUTRAL'     | No (0)      |
| 42 | AffiliateCountOpinionScore            | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 43 | AffiliateCountOpinion                 | INTEGER        | No (0)   | '1'                          | No (0)      |
| 44 | AffiliateCountOpinionStr              | TEXT           | Yes (1)  | 'OPINION_STRING_NEUTRAL'     | No (0)      |
| 45 | AffiliatePendingF1RacePosOpinionScore | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 46 | AffiliatePendingF1RacePosOpinion      | INTEGER        | No (0)   | '1'                          | No (0)      |
| 47 | AffiliatePendingF1RacePosOpinionStr   | TEXT           | Yes (1)  | 'OPINION_STRING_NEUTRAL'     | No (0)      |
| 48 | AffiliateDualRoleClause               | INTEGER        | Yes (1)  | '0'                          | No (0)      |
| 49 | AffiliateDualRoleClauseOpinionScore   | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 50 | AffiliateDualRoleClauseOpinion        | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 51 | AffiliateDualRoleClauseOpinionStr     | TEXT           | Yes (1)  | 'OPINION_STRING_NEUTRAL'     | No (0)      |
| 52 | ExpirationDay                         | INTEGER        | Yes (1)  | '- 1'                        | No (0)      |
| 53 | OfferDeadlineOpinionScore             | decimal (3, 2) | Yes (1)  | '0.5'                        | No (0)      |
| 54 | OfferDeadlineOpinion                  | INTEGER        | Yes (1)  | '1'                          | No (0)      |
| 55 | OfferDeadlineOpinionStr               | TEXT           | Yes (1)  | 'OPINION_STRING_NEUTRAL'     | No (0)      |
| 56 | EstimatedResponseDay                  | INTEGER        | Yes (1)  | '- 1'                        | No (0)      |
| 57 | SatisfactionScore                     | DECIMAL (3, 2) | Yes (1)  | '- 1'                        | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                           | Local Column                     | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------------------|----------------------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | BreakoutClauseOpinion            | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_ContractOfferType](Staff_Enum_ContractOfferType.md)         | OfferType                        | Value          | RESTRICT  | CASCADE   | NONE       |
| 2  | 0   | [Staff_Enum_ContractState](Staff_Enum_ContractState.md)                 | ContractState                    | Value          | RESTRICT  | CASCADE   | NONE       |
| 3  | 0   | [Teams](../team/Teams.md)                                               | TeamID                           | TeamID         | RESTRICT  | CASCADE   | NONE       |
| 4  | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | StartingBonusOpinion             | Value          | RESTRICT  | CASCADE   | NONE       |
| 5  | 0   | [Staff_GameData](../staff/data/Staff_GameData.md)                       | StaffID                          | StaffID        | RESTRICT  | CASCADE   | NONE       |
| 6  | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | SalaryOpinion                    | Value          | RESTRICT  | CASCADE   | NONE       |
| 7  | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | RaceBonusTargetPosOpinion        | Value          | RESTRICT  | CASCADE   | NONE       |
| 8  | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | RaceBonusOpinion                 | Value          | RESTRICT  | CASCADE   | NONE       |
| 9  | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | PosInTeamOpinion                 | Value          | RESTRICT  | CASCADE   | NONE       |
| 10 | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | LengthOpinion                    | Value          | RESTRICT  | CASCADE   | NONE       |
| 11 | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | OfferDeadlineOpinion             | Value          | RESTRICT  | CASCADE   | NONE       |
| 12 | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | AffiliateDualRoleClauseOpinion   | Value          | RESTRICT  | CASCADE   | NONE       |
| 13 | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | AffiliatePendingF1RacePosOpinion | Value          | RESTRICT  | CASCADE   | NONE       |
| 14 | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | AffiliateCountOpinion            | Value          | RESTRICT  | CASCADE   | NONE       |
| 15 | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | AffiliateAgeOpinion              | Value          | RESTRICT  | CASCADE   | NONE       |
| 16 | 0   | [Staff_Enum_Opinions](Staff_Enum_Opinions)                              | StartDateTypeOpinion             | Value          | RESTRICT  | CASCADE   | NONE       |
| 17 | 0   | [Staff_Enum_ContractStartDateType](Staff_Enum_ContractStartDateType.md) | StartDateType                    | Value          | RESTRICT  | CASCADE   | NONE       |