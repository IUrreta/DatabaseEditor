from commands.command import Command
from scripts.transfer_driver_23 import TransferUtils
from scripts.extractor import process_repack
import json

class UnretireCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        transfer_utils = TransferUtils()
        transfer_utils.unretire(self.message["driverID"])
        process_repack("../result", Command.path)
        info = []
        info.insert(0, f"Succesfully unretired {self.message['driver']}")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)