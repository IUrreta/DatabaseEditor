from commands.command import Command
import json

class YearSelectedCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        results = self.dbutils.fetch_seasonResults(self.message["year"])
        results.insert(0, self.dbutils.fetch_events_from(self.message["year"]))
        results.insert(0, "Results fetched")
        results.append(self.dbutils.fetch_teamsStadings(self.message["year"]))
        data_json_results = json.dumps(results)
        #argument = json.dumps(message)
        await self.send_message_to_client(data_json_results)