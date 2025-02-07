import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { dbWorker } from "../../frontend/dragFile";


export default class YearSelectedCommand extends Command {
    execute() {
        console.log("[YearSelectedCommand] Executing command");


        dbWorker.postMessage({ action: 'start', year: this.message.data.year });

        dbWorker.onmessage = (msg) => {
            console.log("[Worker] Received message", msg);
            const response = msg.data;
            updateFront(response);
        }
        
    }

}