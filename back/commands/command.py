class Command:
    def __init__(self, message, client):
        self.type = message["command"]
        self.client = client

    async def execute(self):
        raise NotImplementedError("You must implement the execute method")