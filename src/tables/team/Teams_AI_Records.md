Teams_AI_Records table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name                            | Data Type | Not Null | Default Value | Primary Key |
|----|---------------------------------|-----------|----------|---------------|-------------|
| 0  | TeamID                          | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | SeasonID                        | INTEGER   | Yes (1)  | null          | Order 2 (2) |
| 2  | PoachingAttempts                | INTEGER   | No (0)   | '0'           | No (0)      |
| 3  | SuccessfulPoachingAttempts      | INTEGER   | No (0)   | '0'           | No (0)      |
| 4  | SponsorSelectionDay             | INTEGER   | No (0)   | '0'           | No (0)      |
| 5  | LastDecisionEvaluationDay       | INTEGER   | No (0)   | '0'           | No (0)      |
| 6  | TotalDesignProjectsThisPeriod   | INTEGER   | No (0)   | '0'           | No (0)      |
| 7  | TotalResearchProjectsThisPeriod | INTEGER   | No (0)   | '0'           | No (0)      |
| 8  | TotalIntenseDesignsThisPeriod   | INTEGER   | No (0)   | '0'           | No (0)      |
| 9  | TotalIntenseDesigns             | INTEGER   | No (0)   | '0'           | No (0)      |
| 10 | HasCastRegulationVote           | INTEGER   | No (0)   | '0'           | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                   | Local Column | Foreign Column | On Update | On Delete | Match Type |
|----|-----|---------------------------------|--------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Seasons](../season/Seasons.md) | SeasonID     | SeasonID       | RESTRICT  | CASCADE   | NONE       |
| 1  | 0   | [Teams](../team/Teams.md)       | TeamID       | TeamID         | RESTRICT  | CASCADE   | NONE       |