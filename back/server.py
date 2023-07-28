import asyncio
import websockets
import json
from scripts.extractor import process_unpack, process_repack
from scripts.transfer_driver_23 import run_script


def handle_command(message):
    type = message["command"]
    if type == "connect":
        process_unpack("../saveF23.sav", "../result")
    # elif type =="hire":
        # run_script()
    elif type =="fire":
        run_script("fire ")


async def receive(websocket, path):
    async for message in websocket:
        data = json.loads(message)
        handle_command(data)
        

start_server = websockets.serve(receive, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
