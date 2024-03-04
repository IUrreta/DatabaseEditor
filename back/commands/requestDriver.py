from commands.command import Command
import json

class RequestDriverCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        contractDetails = Command.dbutils.fetch_driverContract(self.message["driverID"])
        contractMsg = [contractDetails]
        contractMsg.append(Command.dbutils.fetchDriverNumberDetails(self.message["driverID"]))
        contractMsg.insert(0, "Contract fetched")
        data_json_contract = json.dumps(contractMsg)
        await self.send_message_to_client(data_json_contract)
        nums = Command.dbutils.fetch_driverNumebrs()
        nums.insert(0, "Numbers fetched")
        data_json_numbers = json.dumps(nums)
        await self.send_message_to_client(data_json_numbers)
        yearOfRetirement = Command.dbutils.fetch_driverRetirement(self.message["driverID"])
        yearOfRetirement.insert(0, "Retirement fetched")
        data_json_year = json.dumps(yearOfRetirement)
        await self.send_message_to_client(data_json_year)