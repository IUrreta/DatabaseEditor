from commands.command import Command
import json
import sqlite3
from utils import DatabaseUtils
import os
import shutil
from scripts.extractor import process_unpack
from scripts.car_analysis import CarAnalysisUtils

class SaveSelectedCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        save = self.message["save"]
        Command.path = "../" + save
        process_unpack(Command.path, "../result")
        conn = sqlite3.connect("../result/main.db")
        Command.dbutils = DatabaseUtils(conn)
        game_year = Command.dbutils.check_year_save()
        if game_year[1] is not None:
            Command.is_create_a_team = True
        else:
            Command.is_create_a_team = False
        self.add_team("Custom Team", game_year[1])
        game_year_list = ["Game Year", game_year]
        Command.year_iterarion = game_year[0]
        data_json_game_year = json.dumps(game_year_list)
        await self.send_message_to_client(data_json_game_year)
        await self.check_year_config(game_year[0])
        drivers = Command.dbutils.fetch_info(game_year[0])
        drivers.insert(0, "Save Loaded Succesfully")
        data_json_drivers = json.dumps(drivers)
        await self.send_message_to_client(data_json_drivers)
        staff = Command.dbutils.fetch_staff(game_year[0])
        await self.check_for_configs(save)
        staff.insert(0, "Staff Fetched")
        data_json_staff = json.dumps(staff)
        await self.send_message_to_client(data_json_staff)
        engines = Command.dbutils.fetch_engines()
        engines.insert(0, "Engines fetched")
        data_json_engines = json.dumps(engines)
        await self.send_message_to_client(data_json_engines)
        calendar = Command.dbutils.fetch_calendar()
        calendar.insert(0, "Calendar fetched")
        data_json_calendar = json.dumps(calendar)
        await self.send_message_to_client(data_json_calendar)
        self.create_backup(Command.path, save)
        year =  Command.dbutils.fetch_year()
        year = ["Year fetched", year]
        data_json_year = json.dumps(year)
        await self.send_message_to_client(data_json_year)
        nums = Command.dbutils.fetch_driverNumebrs()
        nums.insert(0, "Numbers fetched")
        data_json_numbers = json.dumps(nums)
        await self.send_message_to_client(data_json_numbers)
        car_analysis = CarAnalysisUtils(self.client)
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
        att = car_analysis.get_attributes_all_cars(game_year[2])
        cars = ["Cars fetched", cars, att]
        data_json_cars = json.dumps(cars)
        await self.send_message_to_client(data_json_cars)

    def update_team_dict(self, name):
        if name is not None:
            self.team_replace_dict[name] = name

    def create_backup(self, originalFIle, saveFile):
        backup_path = "./../backup"
        if not os.path.exists(backup_path):
            os.makedirs(backup_path)
        new_file = f"{backup_path}/{saveFile}"
        shutil.copy(originalFIle, new_file)

    async def check_year_config(self, game_year):
        if game_year == "24":
            config_name = "base24_config.json"
            config_folder = "./../configs"
            file_path = os.path.join(config_folder, config_name)
            with open(file_path, "r") as file:
                data = file.read()
                data = json.loads(data)
                self.replace_team("Alpha Tauri", data["teams"]["alphatauri"])
                self.replace_team("Alpine", data["teams"]["alpine"])
                self.replace_team("Alfa Romeo", data["teams"]["alfa"])
                msgData = data
                info = ["24 Year", msgData]
                info = json.dumps(info)
                await self.send_message_to_client(info)
    
    async def check_for_configs(self, saveName):
        config_name = f"{saveName.split('.')[0]}_config.json"
        config_folder = "./../configs"
        file_path = os.path.join(config_folder, config_name)
        if not os.path.exists(config_folder) or not os.path.exists(file_path):
            info = ["Config", "ERROR"]
            info_json = json.dumps(info)
            await self.send_message_to_client(info_json)
        else:
            with open(file_path, "r") as file:
                data = file.read()
                data = json.loads(data)
                self.replace_team("Alpha Tauri", data["teams"]["alphatauri"])
                self.replace_team("Alpine", data["teams"]["alpine"])
                self.replace_team("Alfa Romeo", data["teams"]["alfa"])
                msgData = data
                info = ["Config", msgData]
                info = json.dumps(info)
                await self.send_message_to_client(info)
        