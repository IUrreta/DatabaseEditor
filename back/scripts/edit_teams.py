import sqlite3

ers_dict = {
    "1": 2,
    "4": 5,
    "7": 8,
    "10": 11
}

gearbox_dict = {
    "1": 3,
    "4": 6,
    "7": 9,
    "10": 12
}

def fetch_teamData(teamID):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    levCon = cursor.execute(f"SELECT BuildingID, DegradationValue FROM Buildings_HQ WHERE TeamID = {teamID}").fetchall()
    data = [(x, round(y, 2)) for x, y in levCon]
    if teamID == "32":
        data.append(("160", 1))
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    days = cursor.execute(f"SELECT Min(Day), Max(Day) FROM Seasons_Deadlines WHERE SeasonID = {day_season[1]}").fetchone()
    costCap = cursor.execute(f"SELECT SUM(value) as Value FROM Finance_Transactions WHERE Day >= {days[0]} AND Day < {days[1]} AND AffectsCostCap = 1 AND TeamID = {teamID}").fetchall()
    teamBalance = cursor.execute(f"SELECT Balance FROM Finance_TeamBalance WHERE TeamID = {teamID}").fetchone()
    seasonObj = cursor.execute(f"SELECT TargetPos FROM Board_SeasonObjectives WHERE TeamID = {teamID} AND SeasonID = {day_season[1]}").fetchone()
    maxTargetYear = cursor.execute(f"SELECT MAX(TargetEndYear) FROM Board_Objectives WHERE TeamID = {teamID}").fetchone()
    longTermObj = cursor.execute(f"SELECT Type, TargetEndYear FROM Board_Objectives WHERE TeamID = {teamID} AND TargetEndYear = {maxTargetYear[0]}").fetchone()
    playerTeam = cursor.execute("SELECT TeamID FROM Player").fetchone()
    if playerTeam[0] == int(teamID):
        confidence = cursor.execute(f"SELECT Confidence FROM Board_Confidence WHERE Season = {day_season[1]}").fetchone()
    else:
        confidence = (-1,)
    pit_stats = cursor.execute(f"SELECT StatID, Val FROM Staff_PitCrew_PerformanceStats WHERE TeamID = {teamID}").fetchall()
    #convert pit_stats into a dictionary where statid is key and val is value
    pit_dict = {}
    for stat in pit_stats:
        pit_dict[stat[0]] = round(stat[1], 2)
    engine_manufacturer = cursor.execute(f"SELECT EngineManufacturer FROM Parts_TeamHistory WHERE TeamID = {teamID} AND SeasonID = {day_season[1]}").fetchone()
    engine_id = cursor.execute(f"SELECT EngineDesignID FROM Parts_Enum_EngineManufacturers WHERE Value = {engine_manufacturer[0]}").fetchone()
    data.extend([seasonObj, longTermObj, teamBalance, costCap, confidence, day_season[1], pit_dict, engine_id])

    conn.commit()
    conn.close()

    return data

def manage_cost_cap(teamID, amount, cursor):
    remaining = int(amount)
    if remaining > 0:
       
        while remaining > 0:
            transaction = cursor.execute("""
                SELECT ROWID, Value, Reference 
                FROM Finance_Transactions 
                WHERE TeamID = ? AND AffectsCostCap = 1  AND Value < 0
                ORDER BY Day DESC, ROWID DESC 
                LIMIT 1
            """, (teamID,)).fetchone()
            
            if transaction is None:
                break
            else:
                rowid = transaction[0]
                value = transaction[1]
                reference = transaction[2]
                
                if value + remaining <= 0:
                    amount_to_add = remaining
                else:
                    amount_to_add = -value
                
                cursor.execute("""
                    UPDATE Finance_Transactions 
                    SET Value = Value + ? 
                    WHERE ROWID = ?
                """, (amount_to_add, rowid))
                
                remaining -= amount_to_add
    else:
        day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        cursor.execute(f"INSERT INTO Finance_Transactions VALUES ({teamID}, {day_season[0]}, {amount}, 9, -1, 1)")

def edit_team(info):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    teamID = info["teamID"]
    for facility in info["facilities"]:
        id = facility[0][:-1]
        cursor.execute(f"UPDATE Buildings_HQ SET BuildingID = {facility[0]}, DegradationValue = {facility[1]} WHERE TeamID = {teamID} AND BuildingType = {id}")
    cursor.execute(f"UPDATE Board_SeasonObjectives SET TargetPos = {info['seasonObj']} WHERE TeamID = {teamID} AND SeasonID = {day_season[1]}")
    maxTargetYear = cursor.execute(f"SELECT MAX(TargetEndYear) FROM Board_Objectives WHERE TeamID = {teamID}").fetchone()
    cursor.execute(f"UPDATE Board_Objectives SET Type = {info['longTermObj']}, TargetEndYear = {info['longTermYear']} WHERE TeamID = {teamID} AND targetEndYear = {maxTargetYear[0]}")
    if info["confidence"] != "-1":
        cursor.execute(f"UPDATE Board_Confidence SET Confidence = {info['confidence']} WHERE Season = {day_season[1]}")
    cursor.execute(f"UPDATE Finance_TeamBalance SET Balance = {info['teamBudget']} WHERE TeamID = {teamID}")
    manage_cost_cap(teamID, info["costCapEdit"], cursor)
    for stat in info["pitCrew"]:
        cursor.execute(f"UPDATE Staff_PitCrew_PerformanceStats SET Val = {info['pitCrew'][stat]} WHERE TeamID = {teamID} AND StatID = {stat}")
    oldEngineID = cursor.execute(f"SELECT DesignID FROM Parts_Designs WHERE TeamID = {teamID}  AND PartType = 0").fetchone()
    oldERSID = cursor.execute(f"SELECT DesignID FROM Parts_Designs WHERE TeamID = {teamID}  AND PartType = 1").fetchone()
    oldGearboxID = cursor.execute(f"SELECT DesignID FROM Parts_Designs WHERE TeamID = {teamID}  AND PartType = 2").fetchone()
    newEngineID = info['engine']
    new_engine_manufacturer = cursor.execute(f"SELECT Value FROM Parts_Enum_EngineManufacturers WHERE EngineDesignID = {newEngineID}").fetchone()
    cursor.execute(f"UPDATE Parts_TeamHistory SET EngineManufacturer = {new_engine_manufacturer[0]} WHERE TeamID = {teamID} AND SeasonID = {day_season[1]}")
    newErsID = ers_dict[newEngineID]
    newGearboxID = gearbox_dict[newEngineID]
    engine_stats = cursor.execute(f"SELECT PartStat, UnitValue, Value FROM Parts_Designs_StatValues WHERE DesignID = {newEngineID}").fetchall()
    engine_stats_dict = {row[0]: [row[1], row[2]] for row in engine_stats}
    for stat in engine_stats_dict:
        cursor.execute(f"UPDATE Parts_Designs_StatValues SET UnitValue = {engine_stats_dict[stat][0]}, Value = {engine_stats_dict[stat][1]} WHERE PartStat = {stat} AND DesignID = {oldEngineID[0]}")
    ers_stats = cursor.execute(f"SELECT PartStat, UnitValue, Value FROM Parts_Designs_StatValues WHERE DesignID = {newErsID}").fetchall()
    ers_stats_dict = {row[0]: [row[1], row[2]] for row in ers_stats}
    for stat in ers_stats_dict:
        cursor.execute(f"UPDATE Parts_Designs_StatValues SET UnitValue = {ers_stats_dict[stat][0]}, Value = {ers_stats_dict[stat][1]} WHERE PartStat = {stat} AND DesignID = {oldERSID[0]}")
    gearbox_stats = cursor.execute(f"SELECT PartStat, UnitValue, Value FROM Parts_Designs_StatValues WHERE DesignID = {newGearboxID}").fetchall()
    gearbox_stats_dict = {row[0]: [row[1], row[2]] for row in gearbox_stats}
    for stat in gearbox_stats_dict:
        cursor.execute(f"UPDATE Parts_Designs_StatValues SET UnitValue = {gearbox_stats_dict[stat][0]}, Value = {gearbox_stats_dict[stat][1]} WHERE PartStat = {stat} AND DesignID = {oldGearboxID[0]}")

    conn.commit()
    conn.close()
