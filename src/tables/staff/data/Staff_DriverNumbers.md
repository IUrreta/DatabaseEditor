Staff_DriverNumbers table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type | Not Null | Default Value | Primary Key |
|----|---------------|-----------|----------|---------------|-------------|
| 0  | Number        | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | CurrentHolder | INTEGER   | No (0)   | 'NULL'        | No (0)      |

[Foreign Key Details](../../foreignKeyDetails.md)

| ID | Seq | Foreign Table                           | Local Column  | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------|---------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_DriverData](Staff_DriverData.md) | CurrentHolder | StaffID        | NO ACTION | SET NULL  | NONE       |

----------------------------------------------------------

FKs this table points to

| ID | Seq | Foreign Table                              | Local Column | Foreign Column        |
|----|-----|--------------------------------------------|--------------|-----------------------|
| 0  | 0   | [Staff_DriverData](Staff_DriverData.md)    | Number       | LastKnownDriverNumber | 
| 1  | 0   | [Staff_DriverData](../Staff_DriverData.md) | Number       | LastKnownDriverNumber | 
