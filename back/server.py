import asyncio
import websockets
import json
import sqlite3
import re
from scripts.extractor import process_unpack, process_repack
from scripts.transfer_driver_23 import run_script

client = None

async def handle_command(message):
    type = message["command"]
    if type == "connect":
        process_unpack("../save1.sav", "../result")
        drivers = fetch_drivers()
        data_json = json.dumps(drivers)
        await send_message_to_client(data_json)


    # elif type =="hire":
        # run_script()
    elif type =="fire":
        run_script("fire ")


async def send_message_to_client(message):
    if client:
        await client.send(message)

async def handle_client(websocket, path):
    global client
    client = websocket
    try:
        # Bucle para manejar mensajes entrantes desde el cliente
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


async def main():
    await start_server()

def fetch_drivers():
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    drivers = cursor.execute('SELECT  bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, con.PosInTeam FROM Staff_BasicData bas JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID LEFT JOIN Staff_Contracts con ON dri.StaffID = con.StaffID').fetchall()
    print(drivers)
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

    
    nombre = nombre_match.group(2)
    apellido = remove_number(apellido_match.group(1))
    print(apellido)
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

