from commands.command import Command
from scripts.extractor import process_repack
from scripts.edit_stats_23 import run_script as run_editStats

import json

class EditStatsCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        argument = f"{self.message['driverID']} {self.message['typeStaff']} {self.message['statsArray']}"
        run_editStats(argument)
        process_repack("../result", Command.path)
        info = []
        info.insert(0, f"Succesfully edited {self.message['driver']}'s stats")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)