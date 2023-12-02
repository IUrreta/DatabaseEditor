import pickle
import re
import sqlite3
import pandas as pd


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

def get_lest_race(day):
    last = cursor.execute("SELECT MAX(RaceID) FROM Races WHERE Day < " + str(day)).fetchone()
    return last[0]
    


def createDF():
    data = {}
    data["id"] = []
    for i in range(1, 10):
        data[f'stat{i}'] = []
    for i in range(1, 4):
        data[f'race_lag{i}'] = []
    for i in range(1, 4):
        data[f'quali_lag{i}'] = []
    data['result'] = []
    dfT = pd.DataFrame(data)
    return dfT

def predict(gpID, year):
    MLP_fit = pickle.load(open("./models/PD01.pkl", "rb"))
    drivers = fetch_drivers_per_year(year)
    print(drivers)
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
        qs = quali_results_last_3(races, id)
        if(check_if_driver_race(gp, id)):
            y = race_result_in(gp, id)
            data_list = [id] + list(stats) + list(res)[::-1] + list(qs) + list(y)
        else:
            data_list = [id] + list(stats) + list(res)[::-1] + list(qs) + [0]
        dfT.loc[len(dfT)] = data_list
    dfT.dropna(inplace=True)
    dfT['Prediction'] = MLP_fit.predict(dfT)
    dfT = dfT[["id", "result", "Prediction"]]
    name_dict = {id_: nombre for nombre, id_, _ in drivers}
    team_dict = {id_ : team_ for _, id_, team_ in drivers}
    dfT['Name'] = dfT['id'].map(name_dict)
    dfT["Team"] = dfT["id"].map(team_dict)
    dfT['Prediction'] = dfT['Prediction'].astype(float)
    dfT['Prediction'] = dfT['Prediction'].rank(method='first').astype(int)
    dfT['result'] = dfT['result'].astype(int)
    dfT['id'] = dfT['id'].astype(int)
    dict = dfT.set_index('id').T.to_dict()
    return dict
    # print(dfT[["Name", "Prediction", "result"]].sort_values("result"))
    




    
