from commands.command import Command
from scripts.transfer_driver_23 import run_script as run_trasnsfer
from scripts.extractor import process_repack

import json

class SwapCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
            argument = "swap " + self.message["driver1ID"] + " " + self.message["driver2ID"]
            run_trasnsfer(argument)
            process_repack("../result", Command.path)
            info = []
            info.insert(0, "Succesfully swapped " + self.message["driver1"] + " and  " + self.message["driver2"])
            info_json = json.dumps(info)
            await self.send_message_to_client(info_json)