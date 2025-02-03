import { glob } from "original-fs";
import { getDBUtils, getCarAnalysisUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";

export default class EditPerformanceCommand extends Command {
    execute() {
        const carAnalysisUtils = getCarAnalysisUtils();
        let globals = getGlobals();
        carAnalysisUtils.overwritePerformanceTeam(this.message.data.teamID, this.message.data.parts, globals.isCreateATeam, globals.yearIteration, this.message.data.loadouts);
        carAnalysisUtils.updateItemsForDesignDict(this.message.data.n_parts_designs, this.message.data.teamID)
        carAnalysisUtils.fitLoadoutsDict(this.message.data.loadouts, this.message.data.teamID)
        
    }

}