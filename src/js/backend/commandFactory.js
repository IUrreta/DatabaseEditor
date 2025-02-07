import SaveSelectedCommand from './commands/saveSelected.js';
import PerformanceRequestCommand from './commands/performanceRequest.js';
import PartRequestCommand from './commands/partRequest.js';
import DriverRequestCommand from './commands/driverRequest.js';
import EditPerformanceCommand from './commands/editPerformance.js';
import YearSelectedH2HCommand from './commands/yearSelectedH2H.js';
import ConfiguredH2HCommand from './commands/configuredH2H.js';
import CustomEnginesCommand from './commands/customEngines.js';
import TeamRequestCommand from './commands/teamRequest.js';
import YearSelectedCommand from './commands/yearSelected.js';
import EditTeamCommand from './commands/editTeam.js';
import EditStatsCommand from './commands/editStats.js';
import { editCalendar } from './scriptUtils/calendarUtils.js';
import EditCalendarCommand from './commands/editCalendar.js';

export class CommandFactory {
    constructor() {
      this.commandDict = {
        saveSelected: SaveSelectedCommand,
        driverRequest: DriverRequestCommand,
        // hire: HireCommand,
        // fire: FireCommand,
        // autoContract: AutoContractCommand,
        // swap: SwapCommand,
        editStats: EditStatsCommand,
        editCalendar: EditCalendarCommand,
        // editContract: EditContractCommand,
        editPerformance: EditPerformanceCommand,
        // editEngine: EditEngineCommand,
        yearSelected: YearSelectedCommand,
        yearSelectedH2H: YearSelectedH2HCommand,
        configuredH2H: ConfiguredH2HCommand,
        teamRequest: TeamRequestCommand,
        editTeam: EditTeamCommand,
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