class Command:
    def __init__(self, message):
        self.type = message["type"]

    async def execute(self):
        raise NotImplementedError("You must implement the execute method")