from commands.command import Command
from scripts.predictor import predict
import json

class PredictCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        prediction = predict(self.message["race"], self.message["year"])
        prediction = list(prediction.values())
        prediction = sorted(prediction, key=lambda x: x['result'])
        pred_msg = ["Prediction Fetched", Command.dbutils.fetch_next_race(), prediction]
        data_json_prediction = json.dumps(pred_msg)
        await self.send_message_to_client(data_json_prediction)