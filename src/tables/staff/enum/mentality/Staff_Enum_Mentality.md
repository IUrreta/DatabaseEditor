Staff_Enum_Mentality table

[Column Guide](../../../columnFlagsGuide.md)

Column Information:

| ID | Name  | Data Type | Not Null | Default Value | Primary Key |
|----|-------|-----------|----------|---------------|-------------|
| 0  | Value | INTEGER   | Yes (1)  | null          | Yes (1)     |
| 1  | Name  | INTEGER   | Yes (1)  | null          | No (0)      |

Table has no FKs that point to it.

FKs this table points to

| ID | Seq | Foreign Table                                                   | Local Column | Foreign Column   | 
|----|-----|-----------------------------------------------------------------|--------------|------------------|
| 0  | 0   | [Staff_State](../../Staff_State.md)                                   | Value        | MentalityOpinion |
| 1  | 0   | [Staff_Mentality_Statuses](../../mentality/Staff_Mentality_Statuses.md)         | Value        | Opinion          |
| 2  | 0   | [Staff_Mentality_AreaOpinions](../../mentality/Staff_Mentality_AreaOpinions.md) | Value        | Opinion          |
| 3  | 0   | [Staff_Mentality_Events](../../mentality/Staff_Mentality_Events.md)             | Value        | Opinion          |
