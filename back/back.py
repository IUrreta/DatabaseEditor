import asyncio
import websockets
import json
import sqlite3
import re
import os
import random
from datetime import datetime
import shutil
import math
from scripts.extractor import process_unpack, process_repack
from scripts.transfer_driver_23 import run_script as run_trasnsfer
from scripts.transfer_driver_23 import unretire
from scripts.edit_stats_23 import run_script as run_editStats
from scripts.custom_calendar_23 import run_script as run_editCalendar
from scripts.car_performance_23 import run_script as run_editPerformance
from scripts.engine_performance_23 import run_script as run_editEngine
from scripts.head2head_23 import fetch_Head2Head, fetch_Head2Head_team
from scripts.edit_teams import fetch_teamData, edit_team
from scripts.predictor import predict, montecarlo

client = None
path = None
log = None
conn = None
cursor = None
team_dict = {"1": "Ferrari", "2": "McLaren", "3": "Red Bull", "4": "Mercedes", "5": "Alpine", "6": "Williams", "7": "Haas", "8": "Alfa Romeo", "9": "AlphaTauri", "10": "Aston Martin"}


async def handle_command(message):
    type = message["command"]
    global path
    global conn
    global cursor
    global log
    argument = ""
    logtxt = str(message)
    if type == "connect":
        log = open("../log.txt", 'a', encoding='utf-8')
        argument = type
        saves = [element for element in os.listdir("../") if ".sav" in element]
        if "player.sav" in saves:
            saves.remove("player.sav")
        saves.insert(0, "Connected Succesfully")
        data_saves = json.dumps(saves)
        await send_message_to_client(data_saves)
        await send_message_to_client(json.dumps(["JIC"]))

    elif type == "saveSelected":
        save = message["save"]
        argument = type + " " + save
        path = "../" + save
        process_unpack(path, "../result")
        conn = sqlite3.connect("../result/main.db")
        cursor = conn.cursor()
        drivers = fetch_info()
        drivers.insert(0, "Save Loaded Succesfully")
        data_json_drivers = json.dumps(drivers)
        await send_message_to_client(data_json_drivers)
        staff = fetch_staff()
        staff.insert(0, "Staff Fetched")
        data_json_staff = json.dumps(staff)
        await send_message_to_client(data_json_staff)
        engines = fetch_engines()
        engines.insert(0, "Engines fetched")
        data_json_engines = json.dumps(engines)
        await send_message_to_client(data_json_engines)
        calendar = fetch_calendar()
        calendar.insert(0, "Calendar fetched")
        data_json_calendar = json.dumps(calendar)
        await send_message_to_client(data_json_calendar)
        create_backup(path, save)
        year =  cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()[0]
        year = ["Year fetched", year]
        data_json_year = json.dumps(year)
        await send_message_to_client(data_json_year)

    elif type =="hire":
        argument = "hire " + message["driverID"] + " " + str(message["teamID"]) + " " + message["position"] + " " + message["salary"] + " " + message["signBonus"] + " " + message["raceBonus"] + " " + message["raceBonusPos"] + " " + message["year"]
        run_trasnsfer(argument)
        process_repack("../result", path)
        info = []
        info.insert(0, "Succesfully moved " + message["driver"] + " into " + message["team"])
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type =="fire":
        argument = "fire " + message["driverID"]
        run_trasnsfer(argument)
        process_repack("../result", path)
        info = []
        info.insert(0, "Succesfully released " + message["driver"] + " from " + message["team"])
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type =="autocontract":
        argument = "hire " + message["driverID"] + " " +  str(message["teamID"]) + " " + message["position"]
        run_trasnsfer(argument)
        process_repack("../result", path)
        info = []
        info.insert(0, "Succesfully moved " + message["driver"] + " into " + message["team"])
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type=="swap":
        argument = "swap " + message["driver1ID"] + " " + message["driver2ID"]
        run_trasnsfer(argument)
        process_repack("../result", path)
        info = []
        info.insert(0, "Succesfully swapped " + message["driver1"] + " and  " + message["driver2"])
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type =="editStats":
        run_editStats(message["driverID"] + " " + message["typeStaff"] + " " + message["statsArray"])
        argument = type + " " + message["driverID"] + " " + message["typeStaff"] + " " + message["statsArray"]
        process_repack("../result", path)
        info = []
        info.insert(0, "Succesfully edited " + message["driver"] + "'s stats")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type=="calendar":
        run_editCalendar(message["calendarCodes"])
        process_repack("../result", path)
        argument = type + message["calendarCodes"]
        info = []
        info.insert(0, "Succesfully edited the calendar")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type=="requestDriver":
        contractDetails = fetch_driverContract(message["driverID"])
        contractMsg = [contractDetails]
        contractMsg.append(fetchDriverNumberDetails(message["driverID"]))
        contractMsg.insert(0, "Contract fetched")
        data_json_contract = json.dumps(contractMsg)
        await send_message_to_client(data_json_contract)
        nums = fetch_driverNumebrs()
        nums.insert(0, "Numbers fetched")
        data_json_numbers = json.dumps(nums)
        await send_message_to_client(data_json_numbers)
        yearOfRetirement = fetch_driverRetirement(message["driverID"])
        yearOfRetirement.insert(0, "Retirement fetched")
        data_json_year = json.dumps(yearOfRetirement)
        await send_message_to_client(data_json_year)

    elif type=="editContract":
        argument = "editContract " + message["salary"] + " " + message["year"] + " " + message["signBonus"] + " " + message["raceBonus"] + " " + message["raceBonusPos"] + " " +  str(message["driverID"]) + " " + str(message["driverNumber"]) + " " + str(message["wantsN1"]) + " " + str(message["retirementAge"])
        run_trasnsfer(argument)
        process_repack("../result", path)
        info = []
        info.insert(0, "Succesfully edited " + message["driver"] + "'s details")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type =="editPerformance":
        argument = message["teamID"] + " " + message["performanceArray"]
        run_editPerformance(argument)
        process_repack("../result", path)
        info = []
        info.insert(0, "Succesfully edited " + message["teamName"] + "'s car performance")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)
        argument = "editPerformance " +  message["teamID"] + " " + message["performanceArray"]

    elif type=="editEngine":
        argument = message["engineID"] +  " " + message["teamEngineID"] + " " +  message["performanceArray"]
        run_editEngine(argument)
        process_repack("../result", path)
        info = []
        info.insert(0, "Succesfully edited all " + message["team"] + " engines performance")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type=="yearSelected":
        results = fetch_seasonResults(message["year"])
        results.insert(0, fetch_events_from(message["year"]))
        results.insert(0, "Results fetched")
        results.append(fetch_teamsStadings(message["year"]))
        data_json_results = json.dumps(results)
        #argument = json.dumps(message)
        await send_message_to_client(data_json_results)

    elif type=="yearSelectedH2H":
        drivers = fetch_drivers_per_year(message["year"])
        drivers.insert(0, "DriversH2H fetched")
        data_json_drivers = json.dumps(drivers)
        await send_message_to_client(data_json_drivers)

    elif type=="H2HConfigured":
        if(message["h2h"] != -1):
            if(message["mode"] == "driver"):
                h2hRes = fetch_Head2Head((message["h2h"][0],), (message["h2h"][1],), (message["year"],))
                h2h = ["H2H fetched", h2hRes]
                data_json_h2h = json.dumps(h2h)
                await send_message_to_client(data_json_h2h)
            elif(message["mode"] == "team"):
                h2hRes = fetch_Head2Head_team((message["h2h"][0],), (message["h2h"][1],), (message["year"],))
                h2h = ["H2H fetched", h2hRes]
                data_json_h2h = json.dumps(h2h)
                await send_message_to_client(data_json_h2h)
        h2hDrivers = []
        for id in message["graph"]:
            if(message["mode"] == "driver"):
                res = fetch_oneDriver_seasonResults((id,), (message["year"],))
                h2hDrivers.append(res)
            elif(message["mode"] == "team"):
                res = fetch_oneTeam_seasonResults((id,), (message["year"],))
                h2hDrivers.append(res)
        h2hDrivers.append(fetch_events_done_from(message["year"]))
        h2hDrivers.insert(0, fetch_events_from(message["year"]))
        h2hDrivers.insert(0, "H2HDriver fetched")
        data_json_h2hdrivers = json.dumps(h2hDrivers)
        await send_message_to_client(data_json_h2hdrivers)

    elif type=="teamRequest":
        teamData = fetch_teamData(message["teamID"])
        teamData.insert(0, "TeamData Fetched")
        data_json_teamData = json.dumps(teamData)
        await send_message_to_client(data_json_teamData)

    elif type=="editTeam":
        edit_team(message)
        process_repack("../result", path)
        info = ["Succesfully edited " + str(team_dict[message["teamID"]])]
        info_json = json.dumps(info)
        await send_message_to_client(info_json)
        argument = message["command"]

    elif type=="yearSelectedPrediction":
        events = [fetch_predictable_events_from(message["year"])]
        events.insert(0, message["year"])
        events.insert(0, "Events to Predict Fetched")
        data_json_events = json.dumps(events)
        await send_message_to_client(data_json_events)

    elif type=="yearSelectedPredictionModal":
        events = [fetch_predictable_events_from(message["year"])]
        events.insert(0, message["year"])
        events.insert(0, "Events to Predict Modal Fetched")
        data_json_events = json.dumps(events)
        await send_message_to_client(data_json_events)

    elif type=="predict":
        prediction = predict(message["race"], message["year"])
        prediction = list(prediction.values())
        prediction = sorted(prediction, key=lambda x: x['result'])
        pred_msg = ["Prediction Fetched", fetch_next_race(), prediction]
        data_json_prediction = json.dumps(pred_msg)
        await send_message_to_client(data_json_prediction)

    elif type == "predictMontecarlo":
        perc = await montecarlo(message["race"], message["year"], client)
        perd_msg = ["Montecarlo Fetched", perc]
        data_json_montecarlo = json.dumps(perd_msg)
        await send_message_to_client(data_json_montecarlo)

    elif type=="unretireDriver":
        unretire(message["driverID"])
        process_repack("../result", path)
        info = []
        info.insert(0, "Succesfully unretired " + message["driver"])
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    log.write("[" + str(datetime.now()) + "] INFO: Command executed: " + logtxt + "\n")
    log.flush()


async def send_message_to_client(message):
    if client:
        await client.send(message)

async def handle_client(websocket, path):
    global client
    client = websocket
    try:
        async for message in websocket:
            data = json.loads(message)
            await handle_command(data)
    except Exception as e:
        log.write("[" + str(datetime.now()) + "] EXCEPTION:" + str(e) + "\n")
        log.flush()
        info = []
        info.insert(0, "ERROR")
        info.insert(1, "Something went wrong. Please restart the tool")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)
    finally:
        client = None
        conn.commit()
        conn.close()


async def start_server():
    server = await websockets.serve(handle_client, "localhost", 8765)
    #print(server)
    await server.wait_closed()
    server.close()


def create_backup(originalFIle, saveFile):
    backup_path = "./../backup"
    if not os.path.exists(backup_path):
        os.makedirs(backup_path)
    new_file = backup_path + "/" + saveFile
    shutil.copy(originalFIle, new_file)

def fetch_driverNumebrs():
    numbers = cursor.execute("SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder IS NULL").fetchall()
    numList = []
    for num in numbers:
        if num[0] != 1 and num[0] != 0:
            numList.append(num[0])
    return numList

def fetch_teamsStadings(year):
    res = cursor.execute("SELECT TeamID, Position FROM Races_TeamStandings WHERE SeasonID = " + str(year) + " AND RaceFormula = 1").fetchall()
    return res

def fetch_driverRetirement(driverID):
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    retirement_age = cursor.execute("SELECT RetirementAge FROM Staff_GameData WHERE StaffID = " + str(driverID)).fetchone()
    dob = cursor.execute("SELECT DOB FROM Staff_BasicData WHERE StaffID = " + str(driverID)).fetchone()
    return [retirement_age[0], math.floor((day_season[0] - dob[0]) /365.25)]


def fetchDriverNumberDetails(driverID):
    num = cursor.execute("SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder =" + str(driverID)).fetchone()
    if num == None:
        nums = cursor.execute("SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder IS NULL").fetchall()
        num = random.choice(nums)
    wants1 = cursor.execute("SELECT WantsChampionDriverNumber FROM Staff_DriverData WHERE StaffID =" + str(driverID)).fetchone()

    return[num[0], wants1[0]]

def fetch_engines():
    engines_ids = [1,10,4,7]
    stats_ids = [6,10,11,12,14]
    ers_ids = [2, 11, 5, 8]
    gearboxes_ids = [3,12,6,9]
    lista = []
    for i in range(len(engines_ids)):
        statList = []
        for stat in stats_ids:
            res = cursor.execute("SELECT UnitValue FROM Parts_Designs_StatValues WHERE DesignID = " + str(engines_ids[i]) + " AND PartStat = " + str(stat)).fetchone()
            statList.append(res[0])
        ers_res = cursor.execute("SELECT UnitValue FROM Parts_Designs_StatValues WHERE DesignID = " + str(ers_ids[i]) + " AND PartStat = 15").fetchone()
        statList.append(ers_res[0])
        gearbox_res = cursor.execute("SELECT UnitValue FROM Parts_Designs_StatValues WHERE DesignID = " + str(gearboxes_ids[i]) + " AND PartStat = 15").fetchone()
        statList.append(gearbox_res[0])
        engineInfo = (engines_ids[i], statList)
        lista.append(engineInfo)

    return lista



async def main():
    await start_server()

def fetch_driverContract(id):
    details = cursor.execute("SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos FROM Staff_Contracts WHERE ContractType = 0 AND StaffID = " + str(id)).fetchone()
    return details

def fetch_staff():
    staff = cursor.execute("SELECT DISTINCT bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, gam.StaffType FROM Staff_GameData gam JOIN Staff_BasicData bas ON gam.StaffID = bas.StaffID  LEFT JOIN Staff_Contracts con ON bas.StaffiD = con.StaffID WHERE gam.StaffType != 0 AND (con.ContractType = 0 OR con.ContractType IS NULL OR con.ContractType = 3) GROUP BY bas.StaffID ORDER BY CASE WHEN con.TeamID IS NULL THEN 1 ELSE 0 END, con.TeamID").fetchall()
    formatted_tuples = []

    for tupla in staff:
        result = format_names_get_stats(tupla, "staff"+str(tupla[4]))
        formatted_tuples.append(result)

    return formatted_tuples

def fetch_seasonResults(yearSelected): 
    year =  (yearSelected, )
    drivers = cursor.execute("SELECT DriverID FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = " + str(year[0])).fetchall()
    seasonResults = []
    for driver in drivers:
            driverRes = fetch_oneDriver_seasonResults(driver, year)
            if(driverRes):
                seasonResults.append(driverRes)
    return seasonResults

def fetch_oneTeam_seasonResults(team, year):
    drivers = cursor.execute("SELECT DISTINCT DriverID FROM Races_Results WHERE Season = " + str(year[0]) + " AND TeamID = " + str(team[0])).fetchall()
    results = [fetch_oneDriver_seasonResults(driver, year) for driver in drivers]
    return results

def fetch_oneDriver_seasonResults(driver, year):
    results = cursor.execute("SELECT DriverID, TeamID, FinishingPos, Points FROM Races_Results WHERE Season = " + str(year[0]) + " AND DriverID = " + str(driver[0])).fetchall()
    if results:
        sprintResults = cursor.execute("SELECT RaceID, FinishingPos, ChampionshipPoints FROM Races_SprintResults WHERE SeasonID = " + str(year[0]) + " AND DriverID = " + str(driver[0])).fetchall()
        teamID = results[0][1]
        driverName = cursor.execute("SELECT FirstName, LastName FROM Staff_BasicData WHERE StaffID = " + str(driver[0])).fetchone()
        return format_seasonResults(results, driverName, teamID, driver, year, sprintResults)
    

def fetch_predictable_events_from(year):
    last_predictable = fetch_next_race()
    season_events = cursor.execute("SELECT TrackID FROM Races WHERE SeasonID = " + str(year) + " AND RaceID <= " + str(last_predictable[0])).fetchall()
    tuple_numbers = {num for tpl in season_events for num in tpl}
    season_ids = cursor.execute("SELECT RaceID FROM Races WHERE SeasonID = " + str(year) + " AND RaceID <= " + str(last_predictable[0])).fetchall()
    events_ids =[]
    for i in range(len(season_ids)):
        events_ids.append((season_ids[i][0], season_events[i][0]))

    return events_ids

def fetch_events_done_from(year):
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    season_ids = cursor.execute("SELECT RaceID FROM Races WHERE SeasonID = " + str(year) + " AND Day < " + str(day_season[0])).fetchall()
    events_ids =[]
    for i in range(len(season_ids)):
        events_ids.append((season_ids[i][0]))

    return events_ids

def fetch_events_from(year):
    season_events = cursor.execute("SELECT TrackID FROM Races WHERE SeasonID = " + str(year)).fetchall()
    tuple_numbers = {num for tpl in season_events for num in tpl}

    season_ids = cursor.execute("SELECT RaceID FROM Races WHERE SeasonID = " + str(year)).fetchall()
    events_ids =[]
    for i in range(len(season_ids)):
        events_ids.append((season_ids[i][0], season_events[i][0]))

    return events_ids

def format_seasonResults(results, driverName, teamID, driverID, year, sprints):
    nombre_pattern = r'StaffName_Forename_(Male|Female)_(\w+)'
    apellido_pattern = r'StaffName_Surname_(\w+)'

    nombre_match = re.search(nombre_pattern, driverName[0])
    apellido_match = re.search(apellido_pattern, driverName[1])

    nombre = remove_number(nombre_match.group(2))
    apellido = remove_number(apellido_match.group(1))
    name_formatted = f"{nombre} {apellido}"
    
    races_participated = cursor.execute("SELECT RaceID FROM Races_Results WHERE DriverID = " + str(driverID[0]) + " AND Season = " + str(year[0])).fetchall()
    formatred_results = [(result[-2], result[-1]) for result in results]
    for i in range(len(races_participated)):
        driver_with_fastest_lap = cursor.execute("SELECT DriverID FROM Races_Results WHERE FastestLap > 0 AND RaceID = "+ str(races_participated[i][0]) + " AND Season = " + str(year[0]) + " ORDER BY FastestLap LIMIT 1; ").fetchone()
        driver_with_pole = cursor.execute("SELECT DriverID FROM Races_QualifyingResults WHERE QualifyingStage = 3 AND FinishingPos = 1 AND RaceID = " + str(races_participated[i][0])).fetchone()
        dnfd = cursor.execute("SELECT DNF FROM Races_Results WHERE DriverID = " + str(driverID[0]) + " AND Season = " + str(year[0]) + " AND RaceID = " + str(races_participated[i][0])).fetchone()
        formatred_results[i] = (races_participated[i][0],)  + formatred_results[i]
        if dnfd[0] == 1:
            results_list = list(formatred_results[i])
            results_list[-1] = -1
            results_list[-2] = -1
            formatred_results[i] = tuple(results_list)
        if driver_with_fastest_lap[0] == driverID[0]:
            results_list = list(formatred_results[i])
            results_list.append(1)
            formatred_results[i] = tuple(results_list)
        else:
            results_list = list(formatred_results[i])
            results_list.append(0)
            formatred_results[i] = tuple(results_list)
        QStage = cursor.execute("SELECT MAX(QualifyingStage) FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(races_participated[i][0]) + " AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driverID[0])).fetchone()
        QRes = cursor.execute("SELECT FinishingPos FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID =" + str(races_participated[i][0]) + " AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driverID[0]) + " AND QualifyingStage = " + str(QStage[0])).fetchone()
        results_list = list(formatred_results[i])
        results_list.append(QRes[0])
        formatred_results[i] = tuple(results_list)


    for tupla1 in sprints:
        for i, tupla2 in enumerate(formatred_results):
            if tupla1[0] == tupla2[0]:
                formatred_results[i] = tupla2 + (tupla1[2], tupla1[1])

    for i in range(len(formatred_results)):
        team_in_race = cursor.execute("SELECT TeamID FROM Races_Results WHERE RaceID = " + str(formatred_results[i][0]) + " AND DriverID = " + str(driverID[0])).fetchone()
        formatred_results[i] += (team_in_race)

    
    position = cursor.execute("SELECT Position FROM Races_Driverstandings WHERE RaceFormula = 1 AND SeasonID = " + str(year[0]) + " AND DriverID = " + str(driverID[0])).fetchone()

    formatred_results.insert(0, position[0])
    formatred_results.insert(0, teamID)
    formatred_results.insert(0, name_formatted)
    return formatred_results

def fetch_drivers_per_year(year):
    drivers = cursor.execute('SELECT  bas.FirstName, bas.LastName, res.DriverID, res.TeamID FROM Staff_BasicData bas JOIN Races_Results res ON bas.StaffID = res.DriverID WHERE Season = ' + str(year) + " GROUP BY bas.FirstName, bas.LastName, bas.StaffID, res.TeamID ORDER BY res.TeamID").fetchall()
    formatted_tuples = []
    for tupla in drivers:
        result = format_names_simple(tupla)
        formatted_tuples.append(result)
    return formatted_tuples

def fetch_info():

    drivers = cursor.execute('SELECT DISTINCT bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, con.PosInTeam, MIN(con.ContractType) AS MinContractType, gam.Retired FROM Staff_BasicData bas JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID LEFT JOIN Staff_Contracts con ON dri.StaffID = con.StaffID LEFT JOIN Staff_GameData gam ON dri.StaffID = gam.StaffID GROUP BY bas.StaffID ORDER BY CASE WHEN con.TeamID IS NULL THEN 1 ELSE 0 END, con.TeamID;').fetchall()
    formatted_tuples = []
    for tupla in drivers:
        result = format_names_get_stats(tupla, "driver")
        formatted_tuples.append(result)

    return formatted_tuples

def fetch_next_race():
    race = cursor.execute("SELECT MIN(RaceID) FROM Races WHERE State = 0").fetchone()
    if race[0] == None:
        race = cursor.execute("SELECT MAX(RaceID) FROM Races WHERE State = 2").fetchone()
        race = (race[0]+1,)
    return race

def fetch_calendar():
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    calendar = cursor.execute("SELECT TrackID, WeatherStateQualifying, WeatherStateRace, WeekendType, State FROM Races WHERE SeasonID = " + str(day_season[1])).fetchall()
    return calendar

def check_claendar():
    default_tracks = [2, 1, 11, 24, 22, 5, 6, 4, 7, 10, 9, 12, 13, 14, 15, 17, 19, 18, 20, 21, 23, 25, 26]
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    season_events = cursor.execute("SELECT TrackID FROM Races WHERE SeasonID = " + str(day_season[1])).fetchall()
    tuple_numbers = {num for tpl in season_events for num in tpl}
    first_race = cursor.execute("SELECT MIN(Day) FROM Races WHERE SeasonID = " + str(day_season[1])).fetchone()
    last_race_last_season = cursor.execute("SELECT MAX(RaceID) FROM Races WHERE SeasonID = " + str(day_season[1]-1)).fetchone()
    first_race_curr_season = cursor.execute("SELECT MIN(RaceID) FROM Races WHERE SeasonID = " + str(day_season[1])).fetchone()


    season_ids = cursor.execute("SELECT RaceID FROM Races WHERE SeasonID = " + str(day_season[1])).fetchall()
    events_ids =[]
    for i in range(len(season_ids)):
        events_ids.append((season_ids[i][0], season_events[i][0]))

    are_all_numbers_present = all(num in tuple_numbers for num in default_tracks)
    has_first_race_done = day_season[0] < first_race[0]
    has_been_edited = last_race_last_season[0] + 1 == first_race_curr_season[0]

    # Definir la variable resultante
    resultCalendar = "1" if (are_all_numbers_present and has_first_race_done and has_been_edited) else "0"

    return resultCalendar

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

def format_names_get_stats(name, type):
    nombre_pattern = r'StaffName_Forename_(Male|Female)_(\w+)'
    apellido_pattern = r'StaffName_Surname_(\w+)'


    nombre_match = re.search(nombre_pattern, name[0])
    apellido_match = re.search(apellido_pattern, name[1])


    nombre = remove_number(nombre_match.group(2))
    apellido = remove_number(apellido_match.group(1))
    name_formatted = f"{nombre} {apellido}"
    team_id = name[3] if name[3] is not None else 0
    pos_in_team = name[4] if name[4] is not None else 0
    if type =="driver" and name[5] != 0:
        team_id = 0
        pos_in_team = 0

    if type == "driver":
        resultado = (name_formatted, name[2], team_id, pos_in_team, name[6])
    else:
        resultado = (name_formatted, name[2], team_id, pos_in_team)

    if type == "driver":
        stats = cursor.execute("SELECT Val FROM Staff_PerformanceStats WHERE StaffID = " + str(name[2]) + " AND StatID BETWEEN 2 AND 10").fetchall()
        additionalStats = cursor.execute("SELECT Improvability, Aggression FROM Staff_DriverData WHERE StaffID = " + str(name[2])).fetchone()
        nums = resultado + tuple(stat[0] for stat in stats) + additionalStats

        return nums

    elif type == "staff1":
        stats = cursor.execute("SELECT Val FROM Staff_PerformanceStats WHERE StaffID = " + str(name[2]) + " AND StatID IN (0,1,14,15,16,17);").fetchall()
        nums = resultado + tuple(stat[0] for stat in stats)

        return nums

    elif type == "staff2":
        stats = cursor.execute("SELECT Val FROM Staff_PerformanceStats WHERE StaffID = " + str(name[2]) + " AND StatID IN (13,25,43);").fetchall()
        nums = resultado + tuple(stat[0] for stat in stats)

        return nums

    elif type == "staff3":
        stats = cursor.execute("SELECT Val FROM Staff_PerformanceStats WHERE StaffID = " + str(name[2]) + " AND StatID IN (19,20,26,27,28,29,30,31);").fetchall()
        nums = resultado + tuple(stat[0] for stat in stats)

        return nums

    elif type == "staff4":
        stats = cursor.execute("SELECT Val FROM Staff_PerformanceStats WHERE StaffID = " + str(name[2]) + " AND StatID IN (11,22,23,24);").fetchall()
        nums = resultado + tuple(stat[0] for stat in stats)

        return nums

def remove_number(cadena):
    if cadena and cadena[-1].isdigit():
        cadena = cadena[:-1]
    return cadena

asyncio.run(main())

