import json
import os
from commands.command import Command


class ConnectCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        saves = [element for element in os.listdir("../") if ".sav" in element]
        if "player.sav" in saves:
            saves.remove("player.sav")
        saves.insert(0, "Connected Succesfully")
        data_saves = json.dumps(saves)
        await self.send_message_to_client(data_saves)
        await self.send_message_to_client(json.dumps(["JIC"])) 
        
