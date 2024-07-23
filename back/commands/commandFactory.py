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
from commands.performanceRequest import PerformanceRequestCommand
from commands.disconnect import DisconnectCommand


class CommandFactory:
    command_dict = {"connect": ConnectCommand, "saveSelected": SaveSelectedCommand, "requestDriver": RequestDriverCommand, "hire": HireCommand,
                    "fire": FireCommand, "autoContract": AutoContractCommand, "swap": SwapCommand, "editStats": EditStatsCommand,
                    "calendar": CalendarCommand, "editContract": EditContractCommand, "editPerformance": EditPerformanceCommand,
                    "editEngine": EditEngineCommand, "yearSelected": YearSelectedCommand, "yearSelectedH2H": YearSelectedH2HCommand,
                    "H2HConfigured": H2HConfiguredCommand, "teamRequest": TeamRequestCommand, "editTeam": EditTeamCommand, 
                    "yearSelectedPrediction": YearSelectedPredictionCommand, "yearSelectedPredictionModal": YearSelectedPredictionModalCommand, 
                    "predict": PredictCommand, "predictMontecarlo": PredictMontecarloCommand, "unretireDriver": UnretireCommand, 
                    "configUpdate": ConfigUpdateCommand, "performanceRequest": PerformanceRequestCommand, "disconnect": DisconnectCommand}

    def __init__(self):
        pass
        
    def create_command(self, message, client):
        command_type = message["command"]
        # print(message) #for debugging
        if command_type in self.command_dict:
            return self.command_dict[command_type](message, client)
        else:
            raise ValueError("Unknown command type")
        