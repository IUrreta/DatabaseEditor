import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";


export default class ConfigUpdateCommand extends Command {
    execute() {
        dbWorker.postMessage({
            command: 'configUpdate',
            data: this.message.data
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[ConfigUpdateCommand] Error:", response.error);
            } else {
                console.log("[ConfigUpdateCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };


    }

}