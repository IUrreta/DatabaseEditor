from commands.connect import ConnectCommand
from commands.saveSelected import SaveSelectedCommand
from commands.requestDriver import RequestDriverCommand
from commands.hire import HireCommand
from commands.fire import FireCommand
from commands.autoContract import AutoContractCommand
from commands.swap import SwapCommand
from commands.editStats import EditStatsCommand
from commands.calendar import CalendarCommand
from commands.editContract import EditContractCommand
from commands.editPerformance import EditPerformanceCommand
from commands.editEngine import EditEngineCommand
from commands.yearSelected import YearSelectedCommand
from commands.yearSelectedH2H import YearSelectedH2HCommand
from commands.H2HConfigured import H2HConfiguredCommand
from commands.teamRequest import TeamRequestCommand
from commands.editTeam import EditTeamCommand
from commands.yearSelectedPrediction import YearSelectedPredictionCommand
from commands.yearSelectedPredictionModal import YearSelectedPredictionModalCommand
from commands.predict import PredictCommand
from commands.predictMontecarlo import PredictMontecarloCommand
from commands.unretire import UnretireCommand
from commands.configUpdate import ConfigUpdateCommand


class CommandFactory:
    def __init__(self):
        pass
        
    def create_command(self, message, client):
        command_type = message["command"]
        if command_type == "connect":
            return ConnectCommand(message, client)
        elif command_type == "saveSelected":
            return SaveSelectedCommand(message, client)
        elif command_type == "hire":
            return HireCommand(message, client)
        elif command_type == "fire":
            return FireCommand(message, client)
        elif command_type == "requestDriver":
            return RequestDriverCommand(message, client)
        elif command_type == "autoContract":
            return AutoContractCommand(message, client)
        elif command_type == "swap":
            return SwapCommand(message, client)
        elif command_type == "editStats":
            return EditStatsCommand(message, client)
        elif command_type == "calendar":
            return CalendarCommand(message, client)
        elif command_type == "editContract":
            return EditContractCommand(message, client)
        elif command_type == "editPerformance":
            return EditPerformanceCommand(message, client)
        elif command_type == "editEngine":
            return EditEngineCommand(message, client)
        elif command_type == "yearSelected":
            return YearSelectedCommand(message, client)
        elif command_type == "yearSelectedH2H":
            return YearSelectedH2HCommand(message, client)
        elif command_type == "H2HConfigured":
            return H2HConfiguredCommand(message, client)
        elif command_type == "teamRequest":
            return TeamRequestCommand(message, client)
        elif command_type == "editTeam":
            return EditTeamCommand(message, client)
        elif command_type == "yearSelectedPrediction":
            return YearSelectedPredictionCommand(message, client)
        elif command_type == "yearSelectedPredictionModal":
            return YearSelectedPredictionModalCommand(message, client)
        elif command_type == "predict":
            return PredictCommand(message, client)
        elif command_type == "predictMontecarlo":
            return PredictMontecarloCommand(message, client)
        elif command_type == "unretireDriver":
            return UnretireCommand(message, client)
        elif command_type == "configUpdate":
            return ConfigUpdateCommand(message, client)
        # Aquí podrías añadir más comandos según sea necesario
        else:
            raise ValueError("Unknown command type")