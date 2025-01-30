from commands.command import Command
from scripts.transfer_driver import TransferUtils
from scripts.extractor import process_repack

import json

class AutoContractCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        transfer_utils = TransferUtils()
        transfer_utils.hire_driver("auto", self.message['driverID'], self.message['teamID'], self.message['position'], year_iteration=Command.year_iterarion)
        process_repack("../result", Command.path)
        info = []
        info.insert(0, f"Succesfully moved {self.message['driver']} into {self.team_replace_dict[self.message['team']]}")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)