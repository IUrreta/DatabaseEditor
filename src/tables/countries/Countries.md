Countries table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type      | Not Null | Default Value | Primary Key |
|----|-------------------|----------------|----------|---------------|-------------|
| 0  | CountryID         | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Name              | TEXT           | Yes (1)  | null          | No (0)      |
| 2  | NationalityWeight | decimal (4, 3) | Yes (1)  | '0.01'        | No (0)      |
| 3  | StaffNameLocale   | INTEGER        | Yes (1)  | null          | No (0)      |
| 4  | Population        | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 5  | EnumName          | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | MarketAppetite    | INTEGER        | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                     | Local Column    | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------------|-----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_NameLocales](../staff/data/Staff_Enum_NameLocales.md) | StaffNameLocale | Value          | NO ACTION | NO ACTION | NONE       |

----------------------------------------------------------

FKs this table points to

| ID | Seq | Foreign Table                                       | Local Column | Foreign Column |
|----|-----|-----------------------------------------------------|--------------|----------------|
| 0  | 0   | [Races_Tracks](../race/Races_Tracks.md)             | CountryID    | CountryID      | 
| 1  | 0   | [Staff_BasicData](../staff/data/Staff_BasicData.md) | CountryID    | CountryID      | 
| 2  | 0   | [Countries_RaceRecord](Countries_RaceRecord.md)     | CountryID    | CountryID      | 
