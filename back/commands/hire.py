from commands.command import Command
from scripts.transfer_driver_23 import run_script as run_trasnsfer
from scripts.extractor import process_repack

import json

class HireCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        argument = f"hire {self.message['driverID']} {self.message['teamID']} {self.message['position']} {self.message['salary']} {self.message['signBonus']} {self.message['raceBonus']} {self.message['raceBonusPos']} {self.message['year']}"
        run_trasnsfer(argument)
        process_repack("../result", Command.path)
        info = []
        info.isnert(0, f"Succesfully moved {self.message['driver']} into {self.team_replace_dict[self.message['team']]}")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)