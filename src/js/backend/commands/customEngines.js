import { getDBUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";

export default class CustomEnginesCommand extends Command {
    execute() {
        const dbUtils = getDBUtils();

        console.log(this.message.data.enginesData)

        dbUtils.updateCustomEngines(this.message.data.enginesData)

        console.log("Custom Engines Updated")
    }

}