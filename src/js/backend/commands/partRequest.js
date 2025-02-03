import { getDBUtils, getCarAnalysisUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";

export default class PartRequestCommand extends Command {
    execute() {
        const carAnalysisUtils = getCarAnalysisUtils();
        console.log(this.message);

        const partValues = carAnalysisUtils.getUnitValueFromOnePart(this.message.data.designID);
        const partResponse = { responseMessage: "Part values fetched", content: partValues };
        updateFront(partResponse);
    }

}