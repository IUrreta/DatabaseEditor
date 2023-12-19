import sqlite3
import numpy as np
def fetch_Head2Head(driver1ID, driver2ID, year):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
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
    d1_avgPace = []
    d2_avgPace = []
    d1_avgQPace = []
    d2_avgQPace = []
    d1_RPositions = []
    d2_RPositions = []
    d1_QPositions = []
    d2_QPositions = []
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
        d1_QPositions.append(d1_QRes[0])
        d2_QPositions.append(d2_QRes[0])
        minQ = d1_QStage[0] if d1_QStage[0] <= d2_QStage[0] else d2_QStage[0]
        d1_qLap = cursor.execute("SELECT FastestLap FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver1ID[0]) + " AND QualifyingStage = " + str(minQ)).fetchone()
        d2_qLap = cursor.execute("SELECT FastestLap FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver2ID[0]) + " AND QualifyingStage = " + str(minQ)).fetchone()
        if(d1_qLap[0] != 0) and (d2_qLap[0] != 0):
            d1_avgQPace.append(d1_qLap[0])
            d2_avgQPace.append(d2_qLap[0])
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
        d1_RPositions.append(d1_RRes[0])
        d2_RPositions.append(d2_RRes[0])
        d1_RDNF = cursor.execute("SELECT DNF FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID = " + str(driver1ID[0])).fetchone()
        d2_RDNF = cursor.execute("SELECT DNF FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID = " + str(driver2ID[0])).fetchone()
        if(d1_RDNF[0] == 1):
            dnfH2H[0] += 1
        if(d2_RDNF[0] == 1):
            dnfH2H[1] += 1  
        if (d1_RDNF[0] != 1) and (d2_RDNF[0] != 1):
            d1_raceTotal = cursor.execute("SELECT Time FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID = " + str(driver1ID[0])).fetchone()
            d2_raceTotal = cursor.execute("SELECT Time FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID = " + str(driver2ID[0])).fetchone()
            d1_raceLaps = cursor.execute("SELECT Laps FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID = " + str(driver1ID[0])).fetchone()
            d2_raceLaps = cursor.execute("SELECT Laps FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID = " + str(driver2ID[0])).fetchone()
            d1_avgPace.append(round(d1_raceTotal[0] / d1_raceLaps[0], 3))
            d2_avgPace.append(round(d2_raceTotal[0] / d2_raceLaps[0], 3))
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
    rDifferences = [d2 - d1 for d1, d2 in zip(d1_avgPace, d2_avgPace)]
    qDifferences = [d2 - d1 for d1, d2 in zip(d1_avgQPace, d2_avgQPace)]
    avg_racediff = round(np.mean(rDifferences), 3)
    avg_qualidiff = round(np.mean(qDifferences), 3)
    meanRd1 = round(np.mean(d1_RPositions), 1)
    meanRd2 = round(np.mean(d2_RPositions), 1)
    medianRd1 = np.median(d1_RPositions)
    medianRd2 = np.median(d2_RPositions)
    meanQd1 = round(np.mean(d1_QPositions), 1)
    meanQd2 = round(np.mean(d2_QPositions), 1)
    medianQd1 = np.median(d1_QPositions)
    medianQd2 = np.median(d2_QPositions)
    resultList = [tuple(raceH2H),tuple(qualiH2H),tuple(pointsH2H),tuple(podiumsH2H),tuple(bestRace),tuple(bestQuali),tuple(dnfH2H), tuple(winsH2H), tuple(polesH2H), tuple(sprintWinsH2H), (-avg_racediff, avg_racediff), (-avg_qualidiff, avg_qualidiff), (meanRd1, meanRd2), (medianRd1, medianRd2), (meanQd1, meanQd2), (medianQd1, medianQd2)]

    conn.commit()
    conn.close()

    return resultList  


def fetch_Head2Head_team(teamID1, teamID2, year):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    races = cursor.execute("SELECT DISTINCT RaceID FROM Races_Results WHERE Season = "  + str(year[0])).fetchall()
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
    d1_avgPace = []
    d2_avgPace = []
    d1_avgQPace = []
    d2_avgQPace = []
    for gp in races:
        race = gp[0]
        drivers1 = cursor.execute("SELECT DISTINCT DriverID FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID = " + str(race) + " AND TeamID = " + str(teamID1[0])).fetchall()
        drivers2 = cursor.execute("SELECT DISTINCT DriverID FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID = " + str(race) + " AND TeamID = " + str(teamID2[0])).fetchall()
        drivers1 = tuple(i[0] for i in drivers1)
        drivers2 = tuple(i[0] for i in drivers2)
        d1_QStage = cursor.execute("SELECT MAX(QualifyingStage) FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID IN " + str(drivers1)).fetchone()
        d2_QStage = cursor.execute("SELECT MAX(QualifyingStage) FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID IN " + str(drivers2)).fetchone()
        d1_QRes = cursor.execute("SELECT MIN(FinishingPos) FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID IN " + str(drivers1) + " AND QualifyingStage = " + str(d1_QStage[0])).fetchone()
        d2_QRes = cursor.execute("SELECT MIN(FinishingPos) FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID IN " + str(drivers2) + " AND QualifyingStage = " + str(d2_QStage[0])).fetchone()
        if(d1_QStage[0] < d2_QStage[0]):
            qualiH2H[1]+= 1
        elif(d1_QStage[0] > d2_QStage[0]):
            qualiH2H[0]+= 1
        elif(d1_QStage[0] == d2_QStage[0]):
            if(d1_QRes[0] < d2_QRes[0]):
                qualiH2H[0]+= 1
            elif(d1_QRes[0] > d2_QRes[0]):
                qualiH2H[1]+= 1
        minQ = d1_QStage[0] if d1_QStage[0] <= d2_QStage[0] else d2_QStage[0]
        d1_qLap = cursor.execute("SELECT FastestLap FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID IN " + str(drivers1) + " AND QualifyingStage = " + str(minQ)).fetchone()
        d2_qLap = cursor.execute("SELECT FastestLap FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID IN " + str(drivers2) + " AND QualifyingStage = " + str(minQ)).fetchone()
        if(d1_qLap[0] != 0) and (d2_qLap[0] != 0):
            d1_avgQPace.append(d1_qLap[0])
            d2_avgQPace.append(d2_qLap[0])        
        if(d1_QStage[0] == 3 and d1_QRes[0] == 1):
            polesH2H[0] += 1
        if(d2_QStage[0] == 3 and d2_QRes[0] == 1):
            polesH2H[1] += 1
        if(d1_QRes[0] < d1_BestQauli):
            d1_BestQauli = d1_QRes[0]
        if(d2_QRes[0] < d2_BestQauli):
            d2_BestQauli = d2_QRes[0]
        d1_RRes = cursor.execute("SELECT MIN(FinishingPos) FROM Races_Results  WHERE RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID IN " + str(drivers1)).fetchone()
        d2_RRes = cursor.execute("SELECT MIN(FinishingPos) FROM Races_Results  WHERE RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID IN " + str(drivers2)).fetchone()
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
        d1_RDNF = cursor.execute("SELECT SUM(DNF) FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID IN " + str(drivers1)).fetchone()
        d2_RDNF = cursor.execute("SELECT SUM(DNF) FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID IN " + str(drivers2)).fetchone()
        if(d1_RDNF[0] > 0):
            dnfH2H[0] += d1_RDNF[0]
        if(d2_RDNF[0] > 0):
            dnfH2H[1] += d2_RDNF[0]
        if (d1_RDNF[0] == 0) and (d2_RDNF[0] == 0):
            d1_raceTotal = cursor.execute("SELECT AVG(Time) FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID IN " + str(drivers1)).fetchone()
            d2_raceTotal = cursor.execute("SELECT AVG(Time) FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID IN " + str(drivers2)).fetchone()
            d1_raceLaps = cursor.execute("SELECT AVG(Laps) FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID IN " + str(drivers1)).fetchone()
            d2_raceLaps = cursor.execute("SELECT AVG(Laps) FROM Races_Results WHERE  RaceID =" + str(race) + " AND Season = " + str(year[0]) + " AND DriverID IN " + str(drivers2)).fetchone()
            d1_avgPace.append(round(d1_raceTotal[0] / d1_raceLaps[0], 3))
            d2_avgPace.append(round(d2_raceTotal[0] / d2_raceLaps[0], 3))
        d1_SRes = cursor.execute("SELECT MIN(FinishingPos) FROM Races_Sprintresults  WHERE RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID IN " + str(drivers1)).fetchone()
        d2_SRes = cursor.execute("SELECT MIN(FinishingPos) FROM Races_Sprintresults  WHERE RaceID =" + str(race) + " AND SeasonID = " + str(year[0]) + " AND DriverID IN " + str(drivers2)).fetchone()
        if(d1_SRes != None):
            if(d1_SRes[0] == 1):
                sprintWinsH2H[0] += 1
        if(d2_SRes != None):
            if(d2_SRes[0] == 1):
                sprintWinsH2H[1] += 1
    d1_Pts = cursor.execute("SELECT Points FROM Races_TeamStandings WHERE RaceFormula = 1 AND  SeasonID = " + str(year[0]) + " AND TeamID = " + str(teamID1[0])).fetchone()
    d2_Pts = cursor.execute("SELECT Points FROM Races_TeamStandings WHERE RaceFormula = 1 AND  SeasonID = " + str(year[0]) + " AND TeamID = " + str(teamID2[0])).fetchone()
    pointsH2H[0] = d1_Pts[0]
    pointsH2H[0] = d1_Pts[0]
    pointsH2H[1] = d2_Pts[0]
    bestRace[0] = d1_BestRace
    bestRace[1] = d2_BestRace
    bestQuali[0] = d1_BestQauli
    bestQuali[1] = d2_BestQauli   

    rDifferences = [d2 - d1 for d1, d2 in zip(d1_avgPace, d2_avgPace)]
    qDifferences = [d2 - d1 for d1, d2 in zip(d1_avgQPace, d2_avgQPace)]
    avg_racediff = round(np.mean(rDifferences), 3)
    avg_qualidiff = round(np.mean(qDifferences), 3)

    resultList = [tuple(raceH2H),tuple(qualiH2H),tuple(pointsH2H),tuple(podiumsH2H),tuple(bestRace),tuple(bestQuali),tuple(dnfH2H), tuple(winsH2H), tuple(polesH2H), tuple(sprintWinsH2H), (-avg_racediff, avg_racediff), (-avg_qualidiff, avg_qualidiff)]

    conn.commit()
    conn.close()

    return resultList  