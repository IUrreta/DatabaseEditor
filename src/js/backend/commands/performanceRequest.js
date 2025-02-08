import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";

export default class PerformanceRequestCommand extends Command {
    execute() {
        dbWorker.postMessage({
            command: 'performanceRequest',
            data: this.message.data
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[PerformanceRequestCommand] Error:", response.error);
            } else {
                console.log("[PerformanceRequestCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };
    }

}