from commands.command import Command
from scripts.edit_teams import edit_team
from scripts.extractor import process_repack
import json

class YearSelectedPredictionCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        events = [Command.dbutils.fetch_predictable_events_from(self.message["year"])]
        events.insert(0, self.message["year"])
        events.insert(0, "Events to Predict Fetched")
        data_json_events = json.dumps(events)
        await self.send_message_to_client(data_json_events)
