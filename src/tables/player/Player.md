Player table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                        | Data Type | Not Null | Default Value | Primary Key |
|----|-----------------------------|-----------|----------|---------------|-------------|
| 0  | FirstName                   | TEXT      | Yes (1)  | null          | Yes (1)     |
| 1  | LastName                    | TEXT      | Yes (1)  | null          | Order 2 (2) |
| 2  | TeamID                      | INTEGER   | No (0)   | 'NULL'        | No (0)      |
| 3  | UniqueSeed                  | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 4  | FirstGameDay                | INTEGER   | No (0)   | null          | No (0)      |
| 5  | TeamPrincipalRating         | INTEGER   | No (0)   | null          | No (0)      |
| 6  | PreviousTeamPrincipalRating | INTEGER   | No (0)   | null          | No (0)      |
| 7  | CustomTeamEnabled           | INTEGER   | Yes (1)  | '0'           | No (0)      |
| 8  | CustomTeamLogoBase64        | TEXT      | No (0)   | null          | No (0)      |
| 9  | CustomTeamCarLiveryBase64   | TEXT      | No (0)   | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table             | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Teams](../team/Teams.md) | TeamID       | TeamID         | NO ACTION | NO ACTION | NONE       |