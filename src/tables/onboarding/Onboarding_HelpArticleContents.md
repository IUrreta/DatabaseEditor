Onboarding_HelpArticleContents table

[Column Guide](../columnFlagsGuide.md)

Column Information:

| ID | Name          | Data Type | Not Null | Default Value | Primary Key |
|----|---------------|-----------|----------|---------------|-------------|
| 0  | HelpContentID | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | HelpArticleID | INTEGER   | Yes (1)  | null          | No (0)      |
| 2  | Name          | TEXT      | Yes (1)  | null          | No (0)      |

[Foreign Key Details](../foreignKeyDetails.md)

| ID | Seq | Foreign Table                                                   | Local Column  | Foreign Column | On Update | On Delete | Match Type |
|----|-----|-----------------------------------------------------------------|---------------|----------------|-----------|-----------|------------|
| 0  | 0   | [Onboarding_Enum_HelpArticles](Onboarding_Enum_HelpArticles.md) | HelpArticleID | HelpArticleID  | NO ACTION | NO ACTION | NONE       |