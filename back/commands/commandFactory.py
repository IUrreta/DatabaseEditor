from .connect import ConnectCommand

class CommandFactory:
    def __init__(self):
        pass
        
    def create_command(self, message, client):
        print(message)
        command_type = message["command"]
        if command_type == "connect":
            return ConnectCommand(message, client)
        # Aquí podrías añadir más comandos según sea necesario
        else:
            raise ValueError("Unknown command type")