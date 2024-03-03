from commands.command import Command
from scripts.head2head_23 import fetch_Head2Head, fetch_Head2Head_team
import json

class H2HConfiguredCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        if(self.message["h2h"] != -1):
            if(self.message["mode"] == "driver"):
                h2hRes = fetch_Head2Head((self.message["h2h"][0],), (self.message["h2h"][1],), (self.message["year"],))
                h2h = ["H2H fetched", h2hRes]
                data_json_h2h = json.dumps(h2h)
                await self.send_message_to_client(data_json_h2h)
            elif(self.message["mode"] == "team"):
                h2hRes = fetch_Head2Head_team((self.message["h2h"][0],), (self.message["h2h"][1],), (self.message["year"],))
                h2h = ["H2H fetched", h2hRes]
                data_json_h2h = json.dumps(h2h)
                await self.send_message_to_client(data_json_h2h)
        h2hDrivers = []
        for id in self.message["graph"]:
            if(self.message["mode"] == "driver"):
                res = self.dbutils.fetch_oneDriver_seasonResults((id,), (self.message["year"],))
                h2hDrivers.append(res)
            elif(self.message["mode"] == "team"):
                res = self.dbutils.fetch_oneTeam_seasonResults((id,), (self.message["year"],))
                h2hDrivers.append(res)
        h2hDrivers.append(self.dbutils.fetch_events_done_from(self.message["year"]))
        h2hDrivers.insert(0, self.dbutils.fetch_events_from(self.message["year"]))
        h2hDrivers.insert(0, "H2HDriver fetched")
        data_json_h2hdrivers = json.dumps(h2hDrivers)
        await self.send_message_to_client(data_json_h2hdrivers)