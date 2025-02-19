import { getGlobals } from "../commandGlobals.js";
import { queryDB, setMetaData, getMetadata } from "../dbManager.js";
import { excelToDate, dateToExcel } from "./eidtStatsUtils.js";

export function timeTravelWithData(dayNumber, extend = false) {
    let metadata, version;
    metadata = getMetadata();
    version = metadata.gvasHeader.SaveGameVersion;
    let yearIteration = getGlobals().yearIteration;

    if (version !== 3) {

    }

    const daySeasonRow = queryDB(`
    SELECT Day, CurrentSeason
    FROM Player_State
  `, 'singleRow');


    const wayBackSeason = excelToDate(dayNumber).getFullYear();
    console.log("Way Back Season: ", wayBackSeason);
    const vanillaSeason = daySeasonRow[1];

    const seasonStartDayNumber = dateToExcel(new Date(`${wayBackSeason}-01-02`));
    console.log("Season Start Day Number: ", seasonStartDayNumber);
    const vanillaDayNumber = dateToExcel(new Date(`${vanillaSeason}-01-01`));
    console.log("Vanilla Day Number: ", vanillaDayNumber);
    const dd = vanillaDayNumber - seasonStartDayNumber; 
    const yd = vanillaSeason - wayBackSeason;          
    console.log("Day Difference: ", dd);
    console.log("Year Difference: ", yd); 



    const metaProperty = metadata.gvasMeta.Properties.Properties
        .filter(p => p.Name === "MetaData")[0];

    metaProperty.Properties[0].Properties.forEach(x => {
        if (x.Name === "Day") {
            x.Property = dayNumber;
        }
    });

    // Ahora sustituyo los 'database.exec()' por 'queryDB(...)'
    queryDB(`UPDATE Player_State SET Day = ${dayNumber}`);
    queryDB(`UPDATE Player_State SET CurrentSeason = ${wayBackSeason}`);

    queryDB(`
        UPDATE Calendar_LastActivityDates
        SET
          LastScoutDate = ${seasonStartDayNumber},
          LastEngineerDate = ${seasonStartDayNumber},
          LastDesignProjectDate = ${seasonStartDayNumber},
          LastResearchProjectDate = ${seasonStartDayNumber}
      `);

    // Ajuste en las tablas de partes/diseños
    queryDB(`UPDATE Parts_Designs SET DayCreated = DayCreated - ${dd} WHERE DayCreated > 0`);
    queryDB(`UPDATE Parts_Designs SET DayCompleted = DayCompleted - ${dd} WHERE DayCompleted > 0`);
    queryDB(`UPDATE Parts_Designs SET ValidFrom = ValidFrom - ${yd}`);

    // Elimino Sponsorship_GuaranteesAndIncentives
    if (yearIteration === "23") {
        queryDB(`DELETE FROM Sponsorship_GuaranteesAndIncentives`);
    }

    // Elimino temporadas y carreras de otros años
    queryDB(`DELETE FROM Races WHERE SeasonID != ${vanillaSeason}`);
    queryDB(`DELETE FROM Seasons WHERE SeasonID != ${vanillaSeason}`);

    // Si extiendo, cambio el estado de la temporada
    if (extend) {
        queryDB(`
          UPDATE Races
          SET
            SeasonID = ${wayBackSeason},
            Day = Day - ${dd},
            State = 2
          WHERE SeasonID = ${vanillaSeason}
        `);
    } else {
        queryDB(`
          UPDATE Races
          SET
            SeasonID = ${wayBackSeason},
            Day = Day - ${dd}
          WHERE SeasonID = ${vanillaSeason}
        `);
    }

    queryDB(`
        UPDATE Seasons_Deadlines
        SET
          SeasonID = SeasonID - ${yd},
          Day = Day - ${dd}
      `);

    // Ajustes para versiones >= 3
    console.log(`UPDATE Staff_PitCrew_DevelopmentPlan SET Day = Day - ${dd} WHERE Day > 40000`)
    if (version >= 3) {
        queryDB(`UPDATE Player SET FirstGameDay = ${dayNumber}`);
        queryDB(`UPDATE Player_Record SET StartSeason = ${wayBackSeason}`);
        queryDB(`UPDATE Player_History SET StartDay = ${seasonStartDayNumber}`);
        queryDB(`UPDATE Staff_PitCrew_DevelopmentPlan SET Day = Day - ${dd} WHERE Day > 40000`);
        queryDB(`UPDATE Onboarding_Tutorial_RestrictedActions SET TutorialIsActiveSetting = 0`);
    }

    // Ajustes para versión === 2
    if (version === 2) {
        queryDB(`UPDATE Onboarding_Tutorial_RestrictedActions SET Allowed = 0`);
    }



    let prestigeTableName = "Board_Prestige";
    if (yearIteration === "24") {
        prestigeTableName = "Board_TeamRating";
    }

    // Pares de tablas y columnas a modificar
    const moddingPairs = [
        {
            table: ["Staff_Contracts"],
            modDay: ["StartDay"],
            modSeason: ["EndSeason"],
        },
        {
            table: ["Staff_CareerHistory"],
            modDay: ["StartDay", "EndDay"],
            modSeason: [],
        },
        {
            table: ["Mail_EventPool_Cooldown"],
            modDay: ["NextTriggerDay"],
            modSeason: [],
            versions: [3],
        },
        {
            table: ["Board_Confidence"],
            modDay: [],
            modSeason: ["Season"],
        },
        {
            table: ["Board_Objectives"],
            modDay: [],
            modSeason: ["StartYear", "TargetEndYear"],
        },
        {
            table: [
                prestigeTableName,
                "Board_SeasonObjectives",
                "Seasons",
                "Parts_TeamHistory",
                "Races_Strategies",
                "Staff_Driver_RaceRecordPerSeason"
            ],
            modDay: [],
            modSeason: ["SeasonID"],
        },
        {
            table: ["Mail_Inbox"],
            modDay: ["Day"],
            modSeason: [],
        },
        {
            table: ["Races_DriverStandings", "Races_TeamStandings"],
            modDay: [],
            modSeason: ["SeasonID"],
        },
        {
            table: ["Races_PitCrewStandings"],
            modDay: [],
            modSeason: ["SeasonID"],
            versions: [3],
        },
    ];

    // Aplico modificaciones en masa
    for (const pair of moddingPairs) {
        if (pair.versions && !pair.versions.includes(version)) {
            continue;
        }
        for (const table of pair.table) {
            for (const md of pair.modDay) {
                queryDB(`UPDATE ${table} SET ${md} = ${md} - ${dd}`);
            }
            for (const ms of pair.modSeason) {
                queryDB(`UPDATE ${table} SET ${ms} = ${ms} - ${yd} WHERE ${ms} = ${vanillaSeason}`);
            }
        }
    }

    // Obtengo la lista de tablas
    const allTables = queryDB(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC",
        "allRows"
    );

    for (const row of allTables) {
        const table = row[0];

        if (table.startsWith("Teams_RaceRecord")) {
            queryDB(`DELETE FROM ${table}`);
        }

        if (table === "Races_Results") {
            console.log(table);
            queryDB(`DELETE FROM ${table} WHERE Season != ${vanillaSeason}`);
            queryDB(`UPDATE ${table} SET Season = Season - ${yd} WHERE Season = ${vanillaSeason}`);
        } else if (table.startsWith("Races") && table.endsWith("Results")) {
            console.log(table);
            queryDB(`DELETE FROM ${table} WHERE SeasonID != ${vanillaSeason}`);
            queryDB(`UPDATE ${table} SET SeasonID = SeasonID - ${yd} WHERE SeasonID = ${vanillaSeason}`);
        }
    }

    if (extend) {
        queryDB(`UPDATE Staff_Contracts SET EndSeason = EndSeason + 1`);
    }

    setMetaData(metadata)

}
