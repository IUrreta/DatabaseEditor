Teams_Custom_LiveryDecals table

[Column Guide](../../columnFlagsGuide.md)

Column Information:

| ID | Name                | Data Type | Not Null | Default Value | Primary Key |
|----|---------------------|-----------|----------|---------------|-------------|
| 0  | LiveryType          | INTEGER   | Yes (1)  | null          | No (0)      |
| 1  | SlotSponsorType     | INTEGER   | No (0)   | '0'           | No (0)      |
| 2  | Key                 | TEXT      | No (0)   | ''''          | No (0)      |
| 3  | AdjustmentPositionX | REAL      | No (0)   | '0'           | No (0)      |
| 4  | AdjustmentPositionY | REAL      | No (0)   | '0'           | No (0)      |
| 5  | AdjustmentRotation  | REAL      | No (0)   | '0'           | No (0)      |
| 6  | AdjustmentScale     | REAL      | No (0)   | '0'           | No (0)      |
| 7  | DecalType           | INTEGER   | No (0)   | '0'           | No (0)      |
| 8  | TeamLogoIndex       | INTEGER   | No (0)   | '0'           | No (0)      |
| 9  | SponsorID           | TEXT      | No (0)   | ''''          | No (0)      |
| 10 | SlotSponsorLogoType | INTEGER   | No (0)   | '0'           | No (0)      |
| 11 | TintColour          | INTEGER   | No (0)   | '0'           | No (0)      |
| 12 | Visible             | INTEGER   | No (0)   | '1'           | No (0)      |

Table has no FKs that point to it. 