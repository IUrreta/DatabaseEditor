import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { editEngines } from "../scriptUtils/dbUtils";

export default class EditEngineCommand extends Command {
    execute() {

        dbUtils.editEngines(this.message.data.engines)

    }

}