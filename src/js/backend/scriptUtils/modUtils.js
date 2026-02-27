import { getGlobals } from "../commandGlobals.js";
import { queryDB, setMetaData, getMetadata } from "../dbManager.js";
import { excelToDate, dateToExcel, changeDriverNumber, excelFromYMD } from "./eidtStatsUtils.js";
import { editContract, fireDriver, hireDriver, rearrangeDriverEngineerPairings, removeFutureContract } from "./transferUtils.js";
import { editSuperlicense } from "./eidtStatsUtils.js";
import { getBestParts, applyBoostToCarStats, getTyreDegStats, updateTyreDegStats, getPerformanceAllTeams } from "./carAnalysisUtils.js";
import contracts from "../../../data/contracts_2025.json"
import changes from "../../../data/2025_changes.json"
import changes2026 from "../../../data/2026_changes.json"
import tables2026 from "../../../data/tables_2026.json"
import { editEngines, fetchEngines, setCustomSaveConfig, updateCustomEngines, wipeTableAndRefill } from "./dbUtils.js";
import { update } from "idb-keyval";
import { manage_engine_change } from "./editTeamUtils.js";


export function timeTravelWithData(dayNumber, extend = false, mod = "2025") {
    let metadata, version;
    metadata = getMetadata();
    version = metadata.gvasHeader.SaveGameVersion;
    let yearIteration = getGlobals().yearIteration;

    const daySeasonRow = queryDB(`
    SELECT Day, CurrentSeason
    FROM Player_State
  `, [], 'singleRow');

    const vanillaSeason = daySeasonRow[1]; // ORIGINAL SEASON
    const VanillaDay = daySeasonRow[0];

    const wayBackSeason = excelToDate(dayNumber).getFullYear(); // SEASON TO TIME TRAVEL TO
    let moddedDayNumber;
    if (mod === "2025") {
        moddedDayNumber = dateToExcel(new Date(`${wayBackSeason}-12-29`));
    }
    else if (mod === "2026") {
        moddedDayNumber = dateToExcel(new Date(`${wayBackSeason}-12-28`));
    }

    const seasonStartDayNumber = excelFromYMD(wayBackSeason, 1, 1);
    const vanillaDayNumber = excelFromYMD(vanillaSeason, 1, 1);

    let dd = vanillaDayNumber - seasonStartDayNumber; // DAY DIFFERENCE BETWEEN THE START OF THE VANILLA SEASON AND THE START OF THE WAY BACK SEASON
    const yd = vanillaSeason - wayBackSeason;

    const metaProperty = metadata.gvasMeta.Properties.Properties
        .filter(p => p.Name === "MetaData")[0];

    metaProperty.Properties[0].Properties.forEach(x => {
        if (x.Name === "Day") {
            x.Property = moddedDayNumber;
        }
    });

    queryDB(`UPDATE Player_State SET Day = ?`, [moddedDayNumber], 'run');
    queryDB(`UPDATE Player_State SET CurrentSeason = ?`, [wayBackSeason], 'run');

    queryDB(`
        UPDATE Calendar_LastActivityDates
        SET
          LastScoutDate = ?,
          LastEngineerDate = ?,
          LastDesignProjectDate = ?,
          LastResearchProjectDate = ?
      `, [seasonStartDayNumber, seasonStartDayNumber, seasonStartDayNumber, seasonStartDayNumber], 'run');

    // Ajuste en las tablas de partes/diseños
    queryDB(`UPDATE Parts_Designs SET DayCreated = DayCreated - ? WHERE DayCreated > 0`, [dd], 'run');
    queryDB(`UPDATE Parts_Designs SET DayCompleted = DayCompleted - ? WHERE DayCompleted > 0`, [dd], 'run');
    queryDB(`UPDATE Parts_Designs SET ValidFrom = ValidFrom - ?`, [yd], 'run');

    // Elimino Sponsorship_GuaranteesAndIncentives
    if (yearIteration === "23") {
        queryDB(`DELETE FROM Sponsorship_GuaranteesAndIncentives`, [], 'run');
    }

    // Elimino temporadas y carreras de otros años
    queryDB(`DELETE FROM Races WHERE SeasonID != ?`, [vanillaSeason], 'run');
    queryDB(`DELETE FROM Seasons WHERE SeasonID != ?`, [vanillaSeason], 'run');

    // Si extiendo, cambio el estado de la temporada
    if (extend) {
        queryDB(`
          UPDATE Races
          SET
            SeasonID = ?,
            State = 2
          WHERE SeasonID = ?
        `, [wayBackSeason, vanillaSeason], 'run');
    } else {
        //with State = 2 we move the races to the actual days of the new season but mark them as completed
        queryDB(`UPDATE Races SET SeasonID = ?, Day = Day - ?, State = 2 WHERE SeasonID = ?`, [wayBackSeason, dd, vanillaSeason], 'run')
    }

    // ============================================================
    // FIX GOD BISESTOS: Seasons_Deadlines (NO usar dd para Day)
    // ============================================================
    // Primero leo las filas ANTES de actualizar SeasonID, para saber qué mover
    const deadlinesRows = queryDB(
        `SELECT rowid AS _rowid_, SeasonID, Day FROM Seasons_Deadlines WHERE SeasonID = ?`,
        [vanillaSeason],
        'allRows'
    );

    // Actualizo SeasonID como antes (esto sí puede ir con yd)
    queryDB(`
        UPDATE Seasons_Deadlines
        SET
          SeasonID = SeasonID - ?
        WHERE SeasonID = ?
      `, [yd, vanillaSeason], 'run');

    // Recalculo Day preservando mes/día (UTC) para evitar off-by-one por bisiestos
    const excelEpochUTC = Date.UTC(1899, 11, 30);
    for (const row of deadlinesRows) {
        const rowid = row._rowid_ ?? row[0];
        const originalDay = row.Day ?? row[2];

        if (originalDay == null || Number(originalDay) <= 0) continue;

        const d = new Date(excelEpochUTC + Number(originalDay) * 86400000);

        // Mantener mes/día, pero cambiar el año relativo al salto de temporadas
        const targetYear = d.getUTCFullYear() - yd; // equivalente a + (wayBackSeason - vanillaSeason)

        // Clamp por si existiera 29 feb -> 28 feb en año no bisiesto
        const maxDayInTargetMonth = new Date(Date.UTC(targetYear, d.getUTCMonth() + 1, 0)).getUTCDate();
        const safeDay = Math.min(d.getUTCDate(), maxDayInTargetMonth);

        const remappedUTC = Date.UTC(targetYear, d.getUTCMonth(), safeDay);
        const remappedExcel = Math.floor((remappedUTC - excelEpochUTC) / 86400000);

        queryDB(
            `UPDATE Seasons_Deadlines SET Day = ? WHERE rowid = ?`,
            [remappedExcel, rowid],
            'run'
        );
    }

    // Ajustes para versiones >= 3
    if (version >= 3) {
        queryDB(`UPDATE Player SET FirstGameDay = ?`, [moddedDayNumber], 'run');
        queryDB(`UPDATE Player_Record SET StartSeason = ?`, [wayBackSeason], 'run');
        queryDB(`UPDATE Player_History SET StartDay = ?`, [seasonStartDayNumber], 'run');
        queryDB(`UPDATE Staff_PitCrew_DevelopmentPlan SET Day = Day - ? WHERE Day > 40000`, [dd], 'run');
        queryDB(`UPDATE Onboarding_Tutorial_RestrictedActions SET TutorialIsActiveSetting = 0`, [], 'run');
    }

    // Ajustes para versión === 2
    if (version === 2) {
        queryDB(`UPDATE Onboarding_Tutorial_RestrictedActions SET Allowed = 0`, [], 'run');
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
                queryDB(`UPDATE ${table} SET ${md} = ${md} - ?`, [dd], 'run');
            }
            for (const ms of pair.modSeason) {
                queryDB(`UPDATE ${table} SET ${ms} = ${ms} - ? WHERE ${ms} = ?`, [yd, vanillaSeason], 'run');
            }
        }
    }

    // Obtengo la lista de tablas
    const allTables = queryDB(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC",
        [],
        "allRows"
    );

    for (const row of allTables) {
        const table = row[0];

        if (table.startsWith("Teams_RaceRecord")) {
            queryDB(`DELETE FROM ${table}`, [], 'run');
        }

        if (table === "Races_Results") {
            queryDB(`DELETE FROM ${table} WHERE Season != ?`, [vanillaSeason], 'run');
            queryDB(`UPDATE ${table} SET Season = Season - ? WHERE Season = ?`, [yd, vanillaSeason], 'run');
        } else if (table.startsWith("Races") && table.endsWith("Results")) {
            queryDB(`DELETE FROM ${table} WHERE SeasonID != ?`, [vanillaSeason], 'run');
            queryDB(`UPDATE ${table} SET SeasonID = SeasonID - ? WHERE SeasonID = ?`, [yd, vanillaSeason], 'run');
        }
    }

    if (extend) {
        queryDB(`UPDATE Staff_Contracts SET EndSeason = EndSeason + 1`, [], 'run');
    }

    setMetaData(metadata)
    if (mod === "2025") {
        updateSeasonModTable("time-travel", 1, "2025");
    }
    else if (mod === "2026") {
        updateSeasonModTable("time-travel-2026", 1, "2026");
    }
}

export function changeDriverLineUps() {
    if (contracts.Updates && Array.isArray(contracts.Updates)) {
        contracts.Updates.forEach((update) => {
            const hasContractWithTeam32 = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND TeamID = 32`, [update.DriverID], "singleRow");
            if (!hasContractWithTeam32) {
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
            }
        });
    }

    if (contracts.Fires && Array.isArray(contracts.Fires)) {
        contracts.Fires.forEach((fire) => {
            const { DriverID, TeamID, ExtraTeamID, Retire, PosInTeam } = fire;

            if (TeamID !== null && TeamID !== undefined) {
                modFire(DriverID, TeamID, PosInTeam);
            }
            if (Retire !== null && Retire !== undefined) {
                queryDB(`UPDATE Staff_GameData SET Retired = 0 WHERE StaffID = ?`, [DriverID], 'run');
            }
        });
    }

    if (contracts.Hires && Array.isArray(contracts.Hires)) {
        contracts.Hires.forEach((hire) => {
            const hasContractWithTeam32 = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND TeamID = 32`, [hire.DriverID], "singleRow");
            if (!hasContractWithTeam32) {
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

                const contractExists = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND TeamID = ? AND ContractType = 0`, [DriverID, TeamID], "singleRow");
                if (!contractExists) {
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
                }
            }
        });

    }

    if (contracts.StaffHires && Array.isArray(contracts.StaffHires)) {
        contracts.StaffHires.forEach((hire) => {
            const hasContractWithTeam32 = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND TeamID = 32`, [hire.StaffID], "singleRow");
            if (!hasContractWithTeam32) {
                const {
                    StaffID,
                    TeamID,
                    PosInTeam,
                    Salary,
                    StartingBonus,
                    RaceBonus,
                    RaceBonusTargetPos,
                    EndSeason,
                    BreakoutClause
                } = hire;

                hireDriver(
                    "manual",
                    StaffID,
                    TeamID,
                    PosInTeam,
                    Salary,
                    StartingBonus,
                    RaceBonus,
                    RaceBonusTargetPos,
                    EndSeason,
                    "24"
                );
            }
        });

    }


    const f1Workers = queryDB(`SELECT StaffID FROM Staff_Contracts WHERE TeamID <= 10 AND PosInTeam <= 2`, [], "allRows");
    f1Workers.forEach((worker) => {
        removeFutureContract(worker[0]);
    });
    changeDriverNumber(95, 30);

    updateSeasonModTable("change-line-ups", 1, "2025");

}

export function modFire(driverID, teamID, PosInTeam) {
    const isInTeam = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND TeamID = ? AND ContractType = 0`, [driverID, teamID], "singleRow");
    if (isInTeam) {
        const position = queryDB(`SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = ?`, [driverID], "singleValue");
        queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0 AND TeamID = ?`, [driverID, teamID], 'run');
        if (position < 3) {
            queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = ?`, [driverID], 'run');
        }
        const engineerID = queryDB(
            `SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = ?`,
            [driverID], "singleValue"
        );
        if (engineerID) {
            queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ? AND DriverID = ?`, [engineerID, driverID], 'run');
        }
    }
    else {
        const staffType = queryDB(`SELECT StaffType FROM Staff_GameData WHERE StaffID = ?`, [driverID], "singleValue");
        const replacement = queryDB(`SELECT con.StaffID FROM Staff_Contracts con
            JOIN Staff_GameData gd ON con.StaffID = gd.StaffID
            WHERE gd.StaffType = ? AND
            con.TeamID = ? AND con.PosInTeam = ? AND con.ContractType = 0`, [staffType, teamID, PosInTeam], "singleValue");
        if (replacement) {
            queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0 AND TeamID = ?`, [replacement, teamID], 'run');
            if (PosInTeam < 3) {
                queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = ?`, [replacement], 'run');
            }
            const engineerID = queryDB(
                `SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = ?`,
                [replacement], "singleValue"
            );
            if (engineerID) {
                queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ? AND DriverID = ?`, [engineerID, replacement], 'run');
            }
        }
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
            SET Val = ?, Max = ?
            WHERE StaffID = ? AND StatID = ?
          `, [Val, Max, StaffID, StatID], 'run');

        }
    }
    updateSeasonModTable("change-stats", 1, "2025");

}

export function changeDriverEngineerPairs() {
    if (!changes.TeamLineUps || !Array.isArray(changes.TeamLineUps)) {
        console.error("No driver-engineer pairs");
    } else {
        for (const entry of changes.TeamLineUps) {
            const { TeamID, Driver1, Engineer1, Driver2, Engineer2 } = entry;

            const areAllInSameTeam =
                queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND TeamID = ? AND PosInTeam <= 2 AND ContractType = 0`, [Driver1, TeamID], "singleRow") &&
                queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND TeamID = ? AND PosInTeam <= 2 AND ContractType = 0`, [Driver2, TeamID], "singleRow") &&
                queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND TeamID = ? AND PosInTeam <= 2 AND ContractType = 0`, [Engineer1, TeamID], "singleRow") &&
                queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND TeamID = ? AND PosInTeam <= 2 AND ContractType = 0`, [Engineer2, TeamID], "singleRow");


            if (areAllInSameTeam) {
                queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE DriverID = ? OR DriverID = ?`, [Driver1, Driver2], 'run');
                queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ? OR RaceEngineerID = ?`, [Engineer1, Engineer2], 'run');

                let driver1Engineer1 = queryDB(`SELECT * FROM Staff_RaceEngineerDriverAssignments WHERE DriverID = ? AND RaceEngineerID = ?`, [Driver1, Engineer1], "singleRow");
                let driver2Engineer2 = queryDB(`SELECT * FROM Staff_RaceEngineerDriverAssignments WHERE DriverID = ? AND RaceEngineerID = ?`, [Driver2, Engineer2], "singleRow");

                if (driver1Engineer1 && driver1Engineer1.length > 0) {
                    queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE DriverID = ? AND RaceEngineerID = ?`, [Driver1, Engineer1], 'run');
                } else {
                    queryDB(`INSERT INTO Staff_RaceEngineerDriverAssignments (RaceEngineerID, DriverID, DaysTogether, RelationshipLevel, IsCurrentAssignment) VALUES (?, ?, 0, 0, 1)`, [Engineer1, Driver1], 'run');
                }

                if (driver2Engineer2 && driver2Engineer2.length > 0) {
                    queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE DriverID = ? AND RaceEngineerID = ?`, [Driver2, Engineer2], 'run');
                } else {
                    queryDB(`INSERT INTO Staff_RaceEngineerDriverAssignments (RaceEngineerID, DriverID, DaysTogether, RelationshipLevel, IsCurrentAssignment) VALUES (?, ?, 0, 0, 1)`, [Engineer2, Driver2], 'run');
                }
            }
            else {
                rearrangeDriverEngineerPairings(TeamID)
            }


        }
    }
}

export function change2024Standings(mod = "2025") {
    if (!changes.DriverStandings || !Array.isArray(changes.DriverStandings)) {
        console.error("No driver standings found");
    } else {
        for (const entry of changes.DriverStandings) {
            const { DriverID, LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID } = entry;


            queryDB(`
            UPDATE Races_DriverStandings SET LastPointsChange = ?, LastPositionChange = ?, Points = ?, Position = ?
            WHERE DriverID = ? AND RaceFormula = ? AND SeasonID = ?
            `, [LastPointsChange, LastPositionChange, Points, Position, DriverID, RaceFormula, SeasonID], 'run');
        }
    }

    if (!changes.TeamStandings || !Array.isArray(changes.TeamStandings)) {
        console.error("No team standings found");
    } else {
        queryDB(`DELETE FROM Races_TeamStandings WHERE RaceFormula = 1 AND SeasonID = 2024`, [], 'run');
        for (const entry of changes.TeamStandings) {
            const { LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID, TeamID } = entry;

            queryDB(`
            INSERT INTO Races_TeamStandings (TeamID, LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [TeamID, LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID], 'run');
        }
    }
    if (mod === "2025") {
        updateSeasonModTable("change-cfd", 1, "2025");
    }
}

export function change2025Standings(mod = "2026") {
    if (!changes2026.DriverStandings || !Array.isArray(changes2026.DriverStandings)) {
        console.error("No driver standings found");
    } else {
        for (const entry of changes2026.DriverStandings) {
            const { DriverID, LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID } = entry;

            queryDB(`
            UPDATE Races_DriverStandings SET LastPointsChange = ?, LastPositionChange = ?, Points = ?, Position = ?
            WHERE DriverID = ? AND RaceFormula = ? AND SeasonID = ?
            `, [LastPointsChange, LastPositionChange, Points, Position, DriverID, RaceFormula, SeasonID], 'run');
        }
    }

    if (!changes2026.TeamStandings || !Array.isArray(changes2026.TeamStandings)) {
        console.error("No team standings found");
    } else {
        queryDB(`DELETE FROM Races_TeamStandings WHERE RaceFormula = 1 AND SeasonID = 2025`, [], 'run');
        for (const entry of changes2026.TeamStandings) {
            const { LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID, TeamID } = entry;

            queryDB(`
            INSERT INTO Races_TeamStandings (TeamID, LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [TeamID, LastPointsChange, LastPositionChange, Points, Position, RaceFormula, SeasonID], 'run');
        }
    }
    if (mod === "2026") {
        updateSeasonModTable("change-cfd-2026", 1, "2026");
    }
}

export function manageFeederSeries() {
    if (!contracts.FeederSeries || !Array.isArray(contracts.FeederSeries)) {
        console.error("No feeder series found");
    } else {
        queryDB(`DELETE FROM Staff_Contracts WHERE PosInTeam <= 3 AND StaffID IN (SELECT StaffID FROM Staff_DriverData) AND TeamID BETWEEN 11 AND 31`, [], 'run');
        queryDB(`UPDATE Staff_DriverData SET FeederSeriesAssignedCarNumber = NULL`, [], 'run')
        const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], "singleRow");
        const day = daySeason[0];
        for (const entry of contracts.FeederSeries) {
            const { DriverID, TeamID, PosInTeam, Salary, EndSeason } = entry;
            queryDB(`INSERT INTO Staff_Contracts (StaffID, ContractType, TeamID, PosInTeam, StartDay, EndSeason, Salary, StartingBonus, RaceBonus, RaceBonusTargetPos, BreakoutClause, AffiliateDualRoleClause)
                 VALUES (?, 0, ?, ?, ?, ?, ?, 0, 0, 1, 0.5, 0)`, [DriverID, TeamID, PosInTeam, day, EndSeason, Salary], 'run');
            queryDB(`UPDATE Staff_DriverData SET FeederSeriesAssignedCarNumber = ?, AssignedCarNumber = NULL, LastKnownDriverNumber = NULL WHERE StaffID = ?`, [PosInTeam, DriverID], 'run');
            const driverTeamRaceEngineers = queryDB(`SELECT gd.StaffID FROM Staff_GameData gd
                JOIN Staff_Contracts sc ON gd.StaffID = sc.StaffID
                WHERE gd.StaffType = 2
                AND gd.StaffID IN (SELECT StaffID FROM Staff_Contracts WHERE TeamID = ?)`, [TeamID], "allRows");
            let newRaceEngineer = driverTeamRaceEngineers[0][0];
            let pairExists = queryDB(`SELECT * FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = ? AND DriverID = ?`, [newRaceEngineer, DriverID], "singleRow");
            if (pairExists && pairExists.length > 0) {
                queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = ? AND DriverID = ?`, [newRaceEngineer, DriverID], 'run');
            } else {
                queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ?`, [newRaceEngineer], 'run');
                queryDB(`INSERT INTO Staff_RaceEngineerDriverAssignments (RaceEngineerID, DriverID, DaysTogether, RelationshipLevel, IsCurrentAssignment) VALUES (?, ?, 0, 0, 1)`, [newRaceEngineer, DriverID], 'run');
            }
        }
    }
}

export function manageAffiliates() {

    queryDB(`
        DELETE FROM Staff_Contracts
        WHERE PosInTeam > 2
        AND StaffID IN (SELECT StaffID FROM Staff_DriverData)
    `, [], 'run');

    if (contracts.Affiliates && Array.isArray(contracts.Affiliates)) {
        contracts.Affiliates.forEach((affiliate) => {
            const hasContractWithTeam32 = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND TeamID = 32`, [affiliate.DriverID], "singleRow");
            const isFullTimeDriver = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ? AND PosInTeam <= 2 AND (TeamID <= 10 OR TeamID == 32)`, [affiliate.DriverID], "singleRow");
            if (!hasContractWithTeam32 && !isFullTimeDriver) {
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
            }
        });


    }
}

export function manageStandings() {
    queryDB(`DELETE FROM Races_DriverStandings WHERE RaceFormula = 2 AND SeasonID = 2025`, [], 'run');
    queryDB(`DELETE FROM Races_DriverStandings WHERE RaceFormula = 3 AND SeasonID = 2025`, [], 'run');
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
          `, [], 'run');

    let position = 1;
    let f1_grid = queryDB(`SELECT DriverID FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = 2025`, [], "allRows");
    f1_grid.forEach((driver) => {
        queryDB(`UPDATE Races_DriverStandings SET Position = ? WHERE DriverID = ? AND RaceFormula = 1 AND SeasonID = 2025`, [position, driver[0]], 'run');
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
        `, [], 'run');

    position = 1;
    let f2_grid = queryDB(`SELECT DriverID FROM Races_DriverStandings WHERE RaceFormula = 2 AND SeasonID = 2025`, [], "allRows");
    f2_grid.forEach((driver) => {
        queryDB(`UPDATE Races_DriverStandings SET Position = ? WHERE DriverID = ? AND RaceFormula = 2 AND SeasonID = 2025`, [position, driver[0]], 'run');
        queryDB(`INSERT INTO Races_DriverStandings (SeasonID, DriverID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula) VALUES (2024, ?, 0, ?, 0, 0, 2)`, [driver[0], position], 'run');
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
        `, [], 'run');

    position = 1;
    let f3_grid = queryDB(`SELECT DriverID FROM Races_DriverStandings WHERE RaceFormula = 3 AND SeasonID = 2025`, [], "allRows");
    f3_grid.forEach((driver) => {
        queryDB(`UPDATE Races_DriverStandings SET Position = ? WHERE DriverID = ? AND RaceFormula = 3 AND SeasonID = 2025`, [position, driver[0]], 'run');
        queryDB(`INSERT INTO Races_DriverStandings (SeasonID, DriverID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula) VALUES (2024, ?, 0, ?, 0, 0, 3)`, [driver[0], position], 'run');
        position++;
    });

    position = 1;
    let f2_teams = queryDB(`SELECT TeamID FROM Races_TeamStandings WHERE RaceFormula = 2 AND SeasonID = 2025`, [], "allRows");
    f2_teams.forEach((team) => {
        queryDB(`UPDATE Races_TeamStandings SET Position = ? WHERE TeamID = ? AND RaceFormula = 2 AND SeasonID = 2025`, [position, team[0]], 'run');
        queryDB(`INSERT INTO Races_TeamStandings (SeasonID, TeamID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula) VALUES (2024, ?, 0, ?, 0, 0, 2)`, [team[0], position], 'run');
        position++;
    });

    position = 1;
    let f3_teams = queryDB(`SELECT TeamID FROM Races_TeamStandings WHERE RaceFormula = 3 AND SeasonID = 2025`, [], "allRows");
    f3_teams.forEach((team) => {
        queryDB(`UPDATE Races_TeamStandings SET Position = ? WHERE TeamID = ? AND RaceFormula = 3 AND SeasonID = 2025`, [position, team[0]], 'run');
        queryDB(`INSERT INTO Races_TeamStandings (SeasonID, TeamID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula) VALUES (2024, ?, 0, ?, 0, 0, 3)`, [team[0], position], 'run');
        position++;
    });

    //copy all races_pitcrewstandings form 2025 to 2024
    queryDB(`INSERT INTO Races_PitCrewStandings (SeasonID, TeamID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula)
             SELECT 2024, TeamID, Points, Position, LastPointsChange, LastPositionChange, RaceFormula FROM Races_PitCrewStandings WHERE SeasonID = 2025`, [], 'run');
}

export function changeRaces(type) {
    if (!changes.Calendar || !Array.isArray(changes.Calendar)) {
        console.log("No calendar data found");
    }
    else {
        if (type === "Start2024" || type === "End2024") {
            let maxRaceId = queryDB(`SELECT MAX(RaceID) FROM Races`, [], "singleRow")[0];
            let newRaceId = maxRaceId + 1;
            for (const entry of changes.Calendar) {
                const { TrackID, Day, WeekendType } = entry;

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
                ? AS RaceID,
                2025 AS SeasonID,
                r.TrackID,
                ? AS Day,
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
                ? AS WeekendType
                FROM Races r
                WHERE r.SeasonID = 2024
                AND r.TrackID = ?
                LIMIT 1
            `, [newRaceId, Day, WeekendType, TrackID], 'run');

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
            END;`, [], 'run');
            updateSeasonModTable("change-calendar", 1, "2025");
        }
        else if (type === "Direct2025") {
            let maxRaceId = queryDB(`SELECT MAX(RaceID) FROM Races`, [], "singleRow")[0];
            let newRaceId = maxRaceId + 1;
            let firstNewRaceID = newRaceId;

            for (const entry of changes.Calendar) {
                const { TrackID, Day, WeekendType } = entry;

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
                    ? AS RaceID,
                    2025 AS SeasonID,
                    r.TrackID,
                    ? AS Day,
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
                    ? AS WeekendType
                FROM Races r
                WHERE r.SeasonID = 2025
                AND r.TrackID = ?
                LIMIT 1
            `, [newRaceId, Day, WeekendType, TrackID], 'run');

                newRaceId++;
            }

            // Borra las filas antiguas de la temporada 2025
            queryDB(`
            DELETE FROM Races 
            WHERE SeasonID = 2025 
            AND RaceID < ?
        `, [firstNewRaceID], 'run');

        }
    }

}

export function updateCalendar2026(type) {
    if (!changes2026.Calendar || !Array.isArray(changes2026.Calendar)) {
        console.log("No calendar data found");
    }
    else {
        if (type === "Start2024" || type === "End2024" || type === "Start2025" || type === "End2025") {
            const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], "singleRow");
            const season = daySeason[1];
            let maxRaceId = queryDB(`SELECT MAX(RaceID) FROM Races`, [], "singleRow")[0];
            let newRaceId = maxRaceId + 1;
            for (const entry of changes2026.Calendar) {
                const { TrackID, Day, WeekendType } = entry;
                if (TrackID === null) {
                    continue;
                }

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
                ? AS RaceID,
                2026 AS SeasonID,
                r.TrackID,
                ? AS Day,
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
                ? AS WeekendType
                FROM Races r
                WHERE r.SeasonID = ?
                AND r.TrackID = ?
                LIMIT 1
            `, [newRaceId, Day, WeekendType, season, TrackID], 'run');

                newRaceId++;
            }

            //also drop if trackid == 24
            queryDB(`CREATE TRIGGER IF NOT EXISTS delete_duplicate_2026
            AFTER INSERT ON Races
            WHEN NEW.SeasonID = 2026
            AND (
                NEW.TrackID = 24
                OR EXISTS (
                    SELECT 1
                    FROM Races
                    WHERE SeasonID = 2026
                    AND TrackID = NEW.TrackID
                    AND RaceID <> NEW.RaceID
                )
            )
            BEGIN
            DELETE FROM Races
            WHERE RaceID = NEW.RaceID;
            END;`, [], 'run');
            updateSeasonModTable("change-calendar-2026", 1, "2026");
        }
        else if (type === "Direct2026") {
            let maxRaceId = queryDB(`SELECT MAX(RaceID) FROM Races`, [], "singleRow")[0];
            let newRaceId = maxRaceId + 1;
            let firstNewRaceID = newRaceId;

            for (const entry of changes.Calendar) {
                const { TrackID, Day, WeekendType } = entry;

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
                    ? AS RaceID,
                    2026 AS SeasonID,
                    r.TrackID,
                    ? AS Day,
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
                    ? AS WeekendType
                FROM Races r
                WHERE r.SeasonID = 2026
                AND r.TrackID = ?
                LIMIT 1
            `, [newRaceId, Day, WeekendType, TrackID], 'run');

                newRaceId++;
            }

            // Borra las filas antiguas de la temporada 2026
            queryDB(`
                DELETE FROM Races 
                WHERE SeasonID = 2026
                AND RaceID < ?
            `, [firstNewRaceID], 'run');
            updateSeasonModTable("change-calendar-2026", 1, "2026");
        }
    }
}

export function insertStaff2025() {
    let tables = ["Staff_BasicData", "Staff_PerformanceStats", "Staff_State", "Staff_DriverData", "Staff_GameData"];
    tables.forEach((table) => {
        if (changes[table] && Array.isArray(changes[table])) {
            changes[table].forEach((entry) => {
                let columns = Object.keys(entry).join(", ");
                let values = Object.values(entry);

                // Generate placeholders for values
                let placeholders = values.map(() => "?").join(", ");

                // Filter null values for SQL
                let sqlValues = values.map(value => value === null ? null : value);

                // Table names cannot be parameterized, but values can
                queryDB(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, sqlValues, 'run');
            });
        }
    });
    changeBudgets();
    updateSeasonModTable("extra-drivers", 1, "2025");
}

function changeBudgets() {
    queryDB(`UPDATE Finance_TeamBalance SET Balance = Balance + 15000000`, [], 'run');
}


export function removeFastestLap(mod = "2025") {
    queryDB(`UPDATE Regulations_Enum_Changes SET CurrentValue = 0, PreviousValue = 1 WHERE ChangeID = 9`, [], 'run');
    if (mod === "2025") {
        updateSeasonModTable("change-regulations", 1, "2025");
    }
}

function updateSeasonModTable(edit, value, mod = "2025") {
    const table = mod === "2026" ? "Custom_2026_SeasonMod" : "Custom_2025_SeasonMod";
    queryDB(`INSERT OR REPLACE INTO ${table} (key, value) VALUES (?, ?)`, [edit, value], 'run');
}

export function updatePerofmrnace2025() {
    const globals = getGlobals();
    const teamDict = getBestParts(globals.isCreateATeam);
    let tyreDegDict = {};


    for (let team of Object.keys(teamDict).filter(key => key !== "0")) {
        //remove the part 0 from teamDict[team]
        delete teamDict[team]["0"];
        let teamboost = changes.Performance.find(x => x.TeamID === Number(team));
        applyBoostToCarStats(teamDict[team], teamboost.Boost, teamboost.TeamID);
        const tyreDegStatsTemas = getTyreDegStats(teamDict[team]);
        tyreDegDict[team] = tyreDegStatsTemas;
    }

    for (let team of Object.keys(teamDict).filter(key => key !== "0")) {
        let teamGivingTyreDeg = changes.Performance.find(x => x.TeamID === Number(team)).TyreDeg;
        let tyreDegStats = tyreDegDict[teamGivingTyreDeg];
        updateTyreDegStats(teamDict[team], tyreDegStats, team, teamGivingTyreDeg);
    }

    updateSeasonModTable("change-performance", 1, "2025");

}

export function fixes_mod() {
    let error = false;
    const extraDrivers = queryDB(`SELECT value FROM Custom_2025_SeasonMod WHERE key = 'extra-drivers'`, [], "singleValue");
    if (extraDrivers === "1") {
        if (!changes.Fixes || !Array.isArray(changes.Fixes)) {
            console.log("No fixes found");
        }
        else {
            for (const fix of changes.Fixes) {
                const { StaffID, Table, Column, Value } = fix;
                // console.log(`SELECT ${Column} FROM ${Table} WHERE StaffID = ${StaffID}`);
                // Column and Table cannot be parameterized
                const value = queryDB(`SELECT ${Column} FROM ${Table} WHERE StaffID = ?`, [StaffID], "singleValue");
                if (value !== undefined && value !== Value) {
                    queryDB(`UPDATE ${Table} SET ${Column} = ? WHERE StaffID = ?`, [Value, StaffID], 'run');
                    error = true;
                }

            }

        }
    }

    return error;
}

export function updateEditsWithModData(data) {
    const selectorAliases = {
        "change-cfd-2026": [".add-results-2026"]
    };

    for (let key in data) {
        if (data[key] === "1") {
            const selectors = [`.${key}`, ...(selectorAliases[key] || [])];
            selectors.forEach((sel) => {
                const elem = document.querySelector(sel);
                if (!elem) return;
                elem.classList.add("completed")
                elem.classList.remove("disabled")
                const span = elem.querySelector("span");
                if (span) span.textContent = "Applied"
            });
        }
    }
}

export function updateRenaultToHonda(isHonda) {
    const newName = isHonda ? 'Honda' : 'Renault';
    queryDB(`UPDATE Custom_Engines_List SET name = ? WHERE engineId = 10`, [newName], 'run');
    setCustomSaveConfig('renaultEngine', isHonda ? 'honda' : 'renault');
}

export function addAudiCustomEngine(unitValue = 80) {
    const [customEngines] = fetchEngines();
    const normalizedName = (val) => String(val || "").trim().toLowerCase();

    let audiEngineId = null;
    const existingAudi = customEngines.find((engine) => normalizedName(engine?.[2]) === "audi");
    if (existingAudi) {
        audiEngineId = existingAudi[0];
    }
    else {
        const maxEngineId = customEngines.reduce((max, engine) => {
            const id = Number(engine?.[0]);
            if (!Number.isFinite(id)) return max;
            return Math.max(max, id);
        }, 0);
        audiEngineId = maxEngineId ? (maxEngineId + 3) : 14;
    }

    updateCustomEngines({
        [audiEngineId]: {
            name: "audi",
            stats: {
                6: unitValue,
                10: unitValue,
                11: unitValue,
                12: unitValue,
                14: unitValue,
                18: unitValue,
                19: unitValue
            }
        }
    });

    // Part of the 2026 regulations workflow (engines are changed here).
    updateSeasonModTable("change-regulations-2026", 1, "2026");

    return audiEngineId;
}


export function apply2026EnginePerformanceChanges() {
    updateRenaultToHonda(true);

    let audiEngineId = null;
    try {
        audiEngineId = addAudiCustomEngine(80);
    }
    catch (e) {
        console.warn("Failed to add custom Audi engine:", e);
    }

    try {
        manage_engine_change(10, 10);
        if (audiEngineId != null) {
            manage_engine_change(9, audiEngineId);
        }
        manage_engine_change(5, 7);
    }
    catch (e) {
        console.warn("Failed to update engine allocations:", e);
    }

    const enginePerformance = changes2026?.EnginePerformance || {};
    const engineStatsById = {
        1: enginePerformance.ferrari,
        4: enginePerformance.rbpt,
        7: enginePerformance.mercedes,
        10: enginePerformance.honda
    };

    if (audiEngineId != null) {
        engineStatsById[audiEngineId] = enginePerformance.audi;
    }

    const enginesToEdit = Object.fromEntries(
        Object.entries(engineStatsById).filter(([, stats]) => !!stats)
    );

    if (Object.keys(enginesToEdit).length > 0) {
        editEngines(enginesToEdit);
    }
}

export function insertStaff2026() {
    let tables = ["Staff_BasicData", "Staff_State", "Staff_DriverData", "Staff_GameData"];
    tables.forEach((table) => {
        if (tables2026[table] && Array.isArray(tables2026[table])) {
            tables2026[table].forEach((entry) => {
                let columns = Object.keys(entry).join(", ");
                let values = Object.values(entry);

                // Generate placeholders for values
                let placeholders = values.map(() => "?").join(", ");

                // Filter null values for SQL
                let sqlValues = values.map(value => value === null ? null : value);
                //check if the entry already exists in the table to avoid duplicates
                let primaryKeyColumn = "StaffID";
                const existingEntry = queryDB(`SELECT * FROM ${table} WHERE ${primaryKeyColumn} = ?`, [entry[primaryKeyColumn]], "singleRow");

                if (!existingEntry) {
                    // Table names cannot be parameterized, but values can
                    queryDB(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, sqlValues, 'run');
                }
                else {
                    //update existing entry with new data
                    let setClause = Object.keys(entry).filter(key => key !== primaryKeyColumn).map(key => `${key} = ?`).join(", ");
                    let updateValues = Object.keys(entry).filter(key => key !== primaryKeyColumn).map(key => entry[key]);
                    updateValues.push(entry[primaryKeyColumn]);
                    queryDB(`UPDATE ${table} SET ${setClause} WHERE ${primaryKeyColumn} = ?`, updateValues, 'run');
                }

            });
        }
    });
    updateSeasonModTable("extra-drivers-2026", 1, "2026");
}

export function changeStats2026() {
    if (!tables2026.Staff_PerformanceStats || !Array.isArray(tables2026.Staff_PerformanceStats)) {
        console.log("No stats found");
    }
    else {
        tables2026.Staff_PerformanceStats.forEach((entry) => {
            //check if the driver already has performance stats
            let existingStats = queryDB(`SELECT 1 FROM Staff_PerformanceStats WHERE StaffID = ? AND StatID = ?`, [entry.StaffID, entry.StatID], "singleRow");
            if (existingStats) {
                //update where staffid = entry.staffid and statid = entry.statid
                let setClause = Object.keys(entry).filter(key => key !== "StaffID" && key !== "StatID").map(key => `${key} = ?`).join(", ");
                let values = Object.keys(entry).filter(key => key !== "StaffID" && key !== "StatID").map(key => entry[key]);
                //if all of the values[1] are 0, skip
                if (values.slice(1).every(v => v === 0)) {
                    // console.log("Skipping update for StaffID:", entry.StaffID, "StatID:", entry.StatID);
                    return;
                }
                values.push(entry.StaffID); // Add StaffID at the end for the WHERE clause
                values.push(entry.StatID); // Add StatID at the end for the WHERE clause
                queryDB(`UPDATE Staff_PerformanceStats SET ${setClause} WHERE StaffID = ? AND StatID = ?`, values, 'run');
            }
            else {
                //check if the staff ID exists in staff_basicData, if not, skip
                const staffExists = queryDB(`SELECT 1 FROM Staff_BasicData WHERE StaffID = ?`, [entry.StaffID], "singleRow");
                if (!staffExists) {
                    console.log("StaffID:", entry.StaffID, "does not exist in Staff_BasicData. Skipping performance stats insertion.");
                    return;
                }
                let columns = Object.keys(entry).join(", ");
                let values = Object.values(entry);
                // Generate placeholders for values
                let placeholders = values.map(() => "?").join(", ");
                // Filter null values for SQL
                let sqlValues = values.map(value => value === null ? null : value);
                queryDB(`INSERT INTO Staff_PerformanceStats (${columns}) VALUES (${placeholders})`, sqlValues, 'run');
            }

        });
        updateSeasonModTable("change-stats-2026", 1, "2026");
    }

}

export function changeLineUps2026() {
    if (!tables2026.Staff_Contracts || !Array.isArray(tables2026.Staff_Contracts)) {
        console.log("No contracts found");
    }
    else {
        wipeTableAndRefill("Staff_Contracts", tables2026.Staff_Contracts);
        updateSeasonModTable("change-line-ups-2026", 1, "2026");
    }

    if (!tables2026.Staff_RaceEngineerDriverAssignments || !Array.isArray(tables2026.Staff_RaceEngineerDriverAssignments)) {
        console.log("No race engineer driver assignments found");
    }
    else {
        wipeTableAndRefill("Staff_RaceEngineerDriverAssignments", tables2026.Staff_RaceEngineerDriverAssignments);
    }

}

export function changeDriverNumbers2026() {
    if (!tables2026.Staff_DriverNumbers || !Array.isArray(tables2026.Staff_DriverNumbers)) {
        console.log("No driver numbers found");
    }
    else {
        tables2026.Staff_DriverNumbers.forEach((entry) => {
            const { CurrentHolder, Number } = entry;
            let driverExists = queryDB(`SELECT 1 FROM Staff_DriverData WHERE StaffID = ?`, [CurrentHolder], "singleRow");
            if (driverExists) {
                queryDB(`UPDATE Staff_DriverNumbers SET CurrentHolder = ? WHERE Number = ?`, [CurrentHolder, Number], 'run');
            }
            else if (CurrentHolder !== null) {
                console.log("Driver with StaffID:", CurrentHolder, "does not exist. Skipping driver number update for number:", Number);
            }
        });
    }
}

export function updatePerofmrnace2026() {
    const globals = getGlobals();
    const customTeam = globals.isCreateATeam;

    const perf = getPerformanceAllTeams(null, null, customTeam);
    const ovr32 = perf[32];

    const teamDict = getBestParts(customTeam);
    let tyreDegDict = {};

    for (let team of Object.keys(teamDict).filter(key => key !== "0")) {
        delete teamDict[team]["0"];

        const teamId = Number(team);
        let teamboost = changes2026.Performance.find(x => x.TeamID === teamId);

        if (teamId === 32) {
            const objective = teamboost?.Objective ?? 23.4;

            const dynamicBoost =
                (typeof ovr32 === "number" && ovr32 > 0)
                    ? (objective / ovr32)
                    : (teamboost?.Boost ?? 1);

            applyBoostToCarStats(teamDict[team], dynamicBoost, teamId);
        } else {
            applyBoostToCarStats(teamDict[team], teamboost.Boost, teamId);
        }

        const tyreDegStatsTemas = getTyreDegStats(teamDict[team]);
        tyreDegDict[team] = tyreDegStatsTemas;
    }


    for (let team of Object.keys(teamDict).filter(key => key !== "0")) {
        let teamGivingTyreDeg = changes2026.Performance.find(x => x.TeamID === Number(team)).TyreDeg;
        let tyreDegStats = tyreDegDict[teamGivingTyreDeg];
        updateTyreDegStats(teamDict[team], tyreDegStats, team, teamGivingTyreDeg);
    }

    updateSeasonModTable("change-performance-2026", 1, "2026");
}