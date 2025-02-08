import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";

export default class DriverRequestCommand extends Command {
    execute() {

        dbWorker.postMessage({
            command: 'driverRequest',
            data: this.message.data
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[DriverRequestCommand] Error:", response.error);
            } else {
                console.log("[DriverRequestCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };

    }

}