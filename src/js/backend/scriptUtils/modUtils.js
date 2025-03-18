import { getGlobals } from "../commandGlobals.js";
import { queryDB, setMetaData, getMetadata } from "../dbManager.js";
import { excelToDate, dateToExcel, changeDriverNumber } from "./eidtStatsUtils.js";
import { editContract, fireDriver, hireDriver, rearrangeDriverEngineerPairings, removeFutureContract } from "./transferUtils.js";
import { editSuperlicense } from "./eidtStatsUtils.js";
import { getBestParts, applyBoostToCarStats, getTyreDegStats, updateTyreDegStats } from "./carAnalysisUtils.js";
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
            queryDB(`DELETE FROM ${table} WHERE Season != ${vanillaSeason}`);
            queryDB(`UPDATE ${table} SET Season = Season - ${yd} WHERE Season = ${vanillaSeason}`);
        } else if (table.startsWith("Races") && table.endsWith("Results")) {
            queryDB(`DELETE FROM ${table} WHERE SeasonID != ${vanillaSeason}`);
            queryDB(`UPDATE ${table} SET SeasonID = SeasonID - ${yd} WHERE SeasonID = ${vanillaSeason}`);
        }
    }

    if (extend) {
        queryDB(`UPDATE Staff_Contracts SET EndSeason = EndSeason + 1`);
    }

    setMetaData(metadata)
    update2025SeasonModTable("time-travel", 1);

}

export function changeDriverLineUps() {
    if (contracts.Updates && Array.isArray(contracts.Updates)) {
        contracts.Updates.forEach((update) => {
            const hasContractWithTeam32 = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${update.DriverID} AND TeamID = 32`, "singleRow");
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
                queryDB(`UPDATE Staff_GameData SET Retired = 0 WHERE StaffID = ${DriverID}`);
            }
        });
    }

    if (contracts.Hires && Array.isArray(contracts.Hires)) {
        contracts.Hires.forEach((hire) => {
            const hasContractWithTeam32 = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${hire.DriverID} AND TeamID = 32`, "singleRow");
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

                const contractExists = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${DriverID} AND TeamID = ${TeamID} AND ContractType = 0`, "singleRow");
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
            const hasContractWithTeam32 = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${hire.StaffID} AND TeamID = 32`, "singleRow");
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


    const f1Workers = queryDB(`SELECT StaffID FROM Staff_Contracts WHERE TeamID <= 10 AND PosInTeam <= 2`, "allRows");
    f1Workers.forEach((worker) => {
        removeFutureContract(worker[0]);
    });
    changeDriverNumber(95, 30);

    update2025SeasonModTable("change-line-ups", 1);

}

export function modFire(driverID, teamID, PosInTeam) {
    const isInTeam = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${driverID} AND TeamID = ${teamID} AND ContractType = 0`, "singleRow");
    if (isInTeam) {
        const position = queryDB(`SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = ${driverID}`, "singleValue");
        queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ${driverID} AND ContractType = 0 AND TeamID = ${teamID}`);
        if (position < 3) {
            queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = ${driverID}`);
        }
        const engineerID = queryDB(
            `SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = ${driverID}`,
            "singleValue"
        );
        if (engineerID) {
            queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ${engineerID} AND DriverID = ${driverID}`);
        }
    }
    else {
        const staffType = queryDB(`SELECT StaffType FROM Staff_GameData WHERE StaffID = ${driverID}`, "singleValue");
        const replacement = queryDB(`SELECT con.StaffID FROM Staff_Contracts con
            JOIN Staff_GameData gd ON con.StaffID = gd.StaffID
            WHERE gd.StaffType = ${staffType} AND
            con.TeamID = ${teamID} AND con.PosInTeam = ${PosInTeam} AND con.ContractType = 0`, "singleValue");
        if (replacement) {
            queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ${replacement} AND ContractType = 0 AND TeamID = ${teamID}`);
            if (PosInTeam < 3) {
                queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = ${replacement}`);
            }
            const engineerID = queryDB(
                `SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = ${replacement}`,
                "singleValue"
            );
            if (engineerID) {
                queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ${engineerID} AND DriverID = ${replacement}`);
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
            SET Val = ${Val}, Max = ${Max}
            WHERE StaffID = ${StaffID} AND StatID = ${StatID}
          `);

        }
    }
    update2025SeasonModTable("change-stats", 1);

}

export function changeDriverEngineerPairs() {
    if (!changes.TeamLineUps || !Array.isArray(changes.TeamLineUps)) {
        console.error("No driver-engineer pairs");
    } else {
        for (const entry of changes.TeamLineUps) {
            const { TeamID, Driver1, Engineer1, Driver2, Engineer2 } = entry;

            const areAllInSameTeam =
                queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${Driver1} AND TeamID = ${TeamID} AND PosInTeam <= 2 AND ContractType = 0`, "singleRow") &&
                queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${Driver2} AND TeamID = ${TeamID} AND PosInTeam <= 2 AND ContractType = 0`, "singleRow") &&
                queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${Engineer1} AND TeamID = ${TeamID} AND PosInTeam <= 2 AND ContractType = 0`, "singleRow") &&
                queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${Engineer2} AND TeamID = ${TeamID} AND PosInTeam <= 2 AND ContractType = 0`, "singleRow");


            if (areAllInSameTeam) {
                queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE DriverID = ${Driver1} OR DriverID = ${Driver2}`);
                queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ${Engineer1} OR RaceEngineerID = ${Engineer2}`);

                let driver1Engineer1 = queryDB(`SELECT * FROM Staff_RaceEngineerDriverAssignments WHERE DriverID = ${Driver1} AND RaceEngineerID = ${Engineer1}`, "singleRow");
                let driver2Engineer2 = queryDB(`SELECT * FROM Staff_RaceEngineerDriverAssignments WHERE DriverID = ${Driver2} AND RaceEngineerID = ${Engineer2}`, "singleRow");

                if (driver1Engineer1 && driver1Engineer1.length > 0) {
                    queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE DriverID = ${Driver1} AND RaceEngineerID = ${Engineer1}`);
                } else {
                    queryDB(`INSERT INTO Staff_RaceEngineerDriverAssignments (RaceEngineerID, DriverID, DaysTogether, RelationshipLevel, IsCurrentAssignment) VALUES (${Engineer1}, ${Driver1}, 0, 0, 1)`);
                }

                if (driver2Engineer2 && driver2Engineer2.length > 0) {
                    queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE DriverID = ${Driver2} AND RaceEngineerID = ${Engineer2}`);
                } else {
                    queryDB(`INSERT INTO Staff_RaceEngineerDriverAssignments (RaceEngineerID, DriverID, DaysTogether, RelationshipLevel, IsCurrentAssignment) VALUES (${Engineer2}, ${Driver2}, 0, 0, 1)`);
                }
            }
            else {
                rearrangeDriverEngineerPairings(TeamID)
            }


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
            UPDATE Races_DriverStandings SET LastPointsChange = ${LastPointsChange}, LastPositionChange = ${LastPositionChange}, Points = ${Points}, Position = ${Position}
            WHERE DriverID = ${DriverID} AND RaceFormula = ${RaceFormula} AND SeasonID = ${SeasonID}
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
    update2025SeasonModTable("change-cfd", 1);
}

export function manageFeederSeries() {
    if (!contracts.FeederSeries || !Array.isArray(contracts.FeederSeries)) {
        console.error("No feeder series found");
    } else {
        queryDB(`DELETE FROM Staff_Contracts WHERE PosInTeam <= 3 AND StaffID IN (SELECT StaffID FROM Staff_DriverData) AND TeamID BETWEEN 11 AND 31`);
        queryDB(`UPDATE Staff_DriverData SET FeederSeriesAssignedCarNumber = NULL`)
        const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, "singleRow");
        const day = daySeason[0];
        for (const entry of contracts.FeederSeries) {
            const { DriverID, TeamID, PosInTeam, Salary, EndSeason } = entry;
            queryDB(`INSERT INTO Staff_Contracts (StaffID, ContractType, TeamID, PosInTeam, StartDay, EndSeason, Salary, StartingBonus, RaceBonus, RaceBonusTargetPos, BreakoutClause, AffiliateDualRoleClause)
                 VALUES (${DriverID}, 0, ${TeamID}, ${PosInTeam}, ${day}, ${EndSeason}, ${Salary}, 0, 0, 1, 0.5, 0)`);
            queryDB(`UPDATE Staff_DriverData SET FeederSeriesAssignedCarNumber = ${PosInTeam}, AssignedCarNumber = NULL, LastKnownDriverNumber = NULL WHERE StaffID = ${DriverID}`);
            const driverTeamRaceEngineers = queryDB(`SELECT gd.StaffID FROM Staff_GameData gd
                JOIN Staff_Contracts sc ON gd.StaffID = sc.StaffID
                WHERE gd.StaffType = 2
                AND gd.StaffID IN (SELECT StaffID FROM Staff_Contracts WHERE TeamID = ${TeamID})`, "allRows");
            let newRaceEngineer = driverTeamRaceEngineers[0][0];
            let pairExists = queryDB(`SELECT * FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = ${newRaceEngineer} AND DriverID = ${DriverID}`, "singleRow");
            if (pairExists && pairExists.length > 0) {
                queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = ${newRaceEngineer} AND DriverID = ${DriverID}`);
            } else {
                queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ${newRaceEngineer}`);
                queryDB(`INSERT INTO Staff_RaceEngineerDriverAssignments (RaceEngineerID, DriverID, DaysTogether, RelationshipLevel, IsCurrentAssignment) VALUES (${newRaceEngineer}, ${DriverID}, 0, 0, 1)`);
            }
        }
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
            const hasContractWithTeam32 = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${affiliate.DriverID} AND TeamID = 32`, "singleRow");
            const isFullTimeDriver = queryDB(`SELECT * FROM Staff_Contracts WHERE StaffID = ${affiliate.DriverID} AND PosInTeam <= 2 AND (TeamID <= 10 OR TeamID == 32)`, "singleRow");
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

export function changeRaces(type) {
    if (!changes.Calendar || !Array.isArray(changes.Calendar)) {
        console.log("No calendar data found");
    }
    else {
        if (type === "Start2024" || type === "End2024") {
            let maxRaceId = queryDB(`SELECT MAX(RaceID) FROM Races`, "singleRow")[0];
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
                ${WeekendType} AS WeekendType
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
            update2025SeasonModTable("change-calendar", 1);
        }
        else if (type === "Direct2025") {
            let maxRaceId = queryDB(`SELECT MAX(RaceID) FROM Races`, "singleRow")[0];
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
                    ${WeekendType} AS WeekendType
                FROM Races r
                WHERE r.SeasonID = 2025
                AND r.TrackID = ${TrackID}
                LIMIT 1
            `);

                newRaceId++;
            }

            // Borra las filas antiguas de la temporada 2025
            queryDB(`
            DELETE FROM Races 
            WHERE SeasonID = 2025 
            AND RaceID < ${firstNewRaceID}
        `);

        }
    }

}

export function insertStaff() {
    let tables = ["Staff_BasicData", "Staff_PerformanceStats", "Staff_State", "Staff_DriverData", "Staff_GameData"];
    tables.forEach((table) => {
        if (changes[table] && Array.isArray(changes[table])) {
            changes[table].forEach((entry) => {
                let columns = Object.keys(entry).join(", ");
                let values = Object.values(entry)
                    .map(value => value === null ? "NULL" : typeof value === "string" ? `'${value}'` : value)
                    .join(", ");
                queryDB(`INSERT INTO ${table} (${columns}) VALUES (${values})`);
            });
        }
    });
    changeBudgets();
    update2025SeasonModTable("extra-drivers", 1);
}

function changeBudgets() {
    queryDB(`UPDATE Finance_TeamBalance SET Balance = Balance + 15000000`);
}


export function removeFastestLap() {
    queryDB(`UPDATE Regulations_Enum_Changes SET CurrentValue = 0, PreviousValue = 1 WHERE ChangeID = 9`);
    update2025SeasonModTable("change-regulations", 1);
}

function update2025SeasonModTable(edit, value) {
    queryDB(`INSERT OR REPLACE INTO Custom_2025_SeasonMod (key, value) VALUES ('${edit}', '${value}')`);
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

    update2025SeasonModTable("change-performance", 1);

}

export function fixes_mod() {
    let error = false;
    const extraDrivers = queryDB(`SELECT value FROM Custom_2025_SeasonMod WHERE key = 'extra-drivers'`, "singleValue");
    if (extraDrivers === "1") {
        const lauraMuellerGender = queryDB(`SELECT Gender FROM Staff_BasicData WHERE StaffID = 624`, "singleValue");
        if (lauraMuellerGender === 0) {
            error = true;
            queryDB(`UPDATE Staff_BasicData SET Gender = 1 WHERE StaffID = 624`);
        }
    }

    return error;
}

export function updateEditsWithModData(data) {
    for (let key in data) {
        if (data[key] === "1") {
            document.querySelector(`.${key}`).classList.add("completed")
            document.querySelector(`.${key}`).classList.remove("disabled")
            document.querySelector(`.${key} span`).textContent = "Applied"
        }
    }
}