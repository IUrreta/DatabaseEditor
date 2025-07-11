Save_RaceSimCars_Misc table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                              | Data Type      | Not Null | Default Value | Primary Key |
|----|-----------------------------------|----------------|----------|---------------|-------------|
| 0  | CarIndex                          | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | TyreWarmupStartSimTime            | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 2  | TyreWarmupDuration                | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 3  | TyreWarmupWarmingOffset           | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 4  | TyreWarmupCooldown                | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 5  | TyreWarmupProgress                | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 6  | QualifyingRunFastLapCount         | INTEGER        | Yes (1)  | null          | No (0)      |
| 7  | QualifyingRunIncludeCooldownLaps  | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 8  | QualifyingRunAdditionalLapsOfFuel | INTEGER        | Yes (1)  | null          | No (0)      |
| 9  | QualifyingRunAutomaticMode        | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 10 | QualifyingRunRunComplete          | BOOLEAN        | Yes (1)  | null          | No (0)      |
| 11 | QualifyingRunStartLap             | INTEGER        | Yes (1)  | null          | No (0)      |
| 12 | ErsState                          | INTEGER        | Yes (1)  | null          | No (0)      |
| 13 | ErsBatteryCharge                  | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 14 | ErsLastLap                        | INTEGER        | Yes (1)  | null          | No (0)      |
| 15 | ErsChargeAmountCurrentLap         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 16 | ErsDeployAmountCurrentLap         | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |
| 17 | ErsDeploySavedCurrentLap          | DECIMAL (6, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 