Save_Strategist_LapHistory table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name               | Data Type      | Not Null | Default Value | Primary Key |
|----|--------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex           | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Lap                | INTEGER        | Yes (1)  | null          | Order 2 (2) |
| 2  | RaceTime           | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | FuelLoadLaps       | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | ERSCharge          | INTEGER        | Yes (1)  | null          | No (0)      |
| 5  | ERSDamageState     | INTEGER        | Yes (1)  | null          | No (0)      |
| 6  | ERSWear            | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | GearboxDamageState | INTEGER        | Yes (1)  | null          | No (0)      |
| 8  | GearboxWear        | INTEGER        | Yes (1)  | null          | No (0)      |
| 9  | EngineTemp         | INTEGER        | Yes (1)  | null          | No (0)      |
| 10 | EngineDamageState  | INTEGER        | Yes (1)  | null          | No (0)      |
| 11 | EngineWear         | INTEGER        | Yes (1)  | null          | No (0)      |
| 12 | TyreTemp           | INTEGER        | Yes (1)  | null          | No (0)      |
| 13 | TyreWear           | INTEGER        | Yes (1)  | null          | No (0)      |
| 14 | TyreSetID          | INTEGER        | Yes (1)  | null          | No (0)      |
| 15 | LapType            | INTEGER        | Yes (1)  | null          | No (0)      |
| 16 | LapState           | INTEGER        | Yes (1)  | null          | No (0)      |
| 17 | RacePosition       | INTEGER        | Yes (1)  | null          | No (0)      |
| 18 | LapEventFlag       | INTEGER        | Yes (1)  | null          | No (0)      |
| 19 | TimeDeltaFromLead  | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 20 | DriverInFrontID    | INTEGER        | Yes (1)  | null          | No (0)      |
| 21 | DriverInFrontGap   | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 22 | DriverBehindID     | INTEGER        | Yes (1)  | null          | No (0)      |
| 23 | DriverBehindGap    | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 24 | IsValid            | BOOLEAN        | Yes (1)  | '1'           | No (0)      |
| 25 | EngineFaultState   | INTEGER        | Yes (1)  | null          | No (0)      |
| 26 | GearboxFaultState  | INTEGER        | Yes (1)  | null          | No (0)      |
| 27 | ERSFaultState      | INTEGER        | Yes (1)  | null          | No (0)      |
| 28 | EngineFaultType    | INTEGER        | Yes (1)  | null          | No (0)      |
| 29 | GearboxFaultType   | INTEGER        | Yes (1)  | null          | No (0)      |
| 30 | ERSFaultType       | INTEGER        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 