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

    const vanillaSeason = daySeasonRow[1];
    const VanillaDay = daySeasonRow[0];


    const wayBackSeason = excelToDate(dayNumber).getFullYear();
    const moddedDayNumber = dateToExcel(new Date(`${wayBackSeason}-12-29`));

    const seasonStartDayNumber = dateToExcel(new Date(`${wayBackSeason}-01-01`));
    const vanillaDayNumber = dateToExcel(new Date(`${vanillaSeason}-01-01`));


    const dd = vanillaDayNumber - seasonStartDayNumber;
    const yd = vanillaSeason - wayBackSeason;


    const metaProperty = metadata.gvasMeta.Properties.Properties
        .filter(p => p.Name === "MetaData")[0];

    metaProperty.Properties[0].Properties.forEach(x => {
        if (x.Name === "Day") {
            x.Property = moddedDayNumber;
        }
    });

    // Ahora sustituyo los 'database.exec()' por 'queryDB(...)'
    queryDB(`UPDATE Player_State SET Day = ${moddedDayNumber}`);
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
            State = 2
          WHERE SeasonID = ${vanillaSeason}
        `);
    } else {
        queryDB(`UPDATE Races SET SeasonID = ${wayBackSeason}, Day = Day - ${dd} WHERE SeasonID = ${vanillaSeason}`)
    }

    queryDB(`
        UPDATE Seasons_Deadlines
        SET
          SeasonID = SeasonID - ${yd},
          Day = Day - ${dd}
      `);

    // Ajustes para versiones >= 3
    if (version >= 3) {
        queryDB(`UPDATE Player SET FirstGameDay = ${moddedDayNumber}`);
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
    else {
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
        queryDB(`DELETE FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = 2024`);
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
        queryDB(`DELETE FROM Races_TeamStandings WHERE RaceFormula = 1 AND SeasonID = 2024`);
        for (const entry of changes.TeamStandings) {
            const { LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID, TeamID } = entry;

            queryDB(`
            INSERT INTO Races_TeamStandings (TeamID, LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID)
            VALUES (${TeamID}, ${LastPointsChange}, ${LastPositionChange}, ${Points}, ${Position}, ${RaceFormula}, ${SeasonID})
            `);
        }
    }
}

export function manageFeederSeries(){
    if (!changes.FeederSeries || !Array.isArray(changes.FeederSeries)) {
        console.error("No feeder series found");
    } else {
        queryDB(`DELETE FROM Staff_Contracts WHERE PosInTeam <= 2 AND StaffID IN (SELECT StaffID FROM Staff_DriverData) AND TeamID BETWEEN 11 AND 21`);
        queryDB(`UPDATE Staff_DriverData SET FeederSeriesAssignedCarNumber = NULL`)
    }
}

export function manageAffiliates() {

    queryDB(`
        DELETE FROM Staff_Contracts
        WHERE PosInTeam > 2
        AND StaffID IN (SELECT StaffID FROM Staff_DriverData)
    `);

    if (contracts.Affiliates && Array.isArray(contracts.Affiliates)) {
        contracts.Affiliates.forEach((affiliate) => {
            const {
                DriverID,
                TeamID,
                PosInTeam,
                Salary,
                StartingBonus,
                RaceBonus,
                RaceBonusTargetPos,
                EndSeason,
                BreakoutClause
            } = affiliate;

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

export function manageStandings() {
    queryDB(`DELETE FROM Races_DriverStandings WHERE RaceFormula = 2 AND SeasonID = 2025`);
    queryDB(`DELETE FROM Races_DriverStandings WHERE RaceFormula = 3 AND SeasonID = 2025`);
    queryDB(`
            DELETE FROM Races_DriverStandings
            WHERE SeasonID = 2025
              AND RaceFormula = 1
              AND NOT EXISTS (
                SELECT 1
                FROM Staff_Contracts sc
                WHERE sc.StaffID = Races_DriverStandings.DriverID
                  AND sc.PosInTeam <= 2
              );
          `);

    let position = 1;
    let f1_grid = queryDB(`SELECT DriverID FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = 2025`, "allRows");
    f1_grid.forEach((driver) => {
        queryDB(`UPDATE Races_DriverStandings SET Position = ${position} WHERE DriverID = ${driver[0]} AND RaceFormula = 1 AND SeasonID = 2025`);
        position++;
    });



    queryDB(`
            INSERT INTO Races_DriverStandings (
                SeasonID,
                DriverID,
                Points,
                Position,
                LastPointsChange,
                LastPositionChange,
                RaceFormula
            )
            SELECT 
                2025 AS SeasonID,
                sc.StaffID AS DriverID,
                0 AS Points,
                0 AS Position,
                0 AS LastPointsChange,
                0 AS LastPositionChange,
                2 AS RaceFormula
            FROM Staff_Contracts sc
            INNER JOIN Staff_GameData sgd ON sc.StaffID = sgd.StaffID
            WHERE sgd.StaffType = 0
              AND sc.TeamID BETWEEN 11 AND 21
        `);

    position = 1;
    let f2_grid = queryDB(`SELECT DriverID FROM Races_DriverStandings WHERE RaceFormula = 2 AND SeasonID = 2025`, "allRows");
    f2_grid.forEach((driver) => {
        queryDB(`UPDATE Races_DriverStandings SET Position = ${position} WHERE DriverID = ${driver[0]} AND RaceFormula = 2 AND SeasonID = 2025`);
        queryDB(`INSERT INTO Races_DriverStandings (SeasonID, DriverID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula) VALUES (2024, ${driver[0]}, 0, ${position}, 0, 0, 2)`);
        position++;
    });

    // 2) TeamID entre 22 y 31 => RaceFormula = 3
    queryDB(`
            INSERT INTO Races_DriverStandings (
                SeasonID,
                DriverID,
                Points,
                Position,
                LastPointsChange,
                LastPositionChange,
                RaceFormula
            )
            SELECT 
                2025 AS SeasonID,
                sc.StaffID AS DriverID,
                0 AS Points,
                0 AS Position,
                0 AS LastPointsChange,
                0 AS LastPositionChange,
                3 AS RaceFormula
            FROM Staff_Contracts sc
            INNER JOIN Staff_GameData sgd ON sc.StaffID = sgd.StaffID
            WHERE sgd.StaffType = 0
              AND sc.TeamID BETWEEN 22 AND 31
        `);

    position = 1;
    let f3_grid = queryDB(`SELECT DriverID FROM Races_DriverStandings WHERE RaceFormula = 3 AND SeasonID = 2025`, "allRows");
    f3_grid.forEach((driver) => {
        queryDB(`UPDATE Races_DriverStandings SET Position = ${position} WHERE DriverID = ${driver[0]} AND RaceFormula = 3 AND SeasonID = 2025`);
        queryDB(`INSERT INTO Races_DriverStandings (SeasonID, DriverID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula) VALUES (2024, ${driver[0]}, 0, ${position}, 0, 0, 3)`);
        position++;
    });

    position = 1;
    let f2_teams = queryDB(`SELECT TeamID FROM Races_TeamStandings WHERE RaceFormula = 2 AND SeasonID = 2025`, "allRows");
    f2_teams.forEach((team) => {
        queryDB(`UPDATE Races_TeamStandings SET Position = ${position} WHERE TeamID = ${team[0]} AND RaceFormula = 2 AND SeasonID = 2025`);
        queryDB(`INSERT INTO Races_TeamStandings (SeasonID, TeamID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula) VALUES (2024, ${team[0]}, 0, ${position}, 0, 0, 2)`);
        position++;
    });

    position = 1;
    let f3_teams = queryDB(`SELECT TeamID FROM Races_TeamStandings WHERE RaceFormula = 3 AND SeasonID = 2025`, "allRows");
    f3_teams.forEach((team) => {
        queryDB(`UPDATE Races_TeamStandings SET Position = ${position} WHERE TeamID = ${team[0]} AND RaceFormula = 3 AND SeasonID = 2025`);
        queryDB(`INSERT INTO Races_TeamStandings (SeasonID, TeamID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula) VALUES (2024, ${team[0]}, 0, ${position}, 0, 0, 3)`);
        position++;
    });

    //copy all races_pitcrewstandings form 2025 to 2024
    queryDB(`INSERT INTO Races_PitCrewStandings (SeasonID, TeamID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula)
             SELECT 2024, TeamID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula FROM Races_PitCrewStandings WHERE SeasonID = 2025`);
}

export function changeRaces() {
    if (!changes.Calendar || !Array.isArray(changes.Calendar)) {
        console.log("No calendar data found");
    }
    else {
        let newRaceId = 151;
        for (const entry of changes.Calendar) {
            const { TrackID, Day } = entry;

            queryDB(`
            INSERT INTO Races (
              RaceID,
              SeasonID,
              TrackID,
              Day,
              State,
              RainPractice,
              TemperaturePractice,
              WeatherStatePractice,
              RainQualifying,
              TemperatureQualifying,
              WeatherStateQualifying,
              RainRace,
              TemperatureRace,
              WeatherStateRace,
              WeekendType
            )
            SELECT
              ${newRaceId} AS RaceID,
              2025 AS SeasonID,
              r.TrackID,
              ${Day} AS Day,
              0 AS State,                          
              r.RainPractice,
              r.TemperaturePractice,
              r.WeatherStatePractice,
              r.RainQualifying,
              r.TemperatureQualifying,
              r.WeatherStateQualifying,
              r.RainRace,
              r.TemperatureRace,
              r.WeatherStateRace,
              r.WeekendType
            FROM Races r
            WHERE r.SeasonID = 2024
              AND r.TrackID = ${TrackID}
            LIMIT 1
          `);

            newRaceId++;
        }

        queryDB(`CREATE TRIGGER IF NOT EXISTS delete_duplicate_2025
        AFTER INSERT ON Races
        WHEN NEW.SeasonID = 2025
        AND EXISTS (
            SELECT 1
            FROM Races
            WHERE SeasonID = 2025
            AND TrackID = NEW.TrackID
            AND RaceID <> NEW.RaceID
        )
        BEGIN
        DELETE FROM Races
        WHERE RaceID = NEW.RaceID;
        END;`);
    }

}

export function removeFastestLap() {
    queryDB(`UPDATE Regulations_Enum_Changes SET CurrentValue = 0, PreviousValue = 1 WHERE ChangeID = 9`);
    update2025SeasonModTable("change-regulations", 1);
}

function update2025SeasonModTable(edit, value){
    queryDB(`INSERT OR REPLACE INTO Custom_2025_SeasonMod (key, value) VALUES ('${edit}', '${value}')`);
}

export function updateEditsWithModData(data){
    for (let key in data) {
        if (data[key] === "1"){
            document.querySelector(`.${key}`).classList.add("completed")
            document.querySelector(`.${key} span`).textContent = "Applied"
        }
    }
}