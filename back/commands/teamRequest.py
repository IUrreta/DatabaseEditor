from commands.command import Command
from scripts.edit_teams import fetch_teamData
import json

class TeamRequestCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        teamData = fetch_teamData(self.message["teamID"], self.message["saveSelected"])
        teamData.insert(0, "TeamData Fetched")
        data_json_teamData = json.dumps(teamData)
        await self.send_message_to_client(data_json_teamData)