Save_RaceSimCars_Parts table

[Column Guide](../../../columnFlagsGuide.md)

Column Information:

| ID | Name                    | Data Type      | Not Null | Default Value | Primary Key |
|----|-------------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex                | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | Tyre1SurfaceTemperature | DECIMAL (6, 3) | No (0)   | null          | No (0)      |
| 2  | Tyre1CarcassTemperature | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | Tyre1Condition          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | Tyre2SurfaceTemperature | DECIMAL (6, 3) | No (0)   | null          | No (0)      |
| 5  | Tyre2CarcassTemperature | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | Tyre2Condition          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 7  | Tyre3SurfaceTemperature | DECIMAL (6, 3) | No (0)   | null          | No (0)      |
| 8  | Tyre3CarcassTemperature | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 9  | Tyre3Condition          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 10 | Tyre4SurfaceTemperature | DECIMAL (6, 3) | No (0)   | null          | No (0)      |
| 11 | Tyre4CarcassTemperature | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 12 | Tyre4Condition          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 13 | BodyDamageLevel         | INTEGER        | Yes (1)  | null          | No (0)      |
| 14 | FrontWingDamageLevel    | INTEGER        | Yes (1)  | null          | No (0)      |
| 15 | RearWingDamageLevel     | INTEGER        | Yes (1)  | null          | No (0)      |
| 16 | SidePodsDamageLevel     | INTEGER        | Yes (1)  | null          | No (0)      |
| 17 | FloorDamageLevel        | INTEGER        | Yes (1)  | null          | No (0)      |
| 18 | SuspensionDamageLevel   | INTEGER        | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 