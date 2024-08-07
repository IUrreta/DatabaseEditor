from commands.command import Command
from scripts.extractor import process_repack
from scripts.car_performance_23 import run_script as run_editPerformance
from scripts.car_analysis import CarAnalysisUtils
import json

class EditPerformanceCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        car_analysis = CarAnalysisUtils(self.client)
        car_analysis.overwrite_performance_team(self.message['teamID'], self.message['parts'], Command.is_create_a_team, Command.year_iterarion)
        car_analysis.update_items_for_design_dict(self.message['n_parts_designs'], self.message['teamID'])
        car_analysis.fit_loadouts_dict(self.message['loadouts'], self.message['teamID'])
        process_repack("../result", Command.path)
        info = []
        info.insert(0, f"Succesfully edited {self.team_replace_dict[self.message['teamName']]}'s car performance")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)
        game_year = Command.dbutils.check_year_save()
        performances, races = car_analysis.get_performance_all_teams_season(game_year[2])
        performances_season = [performances, races]
        performances_season.insert(0, "Season performance fetched")
        data_json_performances_season = json.dumps(performances_season)
        await self.send_message_to_client(data_json_performances_season)
        performance = [performances[-1], car_analysis.get_attributes_all_teams(game_year[2])]
        performance.insert(0, "Performance fetched")
        data_json_performance = json.dumps(performance)
        await self.send_message_to_client(data_json_performance)
        cars = car_analysis.get_performance_all_cars(game_year[2])
        cars = ["Cars fetched", cars]
        data_json_cars = json.dumps(cars)
        await self.send_message_to_client(data_json_cars)