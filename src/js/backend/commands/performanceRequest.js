import { getDBUtils, getCarAnalysisUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";

export default class PerformanceRequestCommand extends Command {
    execute() {
        const carAnalysisUtils = getCarAnalysisUtils();
        console.log(this.message);

        const designDict = carAnalysisUtils.getPartsFromTeam(this.message.data.teamID);
        const unitValues = carAnalysisUtils.getUnitValueFromParts(designDict);
        const allParts = carAnalysisUtils.getAllPartsFromTeam(this.message.data.teamID);
        const maxDesign = carAnalysisUtils.getMaxDesign();
        const designResponse = { responseMessage: "Parts stats fetched", content: [unitValues, allParts, maxDesign] };
        updateFront(designResponse);
    }

}