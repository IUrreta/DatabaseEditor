// Command.js
import { updateFront } from "../frontend/renderer";
import { dbWorker } from "../frontend/dragFile";
import { teamReplaceDict, prettyNames, getGlobals, setGlobals } from "./commandGlobals";


export class Command {
    /**
     * @param {string} commandName - Name of the command to execute.
     * @param {Object} data - Data to send to the worker.
     */
    constructor(commandName, data) {
        this.commandName = commandName;
        this.data = data;
    }


    async execute() {
        console.log(`[Command] Executing command: ${this.commandName}`);
        console.log(`[Command] Data:`, this.data);

        dbWorker.postMessage({ command: this.commandName, data: this.data });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;
            if (response.error) {
                console.error(`[${this.commandName}] Error:`, response.error);
                document.querySelector(".error").classList.remove("d-none");
            } else {
                console.log(`[${this.commandName}] Response:`, response.responseMessage);
                updateFront(response);
                if (this.commandName === "saveSelected") {
                    if (response.responseMessage === "Game Year") {
                        this.updateTeamsFor24(response.content[0]);
                        this.addTeam("Custom Team", response.content[1]);
                    }
                }
            }

        };
    }

    updateTeamsFor24(year) {
        if (year === "24") {
            const data = {
                teams: {
                    alphatauri: "visarb",
                    alpine: "alpine",
                    alfa: "stake"
                }
            }
            this.replaceTeam("Alpha Tauri", data.teams.alphatauri);
            this.replaceTeam("Alpine", data.teams.alpine);
            this.replaceTeam("Alfa Romeo", data.teams.alfa);
            const yearResponse = { responseMessage: "24 Year", content: data };
            updateFront(yearResponse);
        }
    }

    replaceTeam(originalTeam, newTeam) {
        teamReplaceDict[originalTeam] = prettyNames[newTeam] || newTeam;
    }

    addTeam(originalTeam, newTeam) {
        teamReplaceDict[originalTeam] = newTeam;
    }
}
