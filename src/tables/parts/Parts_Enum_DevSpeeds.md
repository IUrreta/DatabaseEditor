Parts_Enum_DevSpeeds table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name            | Data Type    | Not Null | Default Value | Primary Key |
|----|-----------------|--------------|----------|---------------|-------------|
| 0  | Value           | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | Name            | TEXT         | Yes (1)  | null          | No (0)      |
| 2  | SpeedMultiplier | decimal(4,2) | Yes (1)  | null          | No (0)      |
| 3  | CostMultiplier  | decimal(4,2) | Yes (1)  | null          | No (0)      |
| 4  | ExpertisePerDay | decimal(4,2) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                       | Local Column | Foreign Column   | 
|----|-----|-------------------------------------|--------------|------------------|
| 0  | 0   | [Parts_Designs](Parts_Designs.md)   | Value        | DesignSpeed      |
| 1  | 0   | [Parts_Projects](Parts_Projects.md) | Value        | ManufactureSpeed |
