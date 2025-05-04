import { fetchEventsDoneFrom } from "./dbUtils";
import { queryDB } from "../dbManager";

export function generate_news(){
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    //select Races done from the current season
    const racesDone = fetchEventsDoneFrom(daySeason[1]);
    console.log(racesDone);
}

function generateRaceResultsNews(events){
    events.forEach(raceId => {
        const winner = queryDB(`SELECT DriverID FROM Races_Results WHERE RaceID = ${raceId} AND FinishingPos = 1`, 'singleRow');
        
    });
}