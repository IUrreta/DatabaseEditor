import json
import os
from commands.command import Command


class ConfigUpdateCommand(Command):

    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        self.create_folder_file()


    def create_folder_file(self):
        folder = "./../configs"
        file = f"{self.message['save']}_config.json"
        file_path = os.path.join(folder, file)
        if not os.path.exists(folder):
            os.makedirs(folder)
        if not os.path.exists(file_path):
            data = {
                "teams": {
                    "alphatauri": self.message["alphatauri"],
                    "alpine": self.message["alpine"],
                    "alfa": self.message["alfa"]
                },
                "state": self.message["state"],
                "mentalityFrozen" : 0
            }
            if self.message.get("icon"):
                data["icon"] = self.message["icon"]
            if self.message.get("primaryColor"):
                data["primaryColor"] = self.message["primaryColor"]
            if self.message.get("secondaryColor"):
                data["secondaryColor"] = self.message["secondaryColor"]
            with open(file_path, "w") as json_file:
                json.dump(data, json_file, indent=4)
        else:
            with open(file_path, "r") as json_file:
                existing_data = json.load(json_file)
            
            existing_data["teams"]["alphatauri"] = self.message["alphatauri"]
            existing_data["teams"]["alpine"] = self.message["alpine"]
            existing_data["teams"]["alfa"] = self.message["alfa"]

            existing_data["state"] = self.message["state"]
            if self.message.get("icon"):
                existing_data["icon"] = self.message["icon"]
            if self.message.get("primaryColor"):
                existing_data["primaryColor"] = self.message["primaryColor"]
            if self.message.get("secondaryColor"):
                existing_data["secondaryColor"] = self.message["secondaryColor"]
            if self.message.get("mentalityFrozen"):
                existing_data["mentalityFrozen"] = self.message["mentalityFrozen"]
            
            with open(file_path, "w") as json_file:
                json.dump(existing_data, json_file, indent=4)
        self.replace_team("Alpha Tauri", self.message["alphatauri"])
        self.replace_team("Alpine", self.message["alpine"])
        self.replace_team("Alfa Romeo", self.message["alfa"])
