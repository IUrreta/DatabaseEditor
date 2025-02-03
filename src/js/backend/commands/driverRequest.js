import { getDBUtils, getCarAnalysisUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";

export default class DriverRequestCommand extends Command {
    execute() {
        const dbUtils = getDBUtils();

        const contract = dbUtils.fetchDriverContract(this.message.data.driverID);
        const contractResponse = { responseMessage: "Contract fetched", content: contract };
        updateFront(contractResponse);
    }

}