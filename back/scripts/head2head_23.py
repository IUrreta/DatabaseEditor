cursor = None
def fetch_Head2Head(driver1ID, driver2ID, year, c):
    global cursor
    cursor = c
    query = "SELECT RaceID FROM Races_Results WHERE Season = ?  AND DriverID IN (?, ?) GROUP BY RaceID HAVING COUNT(DISTINCT DriverID) = 2;"
    data = (year[0], driver1ID[0], driver2ID[0])
    races_both = cursor.execute(query, data).fetchall()
    tuple_races = list(elem for tupla in races_both for elem in tupla)
    raceH2H = [0,0]
    qualiH2H = [0,0]
    dnfH2H = [0,0]
    bestRace = [0,0]
    bestQuali = [0,0]
    pointsH2H = [0,0]
    podiumsH2H = [0,0]
    polesH2H = [0,0]
    winsH2H = [0,0]
    sprintWinsH2H  = [0,0]
    d1_BestRace = 21
    d2_BestRace = 21
    d1_BestQauli = 21
    d2_BestQauli = 21
    for race in tuple_races:
        d1_QStage = cursor.execute("SELECT MAX(QualifyingStage) FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver1ID[0])).fetchone()
        d2_QStage = cursor.execute("SELECT MAX(QualifyingStage) FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver2ID[0])).fetchone()
        d1_QRes = cursor.execute("SELECT FinishingPos FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver1ID[0]) + " AND QualifyingStage = " + str(d1_QStage[0])).fetchone()
        d2_QRes = cursor.execute("SELECT FinishingPos FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver2ID[0]) + " AND QualifyingStage = " + str(d2_QStage[0])).fetchone()
        if(d1_QStage[0] < d2_QStage[0]):
            qualiH2H[1]+= 1
        elif(d1_QStage[0] > d2_QStage[0]):
            qualiH2H[0]+= 1
        elif(d1_QStage[0] == d2_QStage[0]):
            if(d1_QRes[0] < d2_QRes[0]):
                qualiH2H[0]+= 1
            elif(d1_QRes[0] > d2_QRes[0]):
                qualiH2H[1]+= 1
        if(d1_QStage[0] == 3 and d1_QRes[0] == 1):
            polesH2H[0] += 1
        if(d2_QStage[0] == 3 and d2_QRes[0] == 1):
            polesH2H[1] += 1
        if(d1_QRes[0] < d1_BestQauli):
            d1_BestQauli = d1_QRes[0]
        if(d2_QRes[0] < d2_BestQauli):
            d2_BestQauli = d2_QRes[0]
        d1_RRes = cursor.execute("SELECT FinishingPos FROM Races_Results  WHERE RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID = " + str(driver1ID[0])).fetchone()
        d2_RRes = cursor.execute("SELECT FinishingPos FROM Races_Results  WHERE RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID = " + str(driver2ID[0])).fetchone()
        if(d1_RRes[0] == 1):
            winsH2H[0] += 1
        if(d2_RRes[0] == 1):
            winsH2H[1] += 1        
        if(d1_RRes[0] < d2_RRes[0]):
            raceH2H[0]+= 1
        elif(d1_RRes[0] > d2_RRes[0]):
            raceH2H[1]+= 1
        if(d1_RRes[0] <= 3):
            podiumsH2H[0] += 1
        if(d2_RRes[0] <= 3):
            podiumsH2H[1] += 1
        if(d1_RRes[0] < d1_BestRace):
            d1_BestRace = d1_RRes[0]
        if(d2_RRes[0] < d2_BestRace):
            d2_BestRace = d2_RRes[0]
        d1_RDNF = cursor.execute("SELECT DNF FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID = " + str(driver1ID[0])).fetchone()
        d2_RDNF = cursor.execute("SELECT DNF FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID = " + str(driver2ID[0])).fetchone()
        if(d1_RDNF[0] == 1):
            dnfH2H[0] += 1
        if(d2_RDNF[0] == 1):
            dnfH2H[1] += 1  
        d1_SRes = cursor.execute("SELECT FinishingPos FROM Races_Sprintresults  WHERE RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver1ID[0])).fetchone()
        d2_SRes = cursor.execute("SELECT FinishingPos FROM Races_Sprintresults  WHERE RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver2ID[0])).fetchone()
        if(d1_SRes != None):
            if(d1_SRes[0] == 1):
                sprintWinsH2H[0] += 1
        if(d2_SRes != None):
            if(d2_SRes[0] == 1):
                sprintWinsH2H[1] += 1

    d1_Pts = cursor.execute("SELECT Points FROM Races_DriverStandings WHERE RaceFormula = 1 AND  SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver1ID[0])).fetchone()
    d2_Pts = cursor.execute("SELECT Points FROM Races_DriverStandings WHERE RaceFormula = 1 AND  SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver2ID[0])).fetchone()
    pointsH2H[0] = d1_Pts[0]
    pointsH2H[1] = d2_Pts[0]
    bestRace[0] = d1_BestRace
    bestRace[1] = d2_BestRace
    bestQuali[0] = d1_BestQauli
    bestQuali[1] = d2_BestQauli   
    resultList = [tuple(raceH2H),tuple(qualiH2H),tuple(pointsH2H),tuple(podiumsH2H),tuple(bestRace),tuple(bestQuali),tuple(dnfH2H), tuple(winsH2H), tuple(polesH2H), tuple(sprintWinsH2H)]

    return resultList  