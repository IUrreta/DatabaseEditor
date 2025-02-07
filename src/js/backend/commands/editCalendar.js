import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { editCalendar } from "../scriptUtils/calendarUtils";

export default class EditCalendarCommand extends Command {
    execute() {
        const year = getGlobals().yearIteration;

        editCalendar(this.message.data.calendarCodes, year);
        
    }

}