import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";

export default class PartRequestCommand extends Command {
    execute() {

        dbWorker.postMessage({
            command: 'partRequest',
            data: this.message.data
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[PartRequestCommand] Error:", response.error);
            } else {
                console.log("[PartRequestCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };
    }

}