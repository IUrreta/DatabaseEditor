import asyncio
import websockets
import json
import sqlite3
import re
import os
from datetime import datetime
import shutil
from scripts.extractor import process_unpack, process_repack
from scripts.transfer_driver_23 import run_script as run_trasnsfer
from scripts.edit_stats_23 import run_script as run_editStats
from scripts.custom_calendar_23 import run_script as run_editCalendar
from scripts.car_performance_23 import run_script as run_editPerformance
from scripts.engine_performance_23 import run_script as run_editEngine

client = None
path = None
log = open("../../../log.txt", 'a', encoding='utf-8')
conn = None
cursor = None


async def handle_command(message):
    type = message["command"]
    global path
    global conn
    global cursor
    argument = ""
    if type == "connect":
        #print("Connect recibido")
        argument = type
        saves = [element for element in os.listdir("../../../") if ".sav" in element]
        if "player.sav" in saves:
            saves.remove("player.sav")
        saves.insert(0, "Connected Succesfully")
        data_saves = json.dumps(saves)
        await send_message_to_client(data_saves)

    elif type == "saveSelected":
        save = message["save"]
        argument = type + " " + save
        path = "../../../" + save
        process_unpack(path, "../../../result")
        conn = sqlite3.connect("../../../result/main.db")
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
        allowCalendar = [tuple(check_claendar())]
        allowCalendar.insert(0, "Calendar fetched")
        data_json_calendar = json.dumps(allowCalendar)
        await send_message_to_client(data_json_calendar)
        create_backup(path, save)

    elif type =="hire":
        argument = "hire " + message["driverID"] + " " + str(message["teamID"]) + " " + message["position"] + " " + message["salary"] + " " + message["signBonus"] + " " + message["raceBonus"] + " " + message["raceBonusPos"] + " " + message["year"]
        run_trasnsfer(argument)
        process_repack("../../../result", path)
        info = []
        info.insert(0, "Succesfully moved " + message["driver"] + " into " + message["team"])
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type =="fire":
        argument = "fire " + message["driverID"]
        run_trasnsfer(argument)
        process_repack("../../../result", path)
        info = []
        info.insert(0, "Succesfully released " + message["driver"] + " from " + message["team"])
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type =="autocontract":
        argument = "hire " + message["driverID"] + " " +  str(message["teamID"]) + " " + message["position"]
        run_trasnsfer(argument)
        process_repack("../../../result", path)
        info = []
        info.insert(0, "Succesfully moved " + message["driver"] + " into " + message["team"])
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type=="swap":
        argument = "swap " + message["driver1ID"] + " " + message["driver2ID"]
        run_trasnsfer(argument)
        process_repack("../../../result", path)
        info = []
        info.insert(0, "Succesfully swapped " + message["driver1"] + " and  " + message["driver2"])
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type =="editStats":
        run_editStats(message["driverID"] + " " + message["typeStaff"] + " " + message["statsArray"])
        argument = type + " " + message["driverID"] + " " + message["typeStaff"] + " " + message["statsArray"]
        process_repack("../../../result", path)
        info = []
        info.insert(0, "Succesfully edited " + message["driver"] + "'s stats")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type=="calendar":
        run_editCalendar(message["calendarCodes"])
        process_repack("../../../result", path)
        argument = type + message["calendarCodes"]
        info = []
        info.insert(0, "Succesfully edited the calendar")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type=="requestDriver":
        contractDetails = fetch_driverContract(message["driverID"])
        contractMsg = [contractDetails]
        contractMsg.insert(0, "Contract fetched")
        data_json_contract = json.dumps(contractMsg)
        await send_message_to_client(data_json_contract)

    elif type=="editContract":
        argument = "editContract " + message["salary"] + " " + message["year"] + " " + message["signBonus"] + " " + message["raceBonus"] + " " + message["raceBonusPos"] + " " +  str(message["driverID"])
        run_trasnsfer(argument)
        process_repack("../../../result", path)
        info = []
        info.insert(0, "Succesfully edited " + message["driver"] + "'s contract")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)

    elif type =="editPerformance":
        argument = message["teamID"] + " " + message["performanceArray"]
        run_editPerformance(argument)
        process_repack("../../../result", path)
        info = []
        info.insert(0, "Succesfully edited " + message["teamName"] + "'s car performance")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)
        argument = "editPerformance " +  message["teamID"] + " " + message["performanceArray"]

    elif type=="editEngine":
        argument = message["engineID"] +  " " + message["teamEngineID"] + " " +  message["performanceArray"]
        run_editEngine(argument)
        process_repack("../../../result", path)
        info = []
        info.insert(0, "Succesfully edited all " + message["team"] + " engines performance")
        info_json = json.dumps(info)
        await send_message_to_client(info_json)


    log.write("[" + str(datetime.now()) + "] INFO: Command executed: " + argument + "\n")
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
    backup_path = "./../../../backup"
    if not os.path.exists(backup_path):
        os.makedirs(backup_path)
    new_file = backup_path + "/" + saveFile
    shutil.copy(originalFIle, new_file)


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
    staff = cursor.execute("SELECT bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, gam.StaffType FROM Staff_GameData gam JOIN Staff_BasicData bas ON gam.StaffID = bas.StaffID  LEFT JOIN Staff_Contracts con ON bas.StaffiD = con.StaffID WHERE gam.StaffType != 0;").fetchall()
    formatted_tuples = []

    for tupla in staff:
        result = format_names_get_stats(tupla, "staff"+str(tupla[4]))
        formatted_tuples.append(result)
    return formatted_tuples

def fetch_info():

    drivers = cursor.execute('SELECT  bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, con.PosInTeam FROM Staff_BasicData bas JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID LEFT JOIN Staff_Contracts con ON dri.StaffID = con.StaffID WHERE ContractType = 0 OR ContractType IS NULL;').fetchall()
    formatted_tuples = []
    for tupla in drivers:
        result = format_names_get_stats(tupla, "driver")
        formatted_tuples.append(result)
    
    return formatted_tuples

def check_claendar():
    default_tracks = [2, 1, 11, 24, 22, 5, 6, 4, 7, 10, 9, 12, 13, 14, 15, 17, 19, 18, 20, 21, 23, 25, 26]
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    season_events = cursor.execute("SELECT TrackID FROM Races WHERE SeasonID = " + str(day_season[1])).fetchall()
    tuple_numbers = {num for tpl in season_events for num in tpl}

    are_all_numbers_present = all(num in tuple_numbers for num in default_tracks)

    # Definir la variable resultante
    resultCalendar = "1" if are_all_numbers_present else "0"

    return resultCalendar
    

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

