import sqlite3
def fetch_teamData(teamID):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    levCon = cursor.execute("SELECT BuildingID, DegradationValue FROM Buildings_HQ WHERE TeamID = " + str(teamID)).fetchall()
    data = [(x, round(y, 2)) for x, y in levCon]
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    days = cursor.execute("SELECT Min(Day), Max(Day) FROM Seasons_Deadlines WHERE SeasonID = " + str(day_season[1])).fetchone()
    costCap = cursor.execute("SELECT SUM(value) as Value FROM Finance_Transactions WHERE Day >= " + str(days[0]) + " AND Day < " + str(days[1]) + " AND AffectsCostCap = 1 AND TeamID = " + str(teamID)).fetchall()
    teamBalance = cursor.execute("SELECT Balance FROM Finance_TeamBalance WHERE TeamID = " + str(teamID)).fetchone()
    seasonObj = cursor.execute("SELECT TargetPos FROM Board_SeasonObjectives WHERE TeamID = " + str(teamID) + " AND SeasonID = " + str(day_season[1])).fetchone()
    maxTargetYear = cursor.execute("SELECT MAX(TargetEndYear) FROM Board_Objectives WHERE TeamID = " +str(teamID)).fetchone()
    longTermObj = cursor.execute("SELECT Type, TargetEndYear FROM Board_Objectives WHERE TeamID = " + str(teamID) + " AND TargetEndYear =" + str(maxTargetYear[0])).fetchone()
    playerTeam = cursor.execute("SELECT TeamID FROM Player").fetchone()
    if(playerTeam[0] == int(teamID)):
        confidence = cursor.execute("SELECT Confidence FROM Board_Confidence WHERE Season = " + str(day_season[1])).fetchone()
    else:
        confidence = (-1,)
    data.extend([seasonObj, longTermObj, teamBalance, costCap, confidence, day_season[1]])

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
        cursor.execute("UPDATE Buildings_HQ SET BuildingID = " + str(facility[0]) + ", DegradationValue = " + str(facility[1]) + " WHERE TeamID = " + str(teamID) + " AND BuildingType = " + str(id))
    cursor.execute("UPDATE Board_SeasonObjectives SET TargetPos = " + info["seasonObj"] + " WHERE TeamID =" + str(teamID) + " AND SeasonID = " + str(day_season[1]))
    maxTargetYear = cursor.execute("SELECT MAX(TargetEndYear) FROM Board_Objectives WHERE TeamID = " +str(teamID)).fetchone()
    cursor.execute("UPDATE Board_Objectives SET Type = " + str(info["longTermObj"]) + ", TargetEndYear = " + str(info["longTermYear"]) + " WHERE TeamID =  " + str(teamID) + " AND targetEndYear = " + str(maxTargetYear[0]))
    if info["confidence"] != "-1":
        cursor.execute("UPDATE Board_Confidence SET Confidence = " + str(info["confidence"]) + " WHERE Season = " + str(day_season[1]))
    cursor.execute("UPDATE Finance_TeamBalance SET Balance = " + str(info["teamBudget"]) + " WHERE TeamID = " + str(teamID))
    cursor.execute("INSERT INTO Finance_Transactions VALUES ("+ str(teamID) +", "+ str(day_season[0]) +", "+ str(info["costCapEdit"]) +", 9, -1, 1)")

    conn.commit()
    conn.close()