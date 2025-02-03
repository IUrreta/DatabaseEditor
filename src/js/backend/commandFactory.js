import SaveSelectedCommand from './commands/saveSelected.js';
import PerformanceRequestCommand from './commands/performanceRequest.js';
import PartRequestCommand from './commands/partRequest.js';
import DriverRequestCommand from './commands/driverRequest.js';

export class CommandFactory {
    constructor() {
      this.commandDict = {
        saveSelected: SaveSelectedCommand,
        driverRequest: DriverRequestCommand,
        // hire: HireCommand,
        // fire: FireCommand,
        // autoContract: AutoContractCommand,
        // swap: SwapCommand,
        // editStats: EditStatsCommand,
        // calendar: CalendarCommand,
        // editContract: EditContractCommand,
        // editPerformance: EditPerformanceCommand,
        // editEngine: EditEngineCommand,
        // yearSelected: YearSelectedCommand,
        // yearSelectedH2H: YearSelectedH2HCommand,
        // H2HConfigured: H2HConfiguredCommand,
        // teamRequest: TeamRequestCommand,
        // editTeam: EditTeamCommand,
        // yearSelectedPrediction: YearSelectedPredictionCommand,
        // yearSelectedPredictionModal: YearSelectedPredictionModalCommand,
        // predict: PredictCommand,
        // predictMontecarlo: PredictMontecarloCommand,
        // unretireDriver: UnretireCommand,
        // configUpdate: ConfigUpdateCommand,
        performanceRequest: PerformanceRequestCommand,
        // disconnect: DisconnectCommand,
        // fitParts: FitPartsCommand,
        partRequest: PartRequestCommand,
        // customEngines: CustomEnginesCommand,
        // dev: DevCommand,
      };
    }
  
    createCommand(message) {
      const commandType = message.command;
      if (commandType in this.commandDict) {
        return new this.commandDict[commandType](message);
      } else {
        throw new Error("Unknown command type");
      }
    }
  }