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
        new_file = backup_path + "/" + saveFile
        shutil.copy(originalFIle, new_file)
    
    async def check_for_configs(self, saveName):
        config_name = f"{saveName}_config.json"
        config_folder = "./../configs"
        # if there isnt the folder or the file
        if not os.path.exists(config_folder) or not os.path.exists(config_folder + "/" + config_name):
            print("AAAAAa")
            info = ["Config", "ERROR"]
            info_json = json.dumps(info)
            await self.send_message_to_client(info_json)
        else:
            print("BBBBB")
            with open(config_folder + "/" + config_name, "r") as file:
                data = file.read()
                await self.send_message_to_client(data)
        