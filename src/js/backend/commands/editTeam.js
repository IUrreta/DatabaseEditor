import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";
export default class EditTeamCommand extends Command {
    execute() {

        dbWorker.postMessage({
            command: 'editTeam',
            data: this.message.data
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[EditTeamCommand] Error:", response.error);
            } else {
                console.log("[EditTeamCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };


    }

}