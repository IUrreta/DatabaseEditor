from commands.command import Command
from scripts.predictor import montecarlo
import json

class PredictMontecarloCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        perc = await montecarlo(self.message["race"], self.message["year"], self.client)
        perd_msg = ["Montecarlo Fetched", perc]
        data_json_montecarlo = json.dumps(perd_msg)
        await self.send_message_to_client(data_json_montecarlo)