import { getDBUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { getPartsFromTeam, getUnitValueFromParts, getAllPartsFromTeam, getMaxDesign } from "../scriptUtils/carAnalysisUtils";

export default class PerformanceRequestCommand extends Command {
    execute() {
        const designDict = getPartsFromTeam(this.message.data.teamID);
        const unitValues = getUnitValueFromParts(designDict);
        const allParts = getAllPartsFromTeam(this.message.data.teamID);
        const maxDesign = getMaxDesign();
        const designResponse = { responseMessage: "Parts stats fetched", content: [unitValues, allParts, maxDesign] };
        updateFront(designResponse);
    }

}