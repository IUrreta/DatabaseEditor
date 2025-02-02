import { getDBUtils } from "../../frontend/dragFile";
import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";

export default class SaveSelectedCommand extends Command {
    /**
     * Ejecuta el comando de guardar la selección.
     */
    execute() {
        const dbUtils = getDBUtils();

        const yearData = dbUtils.checkYearSave();
        if (yearData[1] !== null){
            setGlobals({createTeam : true});
        }
        else{
            setGlobals({createTeam : false});
        }
        this.addTeam("Custom Team", yearData[1]);
        setGlobals({year: yearData[0]});
        const gameYearResponse = { responseMessage: "Game Year", content: yearData };
        updateFront(gameYearResponse);

        const drivers = dbUtils.fetchDrivers(yearData[0]);
        console.log("Drivers:", drivers);
        const driversResponse = { responseMessage: "Save loaded succesfully", content: drivers };
        updateFront(driversResponse);

        const staff = dbUtils.fetchStaff(yearData[0]);
        const staffResponse = { responseMessage: "Staff fetched", content: staff };
        updateFront(staffResponse);

        const calendar = dbUtils.fetchCalendar();
        const calendarResponse = { responseMessage: "Calendar fetched", content: calendar };
        updateFront(calendarResponse);

        const year = dbUtils.fetchYear();
        const yearResponse = { responseMessage: "Year fetched", content: year };
        updateFront(yearResponse);


    }
}
