// Command.js
import { updateFront } from "../frontend/renderer";
import { dbWorker } from "../frontend/dragFile";
import { teamReplaceDict, prettyNames, getGlobals, setGlobals } from "./commandGlobals";

/**
 * Class representing a command to be executed by the worker.
 */
export class Command {
    /**
     * Creates a new Command instance.
     * @param {string} commandName - Name of the command to execute.
     * @param {Object} data - Data to send to the worker.
     */
    constructor(commandName, data) {
        this.commandName = commandName;
        this.data = data;
    }

    /**
     * Executes the command by sending a message to the worker and setting up a message listener.
     * Log messages and handles the response, updating the frontend.
     * @returns {Promise<void>} A promise that resolves when the command execution is initiated.
     */
    async execute() {
        console.log(`[Command] Executing command: ${this.commandName}`);
        console.log(`[Command] Data:`, this.data);

        dbWorker.postMessage({ command: this.commandName, data: this.data });

        dbWorker.onmessage = async (msg) => {
            const response = msg.data;
            if (response.error) {
                console.error(`[${this.commandName}] Error:`, response.error);
                document.querySelector(".error").classList.remove("d-none");
            } else {
                console.log(`[${this.commandName}] Response:`, response.responseMessage);
                await updateFront(response);
                if (this.commandName === "saveSelected") {
                    if (response.responseMessage === "Game Year") {
                        this.updateTeamsFor24(response.content[0]);
                        this.addTeam("Custom Team", response.content[1]);
                    }
                }
            }

        };
    }

    /**
     * Executes the command and returns a promise that resolves with the response.
     * Useful for commands where the caller needs to wait for the result.
     * @returns {Promise<Object>} A promise that resolves with the worker's response data or rejects with an error.
     */
    promiseExecute() {
        return new Promise((resolve, reject) => {
            const handler = (e) => {
                const resp = e.data;
                if (resp.command && resp.command !== this.commandName) return;
                dbWorker.removeEventListener("message", handler);

                if (resp.error) return reject(resp.error);
                resolve(resp);
            };

            dbWorker.addEventListener("message", handler);
            dbWorker.postMessage({ command: this.commandName, data: this.data });
        });
    }

    /**
     * Updates team names for the 2024 season if applicable.
     * @param {string} year - The current game year ("23" or "24").
     * @returns {Promise<void>} A promise that resolves after the frontend update.
     */
    async updateTeamsFor24(year) {
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
            await updateFront(yearResponse);
        }
    }

    /**
     * Updates the team replacement dictionary with a new team name.
     * @param {string} originalTeam - The original team name.
     * @param {string} newTeam - The new team key to look up in prettyNames or use directly.
     */
    replaceTeam(originalTeam, newTeam) {
        teamReplaceDict[originalTeam] = prettyNames[newTeam] || newTeam;
    }

    /**
     * Adds a new team mapping to the replacement dictionary.
     * @param {string} originalTeam - The original team name.
     * @param {string} newTeam - The new team name.
     */
    addTeam(originalTeam, newTeam) {
        teamReplaceDict[originalTeam] = newTeam;
    }
}
