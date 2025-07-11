Parts_Items table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name              | Data Type      | Not Null | Default Value | Primary Key |
|----|-------------------|----------------|----------|---------------|-------------|
| 0  | ItemID            | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | DesignID          | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | BuildWork         | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 3  | Condition         | decimal (7, 6) | Yes (1)  | '1.0'         | No (0)      |
| 4  | ManufactureNumber | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 5  | ProjectID         | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 6  | AssociatedCar     | INTEGER        | No (0)   | 'NULL'        | No (0)      |
| 7  | InspectionState   | INTEGER        | Yes (1)  | '0'           | No (0)      |
| 8  | LastEquippedCar   | INTEGER        | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                               | Local Column    | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-------------------------------------------------------------|-----------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Projects](Parts_Projects.md)                         | ProjectID       | ProjectID      | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Parts_Designs](Parts_Designs.md)                           | DesignID        | DesignID       | NO ACTION | CASCADE   | NONE       |
| 2  | 0   | [Parts_Enum_InspectionState](Parts_Enum_InspectionState.md) | InspectionState | Value          | RESTRICT  | CASCADE   | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                               | Local Column | Foreign Column | 
|----|-----|---------------------------------------------|--------------|----------------|
| 0  | 0   | [Parts_CarLoadout](Parts_CarLoadout.md)     | ItemID       | ItemID         |
| 1  | 0   | [Parts_Items_Faults](Parts_Items_Faults.md) | ItemID       | ItemID         |
