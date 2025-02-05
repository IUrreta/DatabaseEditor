import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { fetchTeamData } from "../scriptUtils/editTeam";

export default class TeamRequestCommand extends Command {
    execute() {

        const teamID = this.message.data.teamID;
        const teamData = fetchTeamData(teamID);
        const teamDataResponse = { responseMessage: "TeamData fetched", content: teamData };
        updateFront(teamDataResponse);
        
    }

}