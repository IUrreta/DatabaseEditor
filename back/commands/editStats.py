from commands.command import Command
from scripts.extractor import process_repack
from scripts.edit_stats_23 import edit_stats as run_editStats, edit_mentality, edit_superlicense

import json

class EditStatsCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        argument = f"{self.message['driverID']} {self.message['typeStaff']} {self.message['statsArray']} {self.message['retirement']} "
        print(self.message)
        if self.message['typeStaff'] == "0":
            argument += f"{self.message['driverNum']} {self.message['wants1']}"
            edit_superlicense(self.message['driverID'], self.message['superLicense'])
        run_editStats(argument)
        if self.message['mentality'] != -1 and Command.year_iterarion == "24":
            edit_mentality(f"{self.message['driverID']} {self.message['mentality']}")
        process_repack("../result", Command.path)
        info = []
        info.insert(0, f"Succesfully edited {self.message['driver']}'s stats")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)