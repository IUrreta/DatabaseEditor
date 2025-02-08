// configuredH2HCommand.js
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";

export default class ConfiguredH2HCommand extends Command {
    execute() {
        dbWorker.postMessage({
            command: 'configuredH2H',
            data: this.message.data
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[ConfiguredH2HCommand] Error:", response.error);
            } else {
                console.log("[ConfiguredH2HCommand] Partial response:", response.responseMessage);
                updateFront(response);
            }
        };
    }
}
