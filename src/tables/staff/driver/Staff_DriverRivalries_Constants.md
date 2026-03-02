Staff_DriverRivalries_Constants table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                                         | Data Type      | Not Null | Default Value | Primary Key |
|----|----------------------------------------------|----------------|----------|---------------|-------------|
| 0  | WeeklyDecrease                               | INTEGER        | Yes (1)  | null          | Yes (1)     |
| 1  | RacePosDeltaNeededToOutshine                 | INTEGER        | Yes (1)  | null          | No (0)      |
| 2  | MaxChampionshipPtsDeltaForRivalry            | INTEGER        | Yes (1)  | null          | No (0)      |
| 3  | MaxRaceTimeDeltaForRivalry                   | decimal (4, 1) | Yes (1)  | null          | No (0)      |
| 4  | PtsMultiplier_PreExistingRivalry             | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 5  | PtsMultiplier_Teammates                      | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 6  | PtsMultiplier_RepeatEvent                    | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 7  | PtsMultiplier_EarlyInSeason                  | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 8  | PtsMultiplier_YoungerRival                   | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 9  | PtsMultiplier_LessSkilledRival               | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 10 | PtsMultiplier_SubordinateTeammate            | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 11 | PtsMultiplier_BothNearTopOfStandings         | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 12 | CloseOnStandingPts_MaxDelta                  | decimal (5, 1) | Yes (1)  | null          | No (0)      |
| 13 | PtsMultiplier_CloseOnStandingPts_AtZeroDelta | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 14 | PtsMultiplier_CloseOnStandingPts_AtMaxDelta  | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 15 | FarOnStandingPts_MinDelta                    | decimal (5, 1) | Yes (1)  | null          | No (0)      |
| 16 | FarOnStandingPts_MaxDelta                    | decimal (5, 1) | Yes (1)  | null          | No (0)      |
| 17 | PtsMultiplier_FarOnStandingPts_AtMinDelta    | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 18 | PtsMultiplier_FarOnStandingPts_AtMaxDelta    | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 19 | SmallRacePosGap_MaxDelta                     | INTEGER        | Yes (1)  | null          | No (0)      |
| 20 | PtsMultiplier_SmallRacePosGap_AtZeroDelta    | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 21 | PtsMultiplier_SmallRacePosGap_AtMaxDelta     | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 22 | LargeRacePosGap_MinDelta                     | INTEGER        | Yes (1)  | null          | No (0)      |
| 23 | LargeRacePosGap_MaxDelta                     | INTEGER        | Yes (1)  | null          | No (0)      |
| 24 | PtsMultiplier_LargeRacePosGap_AtMinDelta     | decimal (5, 3) | Yes (1)  | null          | No (0)      |
| 25 | PtsMultiplier_LargeRacePosGap_AtMaxDelta     | decimal (5, 3) | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it. 