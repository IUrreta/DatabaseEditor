import asyncio
import websockets
import json
import sqlite3
import re
import os
from datetime import datetime
from scripts.extractor import process_unpack, process_repack
from scripts.transfer_driver_23 import run_script as run_trasnsfer
from scripts.edit_stats_23 import run_script as run_editStats

client = None
path = None
log = open("../log.txt", 'a', encoding='utf-8')
conn = None
cursor = None


async def handle_command(message):
    type = message["command"]
    global path
    global conn
    global cursor
    argument = ""
    if type == "connect":
        argument = type
        saves = [element for element in os.listdir("../") if ".sav" in element]
        if "player.sav" in saves:
            saves.remove("player.sav")
        saves.insert(0, "Connected Succesfully")
        data_saves = json.dumps(saves)
        await send_message_to_client(data_saves)

    elif type == "saveSelected":
        save = message["save"]
        argument = type + " " + save
        path = "../" + save
        process_unpack(path, "../result")
        conn = sqlite3.connect("../result/main.db")
        cursor = conn.cursor()
        drivers = fetch_drivers()
        drivers.insert(0, "Save Loaded Succesfully")
        data_json = json.dumps(drivers)
        await send_message_to_client(data_json)

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

    elif type =="editStats":
        run_editStats(message["driverID"] + " " + message["statsArray"])
        argument = type + " " + message["driverID"] + " " + message["statsArray"]
        process_repack("../result", path)
        info = []
        info.insert(0, "Succesfully edited " + message["driver"] + "'s stats")
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
    await server.wait_closed()
    server.shutdown(1)
    server.close()


async def main():
    await start_server()

def fetch_drivers():

    drivers = cursor.execute('SELECT  bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, con.PosInTeam FROM Staff_BasicData bas JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID LEFT JOIN Staff_Contracts con ON dri.StaffID = con.StaffID WHERE ContractType = 0 OR ContractType IS NULL;').fetchall()
    formatted_tuples = []
    for tupla in drivers:
        result = format_names_get_stats(tupla)
        formatted_tuples.append(result)
    
    return formatted_tuples

def format_names_get_stats(name):
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

    stats = cursor.execute("SELECT Val FROM Staff_PerformanceStats WHERE StaffID = " + str(name[2]) + " AND StatID BETWEEN 2 AND 10").fetchall()

    nums = resultado + tuple(stat[0] for stat in stats)

    return nums

def remove_number(cadena):
    if cadena and cadena[-1].isdigit():
        cadena = cadena[:-1]
    return cadena

asyncio.run(main())

