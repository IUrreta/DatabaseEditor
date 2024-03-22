from commands.command import Command
from scripts.edit_teams import edit_team
from scripts.extractor import process_repack
import json

class EditTeamCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        team_dict = {"1": "Ferrari", "2": "McLaren", "3": "Red Bull", "4": "Mercedes", "5": "Alpine", "6": "Williams", "7": "Haas", "8": "Alfa Romeo", "9": "AlphaTauri", "10": "Aston Martin"}
        edit_team(self.message)
        process_repack("../result", Command.path)
        info = [f"Succesfully edited {team_dict[self.message['teamID']]}"]
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)
