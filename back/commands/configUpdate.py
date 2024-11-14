import json
import os
from commands.command import Command
from scripts.edit_stats import edit_freeze_mentality
from scripts.extractor import process_repack


class ConfigUpdateCommand(Command):

    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        self.create_folder_file(self.message)
        process_repack("../result", Command.path)
        info = ["Save settings updated"]
        data_info = json.dumps(info)
        await self.send_message_to_client(data_info)


    def create_folder_file(self, message):
        folder = "./../configs"
        file = f"{message['save']}_config.json"
        file_path = os.path.join(folder, file)
        frozenMentality = 0
        difficulty = 0
        data = {
            "teams": {
                "alphatauri": message["alphatauri"],
                "alpine": message["alpine"],
                "alfa": message["alfa"]
            },
            "mentalityFrozen" : 0,
            "difficulty": 0,
            "refurbish": 0
        }
        with open(file_path, "r") as json_file:
            existing_data = json.load(json_file)
        
        existing_data["teams"]["alphatauri"] = message["alphatauri"]
        existing_data["teams"]["alpine"] = message["alpine"]
        existing_data["teams"]["alfa"] = message["alfa"]

        if message.get("icon"):
            existing_data["icon"] = message["icon"]
        if message.get("primaryColor"):
            existing_data["primaryColor"] = message["primaryColor"]
        if message.get("secondaryColor"):
            existing_data["secondaryColor"] = message["secondaryColor"]
        
        data = existing_data

        frozenMentality = message.get("mentalityFrozen", 0)
        difficulty = message.get("difficulty", 0)
        refurbish = message.get("refurbish", 0)
        data["mentalityFrozen"] = int(frozenMentality)
        data["difficulty"] = int(difficulty)
        data["refurbish"] = int(refurbish)
        data["triggerList"] = message["triggerList"]
            

        if Command.year_iterarion == "24":
            edit_freeze_mentality(frozenMentality) 

        Command.dbutils.manage_difficulty_triggers(message["triggerList"])
        Command.dbutils.manage_refurbish_trigger(int(refurbish))
        

        with open(file_path, "w") as json_file:
            json.dump(existing_data, json_file, indent=4)

        self.replace_team("Alpha Tauri", self.message["alphatauri"])
        self.replace_team("Alpine", self.message["alpine"])
        self.replace_team("Alfa Romeo", self.message["alfa"])



        
