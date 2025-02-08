import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { dbWorker } from "../../frontend/dragFile";


export default class YearSelectedCommand extends Command {
    execute() {
        dbWorker.postMessage({ command: 'yearSelected', data: this.message.data.year });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[YearSelectedCommand] Error:", response.error);
            } else {
                console.log("[YearSelectedCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };
        
    }

}