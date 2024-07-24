from commands.command import Command
from scripts.extractor import process_repack
from scripts.car_analysis import CarAnalysisUtils

import json

class PerformanceRequestCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        car_analysis = CarAnalysisUtils(self.client)
        design_dict = car_analysis.get_parts_from_team(self.message["teamID"])
        parts_stats = ["Parts stats fetched", car_analysis.get_unitvalue_from_parts(design_dict)]
        data_json = json.dumps(parts_stats)
        await self.send_message_to_client(data_json)