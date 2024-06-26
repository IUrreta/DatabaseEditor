import sqlite3

def fetch_teamData(teamID):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    levCon = cursor.execute(f"SELECT BuildingID, DegradationValue FROM Buildings_HQ WHERE TeamID = {teamID}").fetchall()
    data = [(x, round(y, 2)) for x, y in levCon]
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
    data.extend([seasonObj, longTermObj, teamBalance, costCap, confidence, day_season[1], pit_dict])

    conn.commit()
    conn.close()

    return data

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
    cursor.execute(f"INSERT INTO Finance_Transactions VALUES ({teamID}, {day_season[0]}, {info['costCapEdit']}, 9, -1, 1)")
    for stat in info["pitCrew"]:
        cursor.execute(f"UPDATE Staff_PitCrew_PerformanceStats SET Val = {info["pitCrew"][stat]} WHERE TeamID = {teamID} AND StatID = {stat}")

    conn.commit()
    conn.close()
