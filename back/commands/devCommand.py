import json
import os
from commands.command import Command
from scripts.extractor import process_repack


class DevCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        print(self.message)
        if (self.message["type"] == "hard"):
            Command.dbutils.add_hard_diff_trigger("add")
            message_to_send = "Succesfully added hard difficulty"
        elif (self.message["type"] == "nohard"):
            Command.dbutils.add_hard_diff_trigger("remove")
            message_to_send = "Succesfully removed hard difficulty"
        process_repack("../result", Command.path)
        info = []
        info.insert(0, message_to_send)
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)
            
        