from commands.command import Command
from scripts.extractor import process_repack
from scripts.engine_performance import run_script as run_editEngine
import json

class EditEngineCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        run_editEngine(self.message["engines"])
        process_repack("../result", Command.path)
        info = []
        info.insert(0, f"Succesfully edited all engines performance")
        info_json = json.dumps(info)
        await self.send_message_to_client(info_json)