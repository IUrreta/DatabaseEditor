import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";

export default class TeamRequestCommand extends Command {
    execute() {

        dbWorker.postMessage({ command: 'teamRequest', data: this.message.data });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[TeamRequestCommand] Error:", response.error);
            } else {
                console.log("[TeamRequestCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };
        
    }

}