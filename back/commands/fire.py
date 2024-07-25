from commands.command import Command
from scripts.transfer_driver_23 import TransferUtils
from scripts.extractor import process_repack

import json

class FireCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        transfer_utils = TransferUtils()
        transfer_utils.fire_driver(self.message['driverID'], self.message['teamID'])
        process_repack("../result", Command.path)
        info = []
        info.insert(0, f"Succesfully fired {self.message['driver']} from {self.team_replace_dict[self.message['team']]}")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)