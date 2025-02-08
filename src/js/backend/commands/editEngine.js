import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";

export default class EditEngineCommand extends Command {
    execute() {

        dbWorker.postMessage({
            command: 'editEngine',
            data: this.message.data,
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[EditEngineCommand] Error:", response.error);
            } else {
                console.log("[EditEngineCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };

    }

}