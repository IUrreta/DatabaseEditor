from commands.command import Command
import json

class YearSelectedH2HCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        drivers = self.dbutils.fetch_drivers_per_year(self.message["year"])
        drivers.insert(0, "DriversH2H fetched")
        data_json_drivers = json.dumps(drivers)
        await self.send_message_to_client(data_json_drivers)