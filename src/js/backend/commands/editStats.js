import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { editAge, editMarketability, editName, editRetirement, editSuperlicense, editCode, editMentality, editStats } from "../scriptUtils/eidtStatsUtils";

export default class EditStatsCommand extends Command {
    execute() {
        const globals = getGlobals();
        editRetirement(this.message.data.driverID, this.message.data.isRetired);
        if (this.message.data.typeStaff === "0"){
            editSuperlicense(this.message.data.driverID, this.message.data.superLicense);
            if (globals.yearIteration == "24"){
                editMarketability(this.message.data.driverID, this.message.data.marketability);
            }
        }
        editStats(this.message.data.driverID, this.message.data.typeStaff, this.message.data.statsArray, this.message.data.retirement, this.message.data.driverNum, this.message.data.wants1);

        if (this.message.data.mentality !== "-1" && globals.yearIteration == "24"){
            editMentality(this.message.data.driverID, this.message.data.mentality);
        }
        editAge(this.message.data.driverID, this.message.data.age);
        if (this.message.newName !== "-1"){
            editName(this.message.data.driverID, this.message.data.newName);
        }
        if (this.message.newCode !== "-1"){
            editCode(this.message.data.driverID, this.message.data.newCode);
        }
    
        
    }

}