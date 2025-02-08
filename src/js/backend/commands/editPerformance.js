import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";

export default class EditPerformanceCommand extends Command {
    execute() {

        dbWorker.postMessage({
            command: 'editPerformance',
            data: this.message.data,
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[EditPerformanceCommand] Error:", response.error);
            } else {
                console.log("[EditPerformanceCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };


    }

}