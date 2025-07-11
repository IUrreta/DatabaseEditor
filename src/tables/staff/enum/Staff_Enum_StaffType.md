Staff_Enum_StaffType table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                    | Data Type      | Not Null | Default Value | Primary Key |
|----|-------------------------|----------------|----------|---------------|-------------|
| 0  | StaffType               | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Name                    | TEXT           | Yes (1)  | null          | No (0)      |
| 2  | MinStartingAge          | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | MaxStartingAge          | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | MinRetirementAge        | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | MaxRetirementAge        | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | ProportionMale          | decimal (4, 3) | Yes (1)  | '0.5'         | No (0)      |
| 7  | BaseSalary              | INTEGER        | Yes (1)  | '30000'       | No (0)      |
| 8  | MaxNumPermaTraits       | INTEGER        | Yes (1)  | null          | No (0)      |
| 9  | FirstAbilityPtThreshold | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | LastAbilityPtThreshold  | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | AbilityPtCurve          | decimal (6, 3) | Yes (1)  | null          | No (0)      |
| 12 | MaxIdealSalary          | INTEGER        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                                                                         | Local Column | Foreign Column |
|----|-----|-------------------------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Staff_GameData](../data/Staff_GameData.md)                                                              | StaffType    | StaffType      |
| 1  | 0   | [Staff_Enum_DevelopmentPlans](Staff_Enum_DevelopmentPlans.md)                                         | StaffType    | StaffType      |
| 2  | 0   | [Staff_StaffTypePerformanceStatsTemplate](../Staff_StaffTypePerformanceStatsTemplate.md)                 | StaffType    | StaffType      |
| 3  | 0   | [Staff_Traits_Seeding](../traits/Staff_Traits_Seeding.md)                                                       | StaffType    | StaffType      |
| 4  | 0   | [Teams_PriorityList_Setting_DevelopStaffData](../../team/prioritylist/Teams_PriorityList_Setting_DevelopStaffData.md) | StaffType    | StaffType      |
| 5  | 0   | [Parts_Designs_StaffEffects](../../parts/design/Parts_Designs_StaffEffects.md)                                  | StaffType    | StaffType      |
