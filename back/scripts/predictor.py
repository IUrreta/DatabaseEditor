import pickle
import re
import sqlite3
import pandas as pd
import numpy as np

points_race = { 
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1, 
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0
}


conn = sqlite3.connect("../result/main.db")
cursor = conn.cursor()

def collect_one_driver_inputs(driverID):
    stats = cursor.execute("SELECT Val FROM Staff_PerformanceStats WHERE StaffID = ?", (driverID,)).fetchall()
    formated = tuple(i[0] for i in stats)
    return formated

def last_3_races():
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    races = cursor.execute("SELECT DISTINCT RaceID FRom Races_Results Where Season = " + str(day_season[1]) + " ORDER BY RaceID DESC").fetchall()
    return races

def last_3_races_prior_to(raceID):
    races = cursor.execute("SELECT DISTINCT RaceID FRom Races_Results Where RaceID < " + raceID + " ORDER BY RaceID DESC LIMIT 3").fetchall()
    return races

def race_results_last_3(races, driverID):
    gps = tuple(i[0] for i in races)
    res = []
    for gp in gps:
        result = cursor.execute("SELECT FinishingPos FROM Races_Results WHERE RaceID = " + str(gp) + " AND DriverID = " + str(driverID)).fetchone()
        res.append(result)
    results = []
    for j in res:
        if bool(j):
            results.append(j[0])
        else:
            results.append(j)
    results = tuple(results)
    return results

def quali_results_last_3(races, driverID):
    qualis = []
    gps = tuple(i[0] for i in races)
    for gp in gps:
        quali = cursor.execute("SELECT MAX(QualifyingStage), FinishingPos FROM Races_QualifyingResults WHERE RaceID = " + str(gp) + " AND DriverID = " + str(driverID)).fetchone()
        qualis.append(quali)
    results = tuple(j[1] for j in qualis)
    return results

def race_result_in(race, driverID):
    res = cursor.execute("SELECT FinishingPos FROM Races_Results WHERE RaceID = " + str(race) + " AND DriverID = " + str(driverID)).fetchone()
    return tuple(res)

def check_if_driver_race(race, driverID):
    res = cursor.execute("SELECT FinishingPos FROM Races_Results WHERE RaceID = " + str(race) + " AND DriverID = " + str(driverID)).fetchone()
    return bool(res)

def fetch_drivers_per_year(year):
    drivers = cursor.execute('SELECT  bas.FirstName, bas.LastName, res.DriverID, res.TeamID FROM Staff_BasicData bas JOIN Races_Results res ON bas.StaffID = res.DriverID WHERE Season = ' + str(year) + " GROUP BY bas.FirstName, bas.LastName, bas.StaffID, res.TeamID").fetchall()
    formatted_tuples = []
    for tupla in drivers:
        result = format_names_simple(tupla)
        formatted_tuples.append(result)
    return formatted_tuples

def format_names_simple(name):
    nombre_pattern = r'StaffName_Forename_(Male|Female)_(\w+)'
    apellido_pattern = r'StaffName_Surname_(\w+)'


    nombre_match = re.search(nombre_pattern, name[0])
    apellido_match = re.search(apellido_pattern, name[1])


    nombre = remove_number(nombre_match.group(2))
    apellido = remove_number(apellido_match.group(1))
    name_formatted = f"{nombre} {apellido}"
    team_id = name[3] if name[3] is not None else 0

    resultado = (name_formatted, name[2], team_id)
    return resultado


def remove_number(cadena):
    if cadena and cadena[-1].isdigit():
        cadena = cadena[:-1]
    return cadena

def fetch_next_race():
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    last = cursor.execute("SELECT MIN(RaceID) FROM Races WHERE Day > " + str(day_season[0])).fetchone()
    return last[0]

def fetch_remaining_races(gpID):
    races = cursor.execute("SELECT RaceID FROM Races WHERE RaceID > " + str(gpID)).fetchall()
    return races
    

def createDF():
    data = {}
    data["id"] = []
    for i in range(1, 10):
        data[f'stat{i}'] = []
    for i in range(1, 4):
        data[f'race_lag{i}'] = []
    data["boost"] = []
    data["pctPoints"] = []
    data["avgRacePosition"] = []  
    data['result'] = []
    dfT = pd.DataFrame(data)
    return dfT

def loadDF(gpID, year):
    drivers = fetch_drivers_per_year(year)
    idList = [driver[1] for driver in drivers]
    nameList = [(driver[0], driver[1]) for driver in drivers]
    idList = list(set(idList))
    dfT = createDF()
    for j in idList: 
        id = j
        gp = str(gpID)
        stats = collect_one_driver_inputs(id)
        races = last_3_races_prior_to(gp)
        res = race_results_last_3(races, id)
        points = fetch_points_until(gp, id)
        position = fetch_avg_position_until(gp, id)
        boost = fetch_spawnBoost(id)
        if(check_if_driver_race(gp, id)):
            y = race_result_in(gp, id)
            data_list = [id] + list(stats) + list(res) + list(boost) + [points] + [position] + list(y)
        else:
            data_list = [id] + list(stats) + list(res) + list(boost) + [points] + [position] + [0]
        dfT.loc[len(dfT)] = data_list
    # dfT.dropna(inplace=True)
    dfT = dfT.fillna(15)
    return dfT

def fetch_points_until(raceid, driverid):
    year = cursor.execute("SELECT SeasonID FROm Races WHERE RaceID = " + str(raceid)).fetchone()
    points = cursor.execute("SELECT SUM(Points) FROM Races_Results WHERE RaceID <= " + str(raceid) + " AND DriverID = " + str(driverid) + " AND Season = " + str(year[0])).fetchone()
    nRaces = cursor.execute("SELECT COUNT(RaceID) FROM Races_Results WHERE RaceID <= " + str(raceid) + " AND DriverID = " + str(driverid) + " AND Season = " + str(year[0])).fetchone()
    if(nRaces[0] != 0):
        maxPoints = nRaces[0] * 26
        pctPoints = (points[0]*100)/maxPoints
    else:
        pctPoints = 0
    return pctPoints

def fetch_avg_position_until(raceid, driverid):
    year = cursor.execute("SELECT SeasonID FROm Races WHERE RaceID = " + str(raceid)).fetchone()
    pos = cursor.execute("SELECT AVG(FinishingPos) FROM Races_Results WHERE RaceID <= " + str(raceid) + " AND DriverID = " + str(driverid) + " AND Season = " + str(year[0])).fetchone()
    return pos[0]

def fetch_spawnBoost(driverID):
    res = cursor.execute("SELECT PermaTraitSpawnBoost FROm Staff_GameData WHERE StaffID = " + str(driverID)).fetchone()
    return res

def predict(gpID, year):
    model = pickle.load(open("./models/PD03LR.pkl", "rb"))
    dfT = loadDF(gpID, year)
    dfT['Prediction'] = model.predict(dfT)
    dfT = dfT[["id", "result", "Prediction"]]
    drivers = fetch_drivers_per_year(year)
    name_dict = {id_: nombre for nombre, id_, _ in drivers}
    team_dict = {id_ : team_ for _, id_, team_ in drivers}
    dfT['Name'] = dfT['id'].map(name_dict)
    dfT["Team"] = dfT["id"].map(team_dict)
    # print(dfT[["id", "result", "Prediction"]])
    dfT['Prediction'] = dfT['Prediction'].astype(float)
    dfT['id'] = dfT['id'].astype(int)
    dfT['result'] = dfT['result'].astype(int)
    if(str(gpID) != str(fetch_next_race())):
        print("entro")
        dfT.drop(dfT[dfT['result'] == 0].index, inplace=True)
    dfT['Prediction'] = dfT['Prediction'].rank(method='first').astype(int)
    dict = dfT.set_index('id').T.to_dict()
    return dict
    
def predict_with_rmse(df):
    random_numbers = np.random.uniform(-1.5, 1.5, df.shape[0])
    print(random_numbers)
    df['Prediction2'] = df['Prediction'] + random_numbers
    df['Prediction'] = df['Prediction'].rank(method='first').astype(int)
    df['Prediction2'] = df['Prediction2'].rank(method='first').astype(int)
    print(df)


# def predict_remaining(gpID, year):
    
