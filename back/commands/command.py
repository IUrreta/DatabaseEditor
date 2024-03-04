class Command:
    dbutils = None
    path = None

    def __init__(self, message, client):
        self.type = message["command"]
        self.client = client
        self.message = message

    async def execute(self):
        raise NotImplementedError("You must implement the execute method")
    
    async def send_message_to_client(self, message):
        print(message)
        if self.client:
            await self.client.send(message)