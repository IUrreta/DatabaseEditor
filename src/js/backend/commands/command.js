import { teamReplaceDict, prettyNames, getGlobals, setGlobals } from "./commandGlobals";
import { updateFront } from "../../frontend/renderer";

export class Command {

    constructor(message) {
        this.message = message;
    }

    execute() {
        throw new Error("Method not implemented.");
    }

    replaceTeam(originalTeam, newTeam) {
        teamReplaceDict[originalTeam] = prettyNames[newTeam] || newTeam;
    }

    addTeam(originalTeam, newTeam) {
        teamReplaceDict[originalTeam] = newTeam;
    }
}