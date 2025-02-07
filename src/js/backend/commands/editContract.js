import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { editContract, futureContract } from "../scriptUtils/transferUtils";

export default class EditContractCommand extends Command {
    execute() {
        const year = getGlobals().yearIteration;

        editContract(this.message.data.driverID, this.message.data.salary, this.message.data.year,
             this.message.data.signBonus, this.message.data.raceBonus, this.message.data.raceBonusPos);

        futureContract(this.message.data.futureTeam, this.message.data.driverID, this.message.data.futureSalary, this.message.data.futureYear,
            this.message.data.futureSignBonus, this.message.data.futureRaceBonus, this.message.data.futureRaceBonusPos, this.message.data.futurePosition, year);
        
    }

}