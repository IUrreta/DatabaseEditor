import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { editTeam } from "../scriptUtils/editTeamUtils";

export default class EditTeamCommand extends Command {
    execute() {

        editTeam(this.message.data);
    
        
    }

}