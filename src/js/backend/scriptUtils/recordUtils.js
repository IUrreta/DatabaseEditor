import { queryDB, setMetaData, getMetadata } from "../dbManager.js";
import { formatNamesSimple } from "./dbUtils.js";

export function getSelectedRecord(type, year) {
    let recordTargetColumn, recordTargetTableBefore, recordTargetTableSince, recordTargetTable;
    if (type === "wins") {
        recordTargetColumn = "TotalWins";
    }
    else if (type === "podiums") {
        recordTargetColumn = "TotalPodiums";
    }
    else if (type === "poles") {
        recordTargetColumn = "TotalPoles";
    }
    else if (type === "champs"){
        recordTargetColumn = "TotalChampionshipWins"
    }

    if (year === "all"){
        recordTargetTableBefore = "Staff_Driver_CareerRecordBeforeGameStart";
        recordTargetTableSince = "Staff_Driver_CareerRecordSinceGameStart";
        let beforeGameStart = queryDB(`SELECT bas.FirstName, bas.LastName, tab1.StaffID, tab1.${recordTargetColumn} FROM ${recordTargetTableBefore} tab1
            JOIN Staff_BasicData bas ON tab1.StaffID = bas.StaffID ORDER BY tab1.${recordTargetColumn} DESC`, 'allRows');
        let sinceGameStart = queryDB(`SELECT bas.FirstName, bas.LastName, tab1.StaffID, tab1.${recordTargetColumn} FROM ${recordTargetTableSince} tab1
            JOIN Staff_BasicData bas ON tab1.StaffID = bas.StaffID ORDER BY tab1.${recordTargetColumn} DESC`, 'allRows');

    }
    else{
        recordTargetTable = "Staff_Driver_RaceRecordPerSeason";
        let record = queryDB(`SELECT bas.FirstName, bas.LastName, tab1.StaffID, tab1.${recordTargetColumn} FROM ${recordTargetTable} tab1 
            JOIN Staff_BasicData bas ON tab1.StaffID = bas.StaffID
            WHERE tab1.SeasonID = ${year} AND tab1.${recordTargetColumn} IS NOT 0 AND (tab1.TeamID <= 10 OR tab1.TeamID == 32)
            ORDER BY tab1.${recordTargetColumn} DESC`, 'allRows');
        console.log("RECORD RAW:", record)
        let formatted = record.map(r => {
            return {
                name: formatNamesSimple([r[0], r[1]])[0],
                id: r[2],
                record: type,
                value: r[3]
            };
        });
        console.log("RECORD:", formatted)
    }
    


}