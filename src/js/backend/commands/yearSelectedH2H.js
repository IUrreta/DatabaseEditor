import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { getUnitValueFromOnePart } from "../scriptUtils/carAnalysisUtils";
import { fetchDriversPerYear } from "../scriptUtils/dbUtils";

export default class YearSelectedH2HCommand extends Command {
    execute() {

        const drivers = fetchDriversPerYear(this.message.data.year);
    
        const driversResponse = { responseMessage: "DriversH2H fetched", content: drivers };
        updateFront(driversResponse);
    }

}