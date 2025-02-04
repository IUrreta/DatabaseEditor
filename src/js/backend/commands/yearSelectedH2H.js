import { getDBUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { getUnitValueFromOnePart } from "../scriptUtils/carAnalysisUtils";

export default class YearSelectedH2HCommand extends Command {
    execute() {
        const dbUtils = getDBUtils();

        const drivers = dbUtils.fetchDriversPerYear(this.message.data.year);
        const driversResponse = { responseMessage: "DriversH2H fetched", content: drivers };
        updateFront(driversResponse);
    }

}