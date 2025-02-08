// saveSelectedCommand.js
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";

export default class SaveSelectedCommand extends Command {
    execute() {
        dbWorker.postMessage({ command: 'saveSelected', data: {} });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[SaveSelectedCommand] Error:", response.error);
            } else {
                updateFront(response);
                if (response.responseMessage === "Game Year") {
                    this.updateTeamsFor24(response.content[0]);
                    this.addTeam("Custom Team", response.content[1]);
                }
            }
        };

    }

    updateTeamsFor24(year){
        if (year === "24"){
            const data = {
                teams : {
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
}
