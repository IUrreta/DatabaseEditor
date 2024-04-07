from commands.command import Command
import json

class YearSelectedPredictionModalCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        events = [Command.dbutils.fetch_predictable_events_from(self.message["year"])]
        events.insert(0, self.message["year"])
        events.insert(0, "Events to Predict Modal Fetched")
        data_json_events = json.dumps(events)
        await self.send_message_to_client(data_json_events)
