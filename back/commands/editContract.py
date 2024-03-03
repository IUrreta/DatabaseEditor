from commands.command import Command
from scripts.extractor import process_repack
from scripts.transfer_driver_23 import run_script as run_trasnsfer
import json

class EditContractCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        argument = "editContract " + self.message["salary"] + " " + self.message["year"] + " " + self.message["signBonus"] + " " + self.message["raceBonus"] + " " + self.message["raceBonusPos"] + " " +  str(self.message["driverID"]) + " " + str(self.message["driverNumber"]) + " " + str(self.message["wantsN1"]) + " " + str(self.message["retirementAge"])
        run_trasnsfer(argument)
        process_repack("../result", Command.path)
        info = []
        info.insert(0, "Succesfully edited " + self.message["driver"] + "'s details")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)