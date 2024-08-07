from commands.command import Command
from scripts.extractor import process_repack
from scripts.car_analysis import CarAnalysisUtils
import json

class PartRequestCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        print(self.message)
        car_analysis = CarAnalysisUtils(self.client)
        part_values = ["Part values fetched", car_analysis.get_unitvalue_from_one_part(self.message['designID'])]
        data_json_part_values = json.dumps(part_values)
        await self.send_message_to_client(data_json_part_values)
