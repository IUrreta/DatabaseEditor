Staff_GameData table

[Column Guide](../columnFlagsGuide.md)

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

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                 | Local Column    | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------------------------------------|-----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_StaffType](Staff_Enum_StaffType.md)               | StaffType       | StaffType      | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Staff_Enum_DevelopmentPlans](Staff_Enum_DevelopmentPlans.md) | DevelopmentPlan | Value          | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Staff_BasicData](Staff_BasicData.md)                         | StaffID         | StaffID        | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                           | Local Column | Foreign Column |
|----|-----|-----------------------------------------|--------------|----------------|
| 0  | 0   | [Staff_DriverData](Staff_DriverData.md) | StaffID      | StaffID        |
| 0  | 0   | [Staff_Contracts](Staff_Contracts.md)   | StaffID      | StaffID        |