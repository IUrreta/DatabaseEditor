import { updateFront } from "../../frontend/renderer";
import { Command } from "./command";
import { setGlobals, getGlobals } from "./commandGlobals";
import { getPerformanceAllTeamsSeason, getAttributesAllTeams, getPerformanceAllCars, getAttributesAllCars } from "../scriptUtils/carAnalysisUtils"
import { fetchDrivers, fetchStaff, fetchEngines, fetchCalendar, fetchYear, fetchDriverNumbers, checkCustomTables, checkYearSave } from "../scriptUtils/dbUtils";

export default class SaveSelectedCommand extends Command {
    /**
     * Ejecuta el comando de guardar la selección.
     */
    execute() {

        checkCustomTables();

        const yearData = checkYearSave();
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

        this.updateTeamsFor24(yearData[0]);

        const drivers = fetchDrivers(yearData[0]);
        const driversResponse = { responseMessage: "Save loaded succesfully", content: drivers };
        updateFront(driversResponse);

        const staff = fetchStaff(yearData[0]);
        const staffResponse = { responseMessage: "Staff fetched", content: staff };
        updateFront(staffResponse);

        const engines = fetchEngines();
        const enginesResponse = { responseMessage: "Engines fetched", content: engines };
        updateFront(enginesResponse);

        const calendar = fetchCalendar();
        const calendarResponse = { responseMessage: "Calendar fetched", content: calendar };
        updateFront(calendarResponse);

        const year = fetchYear();
        const yearResponse = { responseMessage: "Year fetched", content: year };
        updateFront(yearResponse);

        const numbers = fetchDriverNumbers();
        const numbersResponse = { responseMessage: "Numbers fetched", content: numbers };
        updateFront(numbersResponse);

        const [performance, races] = getPerformanceAllTeamsSeason(yearData[2]);
        const performanceResponse = { responseMessage: "Season performance fetched", content: [performance, races] };
        updateFront(performanceResponse);

        const attibutes = getAttributesAllTeams(yearData[2]);
        const attributesResponse = { responseMessage: "Performance fetched", content: [performance[performance.length - 1], attibutes] };
        updateFront(attributesResponse);

        const carPerformance = getPerformanceAllCars(yearData[2]);
        const carAttributes = getAttributesAllCars(yearData[2]);
        const carPerformanceResponse = { responseMessage: "Cars fetched", content: [carPerformance, carAttributes] };
        updateFront(carPerformanceResponse);

    }

    updateTeamsFor24(year){
        if (year === "24"){
            const data = {
                teams : {
                    alphatauri: "visarb",
                    alpine: "alpine",
                    alfa: "stake"
                }
            }
            this.replaceTeam("Alpha Tauri", data.teams.alphatauri);
            this.replaceTeam("Alpine", data.teams.alpine);
            this.replaceTeam("Alfa Romeo", data.teams.alfa);
            const yearResponse = { responseMessage: "24 Year", content: data };
            updateFront(yearResponse);
        }
    }

}
