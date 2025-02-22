import { getGlobals } from "../commandGlobals.js";
import { queryDB, setMetaData, getMetadata } from "../dbManager.js";
import { excelToDate, dateToExcel } from "./eidtStatsUtils.js";
import { editContract, fireDriver, hireDriver, removeFutureContract } from "./transferUtils.js";
import { editSuperlicense } from "./eidtStatsUtils.js";
import contracts from "../../../data/contracts.json"
import changes from "../../../data/2025_changes.json"

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
        // 1) Leemos todas las carreras de la temporada “vieja”
        const raceRows = queryDB(`
            SELECT RaceID, Day
            FROM Races
            WHERE SeasonID = ${vanillaSeason}
        `, "allRows");

        for (const row of raceRows) {
            const oldDay = row[1];

            const oldDate = excelToDate(oldDay);


            const newDate = new Date(wayBackSeason, oldDate.getMonth(), oldDate.getDate());

            // Aseguramos que sea domingo (getDay() devuelve 0 = domingo, 1 = lunes, etc.)
            const dayOfWeek = newDate.getDay();
            if (dayOfWeek !== 0) {
                const offset = 8 - dayOfWeek;
                newDate.setDate(newDate.getDate() + offset);
            }

            const newExcelDay = dateToExcel(newDate);

            queryDB(`
                UPDATE Races
                SET
                    SeasonID = ${wayBackSeason},
                    Day = ${newExcelDay}
                WHERE RaceID = ${row[0]}
            `);
        }

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

export function changeDriverLineUps() {
    if (contracts.Updates && Array.isArray(contracts.Updates)) {
        contracts.Updates.forEach((update) => {
            const {
                DriverID,
                salary,
                EndSeason,
                StartingBonus,
                RaceBonus,
                RaceBonusTargetPos
            } = update;

            editContract(
                DriverID,
                salary,
                EndSeason,
                StartingBonus,
                RaceBonus,
                RaceBonusTargetPos
            );
        });
    }

    if (contracts.Fires && Array.isArray(contracts.Fires)) {
        contracts.Fires.forEach((fire) => {
            const { DriverID, TeamID, ExtraTeamID } = fire;

            if (TeamID !== null && TeamID !== undefined) {
                fireDriver(DriverID, TeamID);
            }

            if (ExtraTeamID !== null && ExtraTeamID !== undefined) {
                removeFutureContract(DriverID, ExtraTeamID);
            }
        });
    }

    if (contracts.Hires && Array.isArray(contracts.Hires)) {
        contracts.Hires.forEach((hire) => {
            const {
                DriverID,
                TeamID,
                PosInTeam,
                Salary,
                StartingBonus,
                RaceBonus,
                RaceBonusTargetPos,
                EndSeason,
                BreakoutClause,
                GrantsSuperLicense
            } = hire;

            if (GrantsSuperLicense) {
                editSuperlicense(DriverID, GrantsSuperLicense);
            }


            hireDriver(
                "manual",
                DriverID,
                TeamID,
                PosInTeam,
                Salary,
                StartingBonus,
                RaceBonus,
                RaceBonusTargetPos,
                EndSeason,
                "24"
            );
        });
    }
}

export function changeStats() {
    if (!changes.Stats || !Array.isArray(changes.Stats)) {
        console.log("No stats found");
    }
    else{
        for (const entry of changes.Stats) {
            const { StaffID, StatID, Val, Max } = entry;
    
            queryDB(`
            UPDATE Staff_PerformanceStats
            SET Val = ${Val}, Max = ${Max}
            WHERE StaffID = ${StaffID} AND StatID = ${StatID}
          `);
    
        }
    }

}

export function change2024Standings() {
    if (!changes.DriverStandings || !Array.isArray(changes.DriverStandings)) {
        console.error("No driver standings found");
    } else {
        for (const entry of changes.DriverStandings) {
            const { DriverID, LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID } = entry;


            queryDB(`
            INSERT INTO Races_DriverStandings (DriverID, LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID)
            VALUES (${DriverID}, ${LastPointsChange}, ${LastPositionChange}, ${Points}, ${Position}, ${RaceFormula}, ${SeasonID})
            `);
        }
    }

    if (!changes.TeamStandings || !Array.isArray(changes.TeamStandings)) {
        console.error("No team standings found");
    } else {
        for (const entry of changes.TeamStandings) {
            const { LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID, TeamID } = entry;

            queryDB(`
            INSERT INTO Races_TeamStandings (TeamID, LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID)
            VALUES (${TeamID}, ${LastPointsChange}, ${LastPositionChange}, ${Points}, ${Position}, ${RaceFormula}, ${SeasonID})
            `);
        }
    }
}


export function removeFastestLap() {
    queryDB(`UPDATE Regulations_Enum_Changes SET CurrentValue = 0, PreviousValue = 1 WHERE ChangeID = 9`);
}