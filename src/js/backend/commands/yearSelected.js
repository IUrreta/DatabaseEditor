import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { getDBUtils } from "../../frontend/dragFile";


export default class YearSelectedCommand extends Command {
    execute() {
        const dbUtils = getDBUtils();

        const results = dbUtils.fetchSeasonResults(this.message.data.year);
        const eventsFrom = dbUtils.fetchEventsFrom(this.message.data.year);
        const teamStandings = dbUtils.fetchTeamsStandings(this.message.data.year);

        const response = { responseMessage: "Results fetched", content: [eventsFrom, results, teamStandings] };
        updateFront(response);
    }

}