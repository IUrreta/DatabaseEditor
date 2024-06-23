import json
import os
from commands.command import Command


class DisconnectCommand(Command):
    def __init__(self, message, client):
        super().__init__(message, client)

    async def execute(self):
        print("Disconnected from client")