from commands.command import Command
import json

class RequestDriverCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        contractDetails = Command.dbutils.fetch_driverContract(self.message["driverID"])
        contractDetails.insert(0, "Contract fetched")
        data_json_contract = json.dumps(contractDetails)
        await self.send_message_to_client(data_json_contract)