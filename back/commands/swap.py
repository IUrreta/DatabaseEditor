from commands.command import Command
from scripts.transfer_driver import TransferUtils
from scripts.extractor import process_repack

import json

class SwapCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        transfer_utils = TransferUtils()
        transfer_utils.swap_drivers(self.message['driver1ID'], self.message['driver2ID'])
        process_repack("../result", Command.path)
        info = []
        info.insert(0, f"Succesfully swapped {self.message['driver1']} and  {self.message['driver2']}")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)