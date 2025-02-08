import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";

export default class EditStatsCommand extends Command {
    execute() {

        dbWorker.postMessage({
            command: 'editStats',
            data: this.message.data,
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[EditStatsCommand] Error:", response.error);
            } else {
                console.log("[EditStatsCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };


    }

}