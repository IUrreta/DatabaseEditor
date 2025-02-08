import { dbWorker } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
export default class EditContractCommand extends Command {
    execute() {

        dbWorker.postMessage({
            command: 'editContract',
            data: this.message.data,
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[EditContractCommand] Error:", response.error);
            } else {
                console.log("[EditContractCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };

    }

}