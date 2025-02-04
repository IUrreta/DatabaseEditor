import { getDBUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { getUnitValueFromOnePart } from "../scriptUtils/carAnalysisUtils";

export default class PartRequestCommand extends Command {
    execute() {
        const partValues = getUnitValueFromOnePart(this.message.data.designID);
        const partResponse = { responseMessage: "Part values fetched", content: partValues };
        updateFront(partResponse);
    }

}