Buildings table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                 | Data Type     | Not Null | Default Value | Primary Key |
|----|----------------------|---------------|----------|---------------|-------------|
| 0  | BuildingID           | INTEGER       | Yes (1)  | null          | Yes (1)     |
| 1  | Type                 | INTEGER       | Yes (1)  | null          | No (0)      |
| 2  | Name                 | TEXT          | Yes (1)  | null          | No (0)      |
| 3  | UpgradeLevel         | INTEGER       | Yes (1)  | '0'           | No (0)      |
| 4  | UpkeepCost           | bigint(20)    | Yes (1)  | '0'           | No (0)      |
| 5  | UpkeepAffectsCostCap | INTEGER       | No (0)   | '0'           | No (0)      |
| 6  | ConstructionCost     | bigint(20)    | Yes (1)  | '0'           | No (0)      |
| 7  | ConstructionWork     | INTEGER       | Yes (1)  | '0'           | No (0)      |
| 8  | RefurbishCost        | bigint(20)    | Yes (1)  | '0'           | No (0)      |
| 9  | RefurbishWork        | INTEGER       | Yes (1)  | '0'           | No (0)      |
| 10 | RequiredType         | INTEGER       | No (0)   | 'NULL'        | No (0)      |
| 11 | RequiredLevel        | INTEGER       | No (0)   | 'NULL'        | No (0)      |
| 12 | DegradationSpeed     | decimal(10,5) | Yes (1)  | '0.00050'     | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                 | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Building_Enum_Types](Building_Enum_Types.md) | Type         | Type           | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Building_Enum_Types](Building_Enum_Types.md) | RequiredType | Type           | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                       | Local Column | Foreign Column | 
|----|-----|-----------------------------------------------------|--------------|----------------|
| 0  | 0   | [Buildings_Effects](./effects/Buildings_Effects.md) | BuildingID   | BuildingID     |
| 1  | 0   | [Buildings_HQ](Buildings_HQ.md)                     | BuildingID   | BuildingID     |
| 2  | 0   | [Buildings_HQ_History](Buildings_HQ_History.md)     | BuildingID   | BuildingID     |
