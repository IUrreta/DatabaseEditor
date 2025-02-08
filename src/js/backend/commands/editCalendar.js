import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { dbWorker } from "../../frontend/dragFile";

export default class EditCalendarCommand extends Command {
    execute() {

        dbWorker.postMessage({
            command: 'editCalendar',
            data: this.message.data,
        });

        dbWorker.onmessage = (msg) => {
            const response = msg.data;

            if (response.error) {
                console.error("[EditCalendarCommand] Error:", response.error);
            } else {
                console.log("[EditCalendarCommand] Response:", response.responseMessage);
                updateFront(response);
            }
        };


    }

}