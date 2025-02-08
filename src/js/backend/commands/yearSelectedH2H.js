import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";

export default class YearSelectedH2HCommand extends Command {
    execute() {

        dbWorker.postMessage({
            command: 'yearSelectedH2H',
            data: this.message.data
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[YearSelectedH2HCommand] Error:", response.error);
            } else {
                console.log("[YearSelectedH2HCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };
    }

}