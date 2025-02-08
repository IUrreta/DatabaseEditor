import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { updateCustomEngines } from "../scriptUtils/dbUtils";
import { dbWorker } from "../../frontend/dragFile";


export default class CustomEnginesCommand extends Command {
    execute() {
        dbWorker.postMessage({
            command: 'customEngines',
            data: this.message.data
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[CustomEnginesCommand] Error:", response.error);
            } else {
                console.log("[CustomEnginesCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };


    }

}