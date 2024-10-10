import asyncio
import websockets
import json
import os
from datetime import datetime
import logging
import traceback
from commands.commandFactory import CommandFactory

class ApplicationState:
    def __init__(self, logger, factory):
        self.client = None
        self.logger = logger
        self.factory = factory

    async def new_handler(self, message, client):
        command = self.factory.create_command(message, client)
        # print(message) # for debugging
        logtxt = str(message)
        self.logger.info(f"Command received: {logtxt}")
        await command.execute()



async def send_message_to_client(message, client):
    if client:
        await client.send(message)

async def handle_client(websocket, path, app_state):
    client = websocket
    try:
        async for message in websocket:
            data = json.loads(message)
            print(data)
            await app_state.new_handler(data, client)
    except Exception as e:
        traceback.print_exc()
        app_state.logger.exception("Exception occurred while handling client message")
        info = ["ERROR", "Something went wrong. Please restart the tool"]
        info_json = json.dumps(info)
        await send_message_to_client(info_json, client)
    finally:
        client = None

async def main():
    logger = logging.getLogger('dbeditor')
    logger.setLevel(logging.INFO)
    handler = logging.FileHandler('../log.txt', encoding='utf-8')
    formatter = logging.Formatter('%(asctime)s %(levelname)s: %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    factory = CommandFactory()
    app_state = ApplicationState(logger, factory)
    await start_server(app_state)

async def start_server(app_state):
    server = await websockets.serve(lambda ws, path: handle_client(ws, path, app_state), "localhost", 8765)
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
