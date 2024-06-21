import asyncio
import websockets
import json
import os
from datetime import datetime
import shutil
from commands.commandFactory import CommandFactory

class ApplicationState:
    def __init__(self, logFile, factory):
        self.client = None
        self.log = logFile
        self.factory = factory

    async def new_handler(self, message, client):
        command = self.factory.create_command(message, client)
        # print(message) #for debugging
        await command.execute()
        logtxt = str(message)
        self.log.write(f"[{str(datetime.now())}] INFO: Command executed: {logtxt}\n")
        self.log.flush()


async def send_message_to_client(message, client):
    if client:
        await client.send(message)

async def handle_client(websocket, path, app_state):
    # print("Client connected")
    client = websocket
    try:
        async for message in websocket:
            data = json.loads(message)
            await app_state.new_handler(data, client)
    except Exception as e:
        print(e)
        app_state.log.write(f"[{str(datetime.now())}] EXCEPTION: {str(e)}\n")
        app_state.log.flush()
        info = []
        info.insert(0, "ERROR")
        info.insert(1, "Something went wrong. Please restart the tool")
        info_json = json.dumps(info)
        await send_message_to_client(info_json, client)
    finally:
        client = None
        # conn.commit()
        # conn.close()


async def main():
    log = open("../log.txt", 'a', encoding='utf-8')
    factory = CommandFactory()
    app_state = ApplicationState(log, factory)
    await start_server(app_state)

async def start_server(app_state):
    server = await websockets.serve(lambda ws, path: handle_client(ws, path, app_state), "localhost", 8765)
    await server.wait_closed()


if __name__ == "__main__":
    asyncio.run(main())

