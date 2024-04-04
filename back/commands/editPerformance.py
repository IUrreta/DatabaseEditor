from commands.command import Command
from scripts.extractor import process_repack
from scripts.car_performance_23 import run_script as run_editPerformance
import json

class EditPerformanceCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        argument = f"{self.message['teamID']} {self.message['performanceArray']}"
        run_editPerformance(argument)
        process_repack("../result", Command.path)
        info = []
        info.insert(0, f"Succesfully edited {self.team_replace_dict[self.message['teamName']]}'s car performance")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)