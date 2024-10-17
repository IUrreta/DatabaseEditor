import json
import os
from commands.command import Command


class customEnginesCommand(Command):

    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        engine_list = self.message["enginesData"]
        self.process_engine_list(engine_list)


    def process_engine_list(self, engine_list):
        save_name = self.message["saveSelected"].split(".")[0]
        config_file_path = f"./../configs/{save_name}_config.json"

        with open(config_file_path, "r") as json_file:
            data = json.load(json_file)

        new_engines = {}

        for engine in engine_list:
            new_engines[engine] = engine_list[engine]

        data["engines"] = new_engines

        with open(config_file_path, "w") as json_file:
            json.dump(data, json_file, indent=4)
            

