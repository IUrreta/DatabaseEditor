import { getDBUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { fetchHead2Head, fetchHead2HeadTeam } from "../scriptUtils/head2head";


export default class ConfiguredH2HCommand extends Command {
    execute() {
        const dbUtils = getDBUtils();

        if (this.message.data.h2h !== "-1"){
            if (this.message.data.mode === "driver"){
                const h2hRes = fetchHead2Head(this.message.data.h2h[0], this.message.data.h2h[1], this.message.data.year);
                const h2hResponse = { responseMessage: "H2H fetched", content: h2hRes };
                updateFront(h2hResponse);
            }
            else if (this.message.data.mode === "team"){
                const h2hRes = fetchHead2HeadTeam(this.message.data.h2h[0], this.message.data.h2h[1], this.message.data.year, "team");
                const h2hResponse = { responseMessage: "H2H fetched", content: h2hRes };
                updateFront(h2hResponse);
            }
        }

        const h2hDrivers = [];
        this.message.data.graph.forEach(driver => {
            if (this.message.data.mode === "driver"){
                const res = dbUtils.fetchOneDriverSeasonResults(driver, this.message.data.year);
                h2hDrivers.push(res);
            }
            else if (this.message.data.mode === "team"){
                const res = dbUtils.fetchOneTeamSeasonResults(driver, this.message.data.year);
                h2hDrivers.push(res);
            }
        });
        const eventsDone = dbUtils.fetchEventsDoneFrom(this.message.data.year);
        const allEvents = dbUtils.fetchEventsFrom(this.message.data.year);
        h2hDrivers.push(eventsDone);
        h2hDrivers.unshift(allEvents);
        const h2hResponse = { responseMessage: "H2HDriver fetched", content: h2hDrivers };
        updateFront(h2hResponse);

    }

}