import os
import json
class Command:

    team_replace_dict = {"Alpha Tauri": "Alpha Tauri", "Alpine": "Alpine", "Alfa Romeo": "Alfa Romeo", "Aston Martin": "Aston Martin",
                        "Ferrari": "Ferrari", "Haas": "Haas", "McLaren": "McLaren", "Mercedes": "Mercedes",
                        "Red Bull": "Red Bull", "Williams": "Williams", "Renault": "Renault", "F2": "Formula 2", "F3": "Formula 3", "Custom Team": "Custom Team"}
    
    pretty_names = {"visarb": "Visa Cashapp RB", "toyota" : "Toyota", "hugo": "Hugo Boss", "alphatauri": "Alpha Tauri", "brawn": "Brawn GP", "porsche": "Porsche",
                        "alpine": "Alpine", "renault": "Renault", "andretti": "Andretti", "lotus": "Lotus", "alfa" : "Alfa Romeo",
                    "audi" : "Audi", "sauber" : "Sauber", "stake" : "Stake Sauber"}

    dbutils = None
    path = None
    year_iterarion = None
    is_create_a_team = False

    def __init__(self, message, client):
        self.type = message["command"]
        self.client = client
        self.message = message

    async def execute(self):
        raise NotImplementedError("You must implement the execute method")
    
    async def send_message_to_client(self, message):
        # print(message) #for debugging
        if self.client:
            await self.client.send(message)

    def replace_team(self, original_team, new_team):
        self.team_replace_dict[original_team] = self.pretty_names[new_team]

    def add_team(self, original_team, new_team):
        self.team_replace_dict[original_team] = new_team

    def change_config_attribute(self, attribute, value):
        config_folder = "./../configs"
        config_path = Command.path[3:].split(".")[0] + "_config.json"
        file_path = os.path.join(config_folder, config_path)
        with open(file_path, "r") as file:
            data = file.read()
            data = json.loads(data)
            data[attribute] = value

        with open(file_path, "w") as file:
            json.dump(data, file, indent=4)
            
