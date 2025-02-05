import SaveSelectedCommand from './commands/saveSelected.js';
import PerformanceRequestCommand from './commands/performanceRequest.js';
import PartRequestCommand from './commands/partRequest.js';
import DriverRequestCommand from './commands/driverRequest.js';
import EditPerformanceCommand from './commands/editPerformance.js';
import YearSelectedH2HCommand from './commands/yearSelectedH2H.js';
import configuredH2HCommand from './commands/configuredH2H.js';
import CustomEnginesCommand from './commands/customEngines.js';
import TeamRequestCommand from './commands/teamRequest.js';
import YearSelectedCommand from './commands/yearSelected.js';

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
        editPerformance: EditPerformanceCommand,
        // editEngine: EditEngineCommand,
        yearSelected: YearSelectedCommand,
        yearSelectedH2H: YearSelectedH2HCommand,
        configuredH2H: configuredH2HCommand,
        teamRequest: TeamRequestCommand,
        // editTeam: EditTeamCommand,
        // unretireDriver: UnretireCommand,
        // configUpdate: ConfigUpdateCommand,
        performanceRequest: PerformanceRequestCommand,
        // fitParts: FitPartsCommand,
        partRequest: PartRequestCommand,
        customEngines: CustomEnginesCommand,
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