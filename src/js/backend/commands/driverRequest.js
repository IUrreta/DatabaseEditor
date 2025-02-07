import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { fetchDriverContract } from "../scriptUtils/dbUtils";

export default class DriverRequestCommand extends Command {
    execute() {

        const contract = fetchDriverContract(this.message.data.driverID);
        const contractResponse = { responseMessage: "Contract fetched", content: contract };
        updateFront(contractResponse);
    }

}