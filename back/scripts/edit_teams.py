
cursor = None
def fetch_teamData(teamID, c):
    global cursor
    cursor = c
    print("AAAAAAAAAA")
    levCon = cursor.execute("SELECT BuildingID, DegradationValue FROM Buildings_HQ WHERE TeamID = " + str(teamID)).fetchall()
    data = [(x, round(y, 2)) for x, y in levCon]
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    days = cursor.execute("SELECT Min(Day), Max(Day) FROM Seasons_Deadlines WHERE SeasonID = " + str(day_season[1])).fetchone()
    costCap = cursor.execute("SELECT SUM(value) as Value FROM Finance_Transactions WHERE Day >= " + str(days[0]) + " AND Day < " + str(days[1]) + " AND AffectsCostCap = 1 AND TeamID = " + str(teamID)).fetchall()
    teamBalance = cursor.execute("SELECT Balance FROM Finance_TeamBalance WHERE TeamID = " + str(teamID)).fetchone()
    seasonObj = cursor.execute("SELECT TargetPos FROM Board_SeasonObjectives WHERE TeamID = " + str(teamID) + " AND SeasonID = " + str(day_season[1])).fetchone()
    maxTargetYear = cursor.execute("SELECT MAX(TargetEndYear) FROM Board_Objectives WHERE TeamID = " +str(teamID)).fetchone()
    longTermObj = cursor.execute("SELECT Type, TargetEndYear FROM Board_Objectives WHERE TeamID = " + str(teamID) + " AND TargetEndYear =" + str(maxTargetYear[0])).fetchone()
    confidence = cursor.execute("SELECT Confidence FROM Board_Confidence WHERE Season = " + str(day_season[1])).fetchone()
    data.extend([seasonObj, longTermObj, teamBalance, costCap, confidence, day_season[1]])
    return data
