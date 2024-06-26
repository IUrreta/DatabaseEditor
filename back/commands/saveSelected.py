from commands.command import Command
import json
import sqlite3
from utils import DatabaseUtils
import os
import shutil
from scripts.extractor import process_unpack

class SaveSelectedCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        save = self.message["save"]
        Command.path = "../" + save
        process_unpack(Command.path, "../result")
        conn = sqlite3.connect("../result/main.db")
        Command.dbutils = DatabaseUtils(conn)
        drivers = Command.dbutils.fetch_info()
        drivers.insert(0, "Save Loaded Succesfully")
        data_json_drivers = json.dumps(drivers)
        await self.send_message_to_client(data_json_drivers)
        staff = Command.dbutils.fetch_staff()
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
        await self.check_for_configs(save)
        self.create_backup(Command.path, save)
        year =  Command.dbutils.fetch_year()
        year = ["Year fetched", year]
        data_json_year = json.dumps(year)
        await self.send_message_to_client(data_json_year)

    def create_backup(self, originalFIle, saveFile):
        backup_path = "./../backup"
        if not os.path.exists(backup_path):
            os.makedirs(backup_path)
        new_file = f"{backup_path}/{saveFile}"
        shutil.copy(originalFIle, new_file)
    
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
        