Staff_Enum_RivalryEventTypes table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                | Data Type    | Not Null | Default Value | Primary Key |
|----|---------------------|--------------|----------|---------------|-------------|
| 0  | Value               | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | Name                | TEXT         | Yes (1)  | null          | No (0)      |
| 2  | DefaultRivalryScore | decimal(6,2) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 

FKs this table points to

| ID | Seq | Foreign Table                                                                                 | Local Column | Foreign Column   | 
|----|-----|-----------------------------------------------------------------------------------------------|--------------|------------------|
| 0  | 0   | [Scouting_Staff_DriverRivalryEventLogs](../../scouting/staff/Scouting_Staff_DriverRivalryEventLogs.md) | Value        | RivalryEventType |
| 1  | 0   | [Staff_DriverRivalryEventLogs](../driver/Staff_DriverRivalryEventLogs.md)                               | Value        | RivalryEventType |
