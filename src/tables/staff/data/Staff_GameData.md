Staff_GameData table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                          | Data Type      | Not Null | Default Value | Primary Key |
|----|-------------------------------|----------------|----------|---------------|-------------|
| 0  | StaffID                       | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | StaffType                     | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 2  | RetirementAge                 | INTEGER        | Yes (1)  | '60'          | No (0)      |
| 3  | Retired                       | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 4  | PermaTraitSpawnBoost          | DECIMAL (6, 3) | Yes (1)  | '0'           | No (0)      |
| 5  | BestTeamFormula               | INTEGER        | No (0)   | null          | No (0)      |
| 6  | BestF1PosInTeamSinceGameStart | INTEGER        | No (0)   | null          | No (0)      |
| 7  | DevelopmentPlan               | INTEGER        | No (0)   | null          | No (0)      |
| 8  | ExpectedRankForTeam           | INTEGER        | Yes (1)  | '5'           | No (0)      |
| 9  | AchievementScore              | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 10 | ExpectedQualityScore          | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 11 | ExpectedTimeScore             | INTEGER        | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                    | Local Column    | Foreign Column | On Update | On Delete | Match Type |
|----|-----|------------------------------------------------------------------|-----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_StaffType](../enum/Staff_Enum_StaffType.md)               | StaffType       | StaffType      | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_DevelopmentPlans](../enum/Staff_Enum_DevelopmentPlans.md) | DevelopmentPlan | Value          | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Staff_BasicData](Staff_BasicData.md)                            | StaffID         | StaffID        | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                                                     | Local Column | Foreign Column |
|----|-----|-------------------------------------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Staff_DriverData](../driver/Staff_DriverData.md)                                                                      | StaffID      | StaffID        |
| 1  | 0   | [Staff_Contracts](../contract/Staff_Contracts.md)                                                                             | StaffID      | StaffID        |
| 2  | 0   | [Scouting_Staff_Bonuses](../../scouting/staff/Scouting_Staff_Bonuses.md)                                             | StaffID      | StaffID        |
| 3  | 0   | [Staff_PerformanceStats](../Staff_PerformanceStats.md)                                                               | StaffID      | StaffID        |
| 4  | 0   | [Scouting_Staff_PerformanceStats](../../scouting/staff/Scouting_Staff_PerformanceStats.md)                           | StaffID      | StaffID        |
| 5  | 0   | [Scouting_Staff_RaceEngineerDriverAssignments](../../scouting/staff/Scouting_Staff_RaceEngineerDriverAssignments.md) | StaffID      | RaceEngineerID |
| 6  | 0   | [Scouting_Staff_RaceEngineerDriverAssignments](../../scouting/staff/Scouting_Staff_RaceEngineerDriverAssignments.md) | StaffID      | DriverID       |
| 7  | 0   | [Staff_RaceEngineerDriverAssignments](../Staff_RaceEngineerDriverAssignments.md)                                     | StaffID      | RaceEngineerID |
| 8  | 0   | [Staff_Driver_Achievements](../driver/Staff_Driver_Achievements.md)                                                         | StaffID      | StaffID        |
| 9  | 0   | [Scouting_Staff_Traits](../../scouting/staff/Scouting_Staff_Traits.md)                                               | StaffID      | StaffID        |
| 10 | 0   | [Staff_Traits](../traits/Staff_Traits.md)                                                                                   | StaffID      | StaffID        |
| 11 | 0   | [Staff_PerformanceStats_StartOfMonth](../Staff_PerformanceStats_StartOfMonth.md)                                     | StaffID      | StaffID        |
| 12 | 0   | [Staff_CareerHistory](../Staff_CareerHistory.md)                                                                     | StaffID      | StaffID        |
| 13 | 0   | [Scouting_Staff_Bookmark](../../scouting/staff/Scouting_Staff_Bookmark.md)                                           | StaffID      | StaffID        |
| 14 | 0   | [Staff_Team_CAS](../Staff_Team_CAS.md)                                                                               | StaffID      | StaffID        |
| 15 | 0   | [Staff_ContractPatience](../contract/Staff_ContractPatience.md)                                                               | StaffID      | StaffID        |
| 16 | 0   | [Scouting](../../scouting/Scouting.md)                                                                               | StaffID      | StaffID        |
| 17 | 0   | [Staff_ContractOffers](../contract/Staff_ContractOffers.md)                                                                   | StaffID      | StaffID        |
| 18 | 0   | [Staff_Contracts](../contract/Staff_Contracts.md)                                                                             | StaffID      | StaffID        |
| 19 | 0   | [Staff_DriverData](../driver/Staff_DriverData.md)                                                                    | StaffID      | StaffID        |
| 20 | 0   | [Staff_State](../Staff_State.md)                                                                                     | StaffID      | StaffID        |
| 21 | 0   | [Scouting_Staff_CommonData](../../scouting/staff/Scouting_Staff_CommonData.md)                                       | StaffID      | StaffID        |
| 22 | 0   | [Staff_Mentality_Statuses](../mentality/Staff_Mentality_Statuses.md)                                                           | StaffID      | StaffID        |
| 23 | 0   | [Staff_Mentality_AreaOpinions](../mentality/Staff_Mentality_AreaOpinions.md)                                                   | StaffID      | StaffID        |
| 24 | 0   | [Staff_Mentality_Events](../mentality/Staff_Mentality_Events.md)                                                               | StaffID      | StaffID        |
| 25 | 0   | [Staff_RaceRecord](../Staff_RaceRecord.md)                                                                           | StaffID      | StaffID        |
