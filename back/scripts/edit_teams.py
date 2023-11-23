
cursor = None
def fetch_teamData(teamID, c):
    global cursor
    cursor = c
    print("AAAAAAAAAA")
    levCon = cursor.execute("SELECT BuildingID, DegradationValue FROM Buildings_HQ WHERE TeamID = " + str(teamID)).fetchall()
    return [(x, round(y, 2)) for x, y in levCon]
