Scouting_Staff_DriverRivalryEventLogs table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name             | Data Type    | Not Null | Default Value | Primary Key |
|----|------------------|--------------|----------|---------------|-------------|
| 0  | DriverID         | INTEGER      | Yes (1)  | null          | Yes (1)     |
| 1  | RivalryEventType | INTEGER      | Yes (1)  | null          | No (0)      |
| 2  | RivalID          | INTEGER      | Yes (1)  | null          | No (0)      |
| 3  | RivalryPoints    | decimal(6,2) | Yes (1)  | null          | No (0)      |
| 4  | TeamID           | INTEGER      | Yes (1)  | null          | No (0)      |
| 5  | DayScouted       | INTEGER      | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                            | Local Column     | Foreign Column | On Update | On Delete | Match Type |
|----|-----|--------------------------------------------------------------------------|------------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Staff_Enum_RivalryEventTypes](../staff/Staff_Enum_RivalryEventTypes.md) | RivalryEventType | Value          | NO ACTION | NO ACTION | NONE       |
| 1  | 0   | [Staff_DriverData](../staff/data/Staff_DriverData.md)                    | RivalID          | StaffID        | CASCADE   | CASCADE   | NONE       |
| 2  | 0   | [Staff_DriverData](../staff/data/Staff_DriverData.md)                    | DriverID         | StaffID        | CASCADE   | CASCADE   | NONE       |