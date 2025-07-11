Staff_BasicData table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                     | Data Type | Not Null | Default Value  | Primary Key |
|----|--------------------------|-----------|----------|----------------|-------------|
| 0  | StaffID                  | INTEGER   | Yes (1)  | null           | Yes (1)     |
| 1  | FirstName                | TEXT      | Yes (1)  | ''FIRST_NAME'' | No (0)      |
| 2  | LastName                 | TEXT      | Yes (1)  | ''LAST_NAME''  | No (0)      |
| 3  | CountryID                | INTEGER   | Yes (1)  | '1'            | No (0)      |
| 4  | DOB                      | INTEGER   | Yes (1)  | '0'            | No (0)      |
| 5  | DOB_ISO                  | DATE      | No (0)   | ''1970-01-01'' | No (0)      |
| 6  | Gender                   | INTEGER   | Yes (1)  | '0'            | No (0)      |
| 7  | IsGeneratedStaff         | INTEGER   | Yes (1)  | '1'            | No (0)      |
| 8  | PhotoDay                 | INTEGER   | No (0)   | null           | No (0)      |
| 9  | FaceType                 | INTEGER   | No (0)   | null           | No (0)      |
| 10 | FaceIndex                | INTEGER   | No (0)   | null           | No (0)      |
| 11 | AgeType                  | INTEGER   | No (0)   | null           | No (0)      |
| 12 | IsGeneratedForCustomTeam | INTEGER   | Yes (1)  | '0'            | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_Gender](Staff_Enum_Gender.md) | Gender       | Value          | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Countries](../countries/Countries.md)           | CountryID    | CountryID      | RESTRICT  | RESTRICT  | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                                                                | Local Column | Foreign Column |
|----|-----|----------------------------------------------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Staff_GameData](Staff_GameData.md)                                                          | StaffID      | StaffID        |
| 1  | 0   | [Staff_NarrativeData](Staff_NarrativeData.md)                                             | StaffID      | StaffID        |
| 2  | 0   | [Staff_Team_CAS](Staff_Team_CAS.md)                                                       | StaffID      | StaffID        |
| 3  | 0   | [Staff_DriverFocus](Staff_DriverFocus.md)                                                 | StaffID      | StaffID        |
| 4  | 0   | [Onboarding_Tutorial_Enum_Sequences](../onboarding/tutorial/enum/Onboarding_Tutorial_Enum_Sequences.md) | StaffID      | StaffID        |
