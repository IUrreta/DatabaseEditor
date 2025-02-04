import { getDBUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { overwritePerformanceTeam, updateItemsForDesignDict, fitLoadoutsDict, getPerformanceAllTeamsSeason, getAttributesAllTeams, getPerformanceAllCars, getAttributesAllCars } from "../scriptUtils/carAnalysisUtils";

export default class EditPerformanceCommand extends Command {
    execute() {
        let globals = getGlobals();
        const dbUtils = getDBUtils();

        const yearData = dbUtils.checkYearSave();
        
        overwritePerformanceTeam(this.message.data.teamID, this.message.data.parts, globals.isCreateATeam, globals.yearIteration, this.message.data.loadouts);
        updateItemsForDesignDict(this.message.data.n_parts_designs, this.message.data.teamID)
        fitLoadoutsDict(this.message.data.loadouts, this.message.data.teamID)

        const [performance, races] = getPerformanceAllTeamsSeason(yearData[2]);
        const performanceResponse = { responseMessage: "Season performance fetched", content: [performance, races] };
        updateFront(performanceResponse);

        const attibutes = getAttributesAllTeams(yearData[2]);
        const attributesResponse = { responseMessage: "Performance fetched", content: [performance[performance.length - 1], attibutes] };
        updateFront(attributesResponse);

        const carPerformance = getPerformanceAllCars(yearData[2]);
        const carAttributes = getAttributesAllCars(yearData[2]);
        const carPerformanceResponse = { responseMessage: "Cars fetched", content: [carPerformance, carAttributes] };
        updateFront(carPerformanceResponse);

        
    }

}