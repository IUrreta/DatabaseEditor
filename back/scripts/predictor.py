import pickle
import re
import sqlite3
import pandas as pd
import numpy as np
import math
import json
import asyncio

c = None

points_race = { 
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1, 
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0
}

conn = None
cursor = None

# conn = sqlite3.connect("../result/main.db")
# cursor = conn.cursor()

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

def fetch_remaining_races(gpID, year):
    races = cursor.execute("SELECT RaceID FROM Races WHERE RaceID >= " + str(gpID) + " AND SeasonID = " + year).fetchall()
    return races
    
async def send_message_to_client(message):
    global c
    if c:
        await c.send(message)

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

def rebuild_driverStandings_until(raceid):
    year = cursor.execute("SELECT SeasonID FROm Races WHERE RaceID = " + str(raceid)).fetchone()
    drivers = fetch_drivers_per_year(year[0])
    idList = [driver[1] for driver in drivers]
    results = []
    for driver in idList:
        points = cursor.execute("SELECT SUM(Points) FROM Races_Results WHERE RaceID < " + str(raceid) + " AND DriverID = " + str(driver) + " AND Season = " + str(year[0])).fetchone()
        results.append((driver, points))
    df = pd.DataFrame(results, columns=['id', 'points'])
    df['points'] = df['points'].apply(lambda x: x[0])
    return df

def rebuild_driverStandings_with_pos(raceid):
    year = cursor.execute("SELECT SeasonID FROm Races WHERE RaceID = " + str(raceid)).fetchone()
    drivers = fetch_drivers_per_year(year[0])
    idList = [driver[1] for driver in drivers]
    results = []
    for driver in idList:
        points = cursor.execute("SELECT SUM(Points) FROM Races_Results WHERE RaceID < " + str(raceid) + " AND DriverID = " + str(driver) + " AND Season = " + str(year[0])).fetchone()
        sprintPoints = cursor.execute("SELECT SUM(ChampionshipPoints) FROM Races_SprintResults WHERE RaceFormula = 1 AND RaceID < " + str(raceid) + " AND DriverID = " + str(driver) + " AND SeasonID = " + str(year[0])).fetchone()
        if points[0] == None :
            points = (0,)
        if sprintPoints[0] == None:
            sprintPoints = (0,)
        points = (points[0] + sprintPoints[0], )
        position = cursor.execute("SELECT MIN(FinishingPos) FROM Races_Results WHERE RaceID < " + str(raceid) + " AND DriverID = " + str(driver) + " AND Season = " + str(year[0])).fetchone()
        if(position[0] == None):
            position = (21,)
            times = (1,)
        else:
            times = cursor.execute("SELECT COUNT(*) FROM Races_Results WHERE RaceID < " + str(raceid) + " AND DriverID = " + str(driver) + " AND Season = " + str(year[0]) + " AND FinishingPos = " + str(position[0])).fetchone()
        results.append((driver, points, position, times))
    data = [[item[0], item[1][0], item[2][0], item[3][0]] for item in results]
    df = pd.DataFrame(data, columns=['id', 'points', 'bestPos', 'timesAchieved'])
    df["bestPos"].fillna(21, inplace=True)
    df["timesAchieved"].fillna(0, inplace=True)
    return df
    # df = pd.DataFrame(results, columns=['id', 'points'])
    # df['points'] = df['points'].apply(lambda x: x[0])
    # return df


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
    global conn
    global cursor
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
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
        dfT.drop(dfT[dfT['result'] == 0].index, inplace=True)
    dfT['Prediction'] = dfT['Prediction'].rank(method='first').astype(int)
    dict = dfT.set_index('id').T.to_dict()

    conn.commit()
    conn.close()
    return dict

    
def predict_with_rmse(df, gpID):
    if(str(gpID) != str(fetch_next_race())):
        df.drop(df[df['result'] == 0].index, inplace=True)
    random_numbers = np.random.uniform(-5, 5, df.shape[0])
    df['Prediction'] = df['Prediction'] + random_numbers
    df['Prediction'] = df['Prediction'].rank(method='first').astype(int)
    # df['Prediction2'] = df['Prediction2'].rank(method='first').astype(int)
    return df

async def montecarlo(gpID, year, client):
    global c
    global conn
    global cursor
    c = client
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    drivers = fetch_drivers_per_year(year)
    df_sims = pd.DataFrame()
    n_sims = 89
    percent = math.ceil(n_sims * 0.01)
    for i in range(n_sims):
        simulation = predict_remaining(gpID, year)
        simulation.rename(columns={'Position': f'sim_{i+1}'}, inplace=True)
        if i == 0:
            df_sims = simulation.copy()
        else:
            df_sims = pd.merge(df_sims, simulation, on='id')
        if i % percent == 0:
            percent_done = int((i / n_sims) * 100)  
            await send_message_to_client(json.dumps(["Progress",percent_done]))
            await asyncio.sleep(0.1)
    df_percentages = pd.DataFrame()
    df_percentages['id'] = df_sims['id']
    n_driver = df_sims.shape[0]
    for i in range(1, n_driver+1):
        df_percentages[f'pos_{i}'] = df_sims.iloc[:, 1:].apply(lambda row: (row == i).sum(), axis=1) / n_sims * 100
    name_dict = {id_: nombre for nombre, id_, _ in drivers}
    team_dict = {id_ : team_ for _, id_, team_ in drivers}
    df_percentages['Name'] = df_percentages['id'].map(name_dict)
    df_percentages["Team"] = df_percentages["id"].map(team_dict)
    # dict = df_percentages.set_index('id').T.to_dict()
    res = rebuild_driverStandings_with_pos(gpID)
    res = res.sort_values(by=['points', 'bestPos', 'timesAchieved'], ascending=[False, True, False])
    res['Position'] = range(1, len(res) + 1)
    df_percentages = df_percentages.merge(res[['id', 'Position']], on='id', how='left')
    df_percentages.drop_duplicates(subset='id', keep='first', inplace=True)
    dict = df_percentages.values.tolist()
    for i in range(len(dict)):
        last = dict[i][-3:]
        dict[i] = dict[i][:-3]
        dict[i] = dict[i][:1] + last + dict[i][1:]

    conn.commit()
    conn.close()
    return dict



def predict_remaining(gpID, year):
    races = fetch_remaining_races(gpID, year)
    df = loadDF(gpID, year)
    df = df.fillna(0)
    races = [race[0] for race in races]
    nraces = len(races)
    model = pickle.load(open("./models/PD03LR.pkl", "rb"))
    drivers = fetch_drivers_per_year(year)
    name_dict = {id_: nombre for nombre, id_, _ in drivers}
    team_dict = {id_ : team_ for _, id_, team_ in drivers}
    df_final = pd.DataFrame(index=name_dict.keys())
    df_results = rebuild_driverStandings_with_pos(gpID)
    for gp in races:
        df2 = df.copy()
        df2['Prediction'] = model.predict(df2)
        df2['Name'] = df2['id'].map(name_dict)
        df2["Team"] = df2["id"].map(team_dict)
        df2['Prediction'] = df2['Prediction'].astype(float)
        df2['id'] = df2['id'].astype(int)
        df2['result'] = df2['result'].astype(int)
        df2 = predict_with_rmse(df2, gpID)
        df = df.merge(df2[['id', 'Prediction']], on='id', how='left')
        df['race_lag3'] = df['race_lag2']
        df['race_lag2'] = df['race_lag1']
        df['race_lag1'] = df['Prediction']
        df['lastRacePoints'] = df['race_lag1'].map(points_race)
        df['totalPoints'] = df['pctPoints'] * nraces * 26 + df['lastRacePoints']
        nraces += 1
        df['avgRacePosition'] = (df['avgRacePosition'] * (nraces - 1) + df['race_lag1']) / nraces
        df['pctPoints'] = df['totalPoints'] / (nraces * 26)
        df = df.drop(columns=['Prediction', "lastRacePoints", "totalPoints"])
        df = df.fillna(0)
        df_final['race_' + str(gp)] = df2.set_index('id')['Prediction']


    df_results.drop_duplicates(subset='id', keep='first', inplace=True)
    for race in df_final.columns:
        # Obtener los resultados de la carrera
        race_results = df_final[race]
        
        # Mapear los resultados de la carrera a los puntos correspondientes
        race_points = race_results.map(points_race)
        
        # Sumar los puntos de la carrera a los puntos totales en df_results
        df_results.set_index('id', inplace=True)
        df_results['points'] += race_points
        df_results.reset_index(inplace=True)
    df_results.fillna(0, inplace=True)
    df_results.set_index("id", inplace=True)
    df_final = df_final.join(df_results[['points', "bestPos", "timesAchieved"]])
    df_final = df_final.fillna(21)
    df_final['bestPos'] = df_final.drop(['points', "timesAchieved"], axis=1).min(axis=1)
    df_final = df_final.sort_values(by=['points', 'bestPos', "timesAchieved"], ascending=[False, True, False])
    df_final['Position'] = range(1, len(df_final) + 1)
    df_final = df_final.drop('bestPos', axis=1)
    df_final.reset_index(inplace=True)
    df_final.rename(columns={'index': 'id'}, inplace=True)
    df_final = df_final[["id", "Position"]]
    df_final["Position"] = df_final["Position"].astype(int)

    return df_final
    
        

    
