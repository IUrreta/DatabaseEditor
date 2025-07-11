Parts_Designs table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                                 | Data Type    | Not Null | Default Value | Primary Key |
|----|--------------------------------------|--------------|----------|---------------|-------------|
| 0  | DesignID                             | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | PartType                             | INTEGER      | Yes (1)  | null          | No (0)      |
| 2  | DesignWork                           | INTEGER      | Yes (1)  | '0'           | No (0)      |
| 3  | DesignWorkMax                        | INTEGER      | Yes (1)  | '10000'       | No (0)      |
| 4  | DayCreated                           | INTEGER      | Yes (1)  | '-1'          | No (0)      |
| 5  | DayCompleted                         | INTEGER      | Yes (1)  | '-1'          | No (0)      |
| 6  | ChiefDesignerID                      | INTEGER      | No (0)   | 'NULL'        | No (0)      |
| 7  | WindTunnelTime                       | INTEGER      | Yes (1)  | '0'           | No (0)      |
| 8  | CFD                                  | INTEGER      | Yes (1)  | '0'           | No (0)      |
| 9  | DesignCost                           | INTEGER      | Yes (1)  | '1000000'     | No (0)      |
| 10 | BuildCost                            | bigint(20)   | Yes (1)  | '1000000'     | No (0)      |
| 11 | BuildWorkMax                         | INTEGER      | Yes (1)  | '2000'        | No (0)      |
| 12 | ValidFrom                            | INTEGER      | Yes (1)  | '2022'        | No (0)      |
| 13 | DesignSpeed                          | INTEGER      | Yes (1)  | '0'           | No (0)      |
| 14 | PartKnowledge                        | decimal(8,2) | Yes (1)  | '0.00'        | No (0)      |
| 15 | ManufactureCount                     | INTEGER      | Yes (1)  | '0'           | No (0)      |
| 16 | DesignNumber                         | INTEGER      | Yes (1)  | '0'           | No (0)      |
| 17 | DesignType                           | INTEGER      | Yes (1)  | '1'           | No (0)      |
| 18 | TeamID                               | INTEGER      | Yes (1)  | null          | No (0)      |
| 19 | LastCompletedProjectManufactureCount | INTEGER      | Yes (1)  | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                       | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Parts_Enum_Type](Parts_Enum_Type.md)               | PartType     | Value          | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Parts_Enum_DevSpeeds](Parts_Enum_DevSpeeds.md)     | DesignSpeed  | Value          | NO ACTION | NO ACTION | NONE       |
| 2  | 0   | [Teams](../team/Teams.md)                           | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |
| 3  | 0   | [Parts_Enum_DesignTypes](Parts_Enum_DesignTypes.md) | DesignType   | Value          | NO ACTION | NO ACTION | NONE       |

FKs this table points to

| ID | Seq | Foreign Table                                           | Local Column | Foreign Column | 
|----|-----|---------------------------------------------------------|--------------|----------------|
| 0  | 0   | [Parts_DesignHistoryData](Parts_DesignHistoryData.md)   | DesignID     | DesignID       |
| 1  | 0   | [Parts_Projects](Parts_Projects.md)                     | DesignID     | DesignID       |
| 2  | 0   | [Parts_Designs_StatValues](Parts_Designs_StatValues.md) | DesignID     | DesignID       |
| 3  | 0   | [Parts_CarLoadout](Parts_CarLoadout.md)                 | DesignID     | DesignID       |
| 4  | 0   | [Parts_Items](Parts_Items.md)                           | DesignID     | DesignID       |
