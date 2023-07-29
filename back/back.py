import asyncio
import websockets
import json
import sqlite3
import re
import os
from scripts.extractor import process_unpack, process_repack
from scripts.transfer_driver_23 import run_script

client = None
path = None

async def handle_command(message):
    type = message["command"]
    global path    
    if type == "connect":
        saves = [element for element in os.listdir("../") if ".sav" in element]
        if "player.sav" in saves:
            saves.remove("player.sav")
        saves.insert(0, "saveList")
        data_saves = json.dumps(saves)
        await send_message_to_client(data_saves)
    elif type == "saveSelected":
        save = message["save"]
        path = "../" + save
        process_unpack(path, "../result")
        drivers = fetch_drivers()
        data_json = json.dumps(drivers)
        await send_message_to_client(data_json)

    elif type =="hire":
        run_script("hire " + message["driver"] + " " + str(message["teamID"]) + " " + message["position"] + " " + message["salary"] + " " + message["signBonus"] + " " + message["raceBonus"] + " " + message["raceBonusPos"] + " " + message["year"])
        process_repack("../result", path)
    elif type =="fire":
        run_script("fire " + message["driver"])
        process_repack("../result", path)


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
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        client = None
        

async def start_server():
    server = await websockets.serve(handle_client, "localhost", 8765)
    await server.wait_closed()
    server.shutdown(1)
    server.close()


async def main():
    await start_server()

def fetch_drivers():
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    drivers = cursor.execute('SELECT  bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, con.PosInTeam FROM Staff_BasicData bas JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID LEFT JOIN Staff_Contracts con ON dri.StaffID = con.StaffID WHERE ContractType = 0 OR ContractType IS NULL;').fetchall()
    formatted_tuples = []
    for tupla in drivers:
         result = format_names(tupla)
         formatted_tuples.append(result)
    
    return formatted_tuples

def format_names(name):
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

    return resultado

def remove_number(cadena):
    if cadena and cadena[-1].isdigit():
        cadena = cadena[:-1]
    return cadena

asyncio.run(main())

