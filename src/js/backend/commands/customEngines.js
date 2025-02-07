import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { updateCustomEngines } from "../scriptUtils/dbUtils";

export default class CustomEnginesCommand extends Command {
    execute() {
        updateCustomEngines(this.message.data.enginesData)

    }

}