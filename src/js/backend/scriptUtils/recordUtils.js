import { queryDB, setMetaData, getMetadata } from "../dbManager.js";
import { formatNamesSimple, fetchDriverOfTheDayCounts, fetchDriversStandings, fetchTeamsStandingsWithPoints, fetchTeamMateQualiRaceHeadToHead, fetchTeamSeasonPodiumsTotals, fetchTeamSeasonPolesTotals, fetchTeamSeasonWinsTotals, ensureCustomDoDRankingTable } from "./dbUtils.js";
import records from "../../../data/records.json";
import { getGlobals } from "../commandGlobals.js";
function idsToCsv(ids) {
    return Array.from(new Set(ids)).filter(x => x != null).join(",");
}

function fetchHistoryMap(tableName, ids) {
    if (!ids.length) return new Map();
    const placeholders = ids.map(() => '?').join(',');
    const rows = queryDB(`
    SELECT 
      StaffID,
      TotalStarts,
      FirstRace   AS FirstRaceSeason,   FirstRaceTrackID,
      FirstPodium AS FirstPodiumSeason, FirstPodiumTrackID,
      FirstWin    AS FirstWinSeason,    FirstWinTrackID,
      LastWin     AS LastWinSeason,     LastWinTrackID,
      TotalPoles, TotalPodiums, TotalWins, TotalSprintWins, TotalChampionshipWins, TotalPointsScored, TotalFastestLaps
    FROM ${tableName}
    WHERE StaffID IN (${placeholders})
    AND Formula = 1
  `, ids, 'allRows') || [];

    const map = new Map();
    for (const r of rows) {
        map.set(r[0], {
            totalStarts: r[1] ?? 0,
            firstRace: { season: r[2], trackId: r[3] },
            firstPodium: { season: r[4], trackId: r[5] },
            firstWin: { season: r[6], trackId: r[7] },
            lastWin: { season: r[8], trackId: r[9] },
            totalPoles: r[10] ?? 0,
            totalPodiums: r[11] ?? 0,
            totalWins: r[12] ?? 0,
            totalSprintWins: r[13] ?? 0,
            totalChampionshipWins: r[14] ?? 0,
            totalPointsScored: r[15] ?? 0,
            totalFastestLaps: r[16] ?? 0
        });
    }
    return map;
}

export function fetchDriverHistoryRecords(historyTable, ids, season) {
    const map = new Map();
    if (!ids || !ids.length) return map;

    const placeholders = ids.map(() => '?').join(',');

    const historyRows = queryDB(`
    SELECT 
      StaffID,
      TotalStarts,
      FirstRace   AS FirstRaceSeason,   FirstRaceTrackID,
      FirstPodium AS FirstPodiumSeason, FirstPodiumTrackID,
      FirstWin    AS FirstWinSeason,    FirstWinTrackID,
      LastWin     AS LastWinSeason,     LastWinTrackID,
      TotalPoles, TotalPodiums, TotalWins, TotalSprintWins, TotalChampionshipWins, TotalPointsScored, TotalFastestLaps
    FROM ${historyTable}
    WHERE StaffID IN (${placeholders})
      AND Formula = 1
  `, ids, 'allRows') || [];

    for (const r of historyRows) {
        map.set(r[0], {
            totalStarts: r[1] ?? 0,
            firstRace: { season: r[2] ?? null, trackId: r[3] ?? null },
            firstPodium: { season: r[4] ?? null, trackId: r[5] ?? null },
            firstWin: { season: r[6] ?? null, trackId: r[7] ?? null },
            lastWin: { season: r[8] ?? null, trackId: r[9] ?? null },
            totalPoles: r[10] ?? 0,
            totalPodiums: r[11] ?? 0,
            totalWins: r[12] ?? 0,
            totalSprintWins: r[13] ?? 0,
            totalChampionshipWins: r[14] ?? 0,
            totalPointsScored: r[15] ?? 0,
            totalFastestLaps: r[16] ?? 0,
        });
    }

    for (const id of ids) {
        if (!map.has(id)) {
            map.set(id, {
                totalStarts: 0,
                firstRace: { season: null, trackId: null },
                firstPodium: { season: null, trackId: null },
                firstWin: { season: null, trackId: null },
                lastWin: { season: null, trackId: null },
                totalPoles: 0, totalPodiums: 0, totalWins: 0,
                totalSprintWins: 0, totalChampionshipWins: 0,
                totalPointsScored: 0, totalFastestLaps: 0
            });
        }
    }

    if (season != null) {
        const seasonRows = queryDB(`
      SELECT
        StaffID,
        TotalPoles, TotalPodiums, TotalWins, TotalSprintWins,
        TotalChampionshipWins, TotalPointsScored, TotalFastestLaps, TotalStarts
      FROM Staff_Driver_RaceRecordPerSeason
      WHERE StaffID IN (${placeholders})
        AND SeasonID = ?
    `, [...ids, season], 'allRows') || [];

        for (const r of seasonRows) {
            const id = r[0];
            const base = map.get(id) || {
                totalStarts: 0,
                firstRace: { season: null, trackId: null },
                firstPodium: { season: null, trackId: null },
                firstWin: { season: null, trackId: null },
                lastWin: { season: null, trackId: null },
                totalPoles: 0, totalPodiums: 0, totalWins: 0,
                totalSprintWins: 0, totalChampionshipWins: 0,
                totalPointsScored: 0, totalFastestLaps: 0,
                totalStarts: 0
            };

            base.totalPoles = r[1] ?? 0;
            base.totalPodiums = r[2] ?? 0;
            base.totalWins = r[3] ?? 0;
            base.totalSprintWins = r[4] ?? 0;
            base.totalChampionshipWins = r[5] ?? 0;
            base.totalPointsScored = r[6] ?? 0;
            base.totalFastestLaps = r[7] ?? 0;
            base.totalStarts = r[8] ?? 0;

            map.set(id, base);
        }
    }

    return map;
}



function validSeason(x) {
    return x && x.season && x.season !== 0;
}

export function enrichDriversWithHistory(drivers, season = null) {
    if (!drivers || drivers.length === 0) return drivers;

    const ids = drivers.map(d => d.id);

    const BEFORE = "Staff_Driver_RaceRecordBeforeGameStart";
    const SINCE = "Staff_Driver_RaceRecordSinceGameStart";

    const bMap = fetchDriverHistoryRecords(BEFORE, ids, season);
    const sMap = fetchDriverHistoryRecords(SINCE, ids, season);

    return drivers.map(d => {
        const b = bMap.get(d.id) || {};
        const s = sMap.get(d.id) || {};

        const firstRace = validSeason(b.firstRace) ? b.firstRace : (validSeason(s.firstRace) ? s.firstRace : { season: 0, trackId: null });
        const firstPodium = validSeason(b.firstPodium) ? b.firstPodium : (validSeason(s.firstPodium) ? s.firstPodium : { season: 0, trackId: null });
        const firstWin = validSeason(b.firstWin) ? b.firstWin : (validSeason(s.firstWin) ? s.firstWin : { season: 0, trackId: null });

        const lastWin = validSeason(s.lastWin) ? s.lastWin : (validSeason(b.lastWin) ? b.lastWin : { season: 0, trackId: null });

        let totalPoles, totalPodiums, totalWins, totalSprintWins, totalChampionshipWins, totalPointsScored, totalFastestLaps, totalStarts;

        if (!season) {
            totalPoles = (b.totalPoles ?? 0) + (s.totalPoles ?? 0);
            totalPodiums = (b.totalPodiums ?? 0) + (s.totalPodiums ?? 0);
            totalWins = (b.totalWins ?? 0) + (s.totalWins ?? 0);
            totalSprintWins = (b.totalSprintWins ?? 0) + (s.totalSprintWins ?? 0);
            totalChampionshipWins = (b.totalChampionshipWins ?? 0) + (s.totalChampionshipWins ?? 0);
            totalPointsScored = (b.totalPointsScored ?? 0) + (s.totalPointsScored ?? 0);
            totalFastestLaps = (b.totalFastestLaps ?? 0) + (s.totalFastestLaps ?? 0);
            totalStarts = (b.totalStarts ?? 0) + (s.totalStarts ?? 0);
        } else {
            totalPoles = s.totalPoles ?? 0;
            totalPodiums = s.totalPodiums ?? 0;
            totalWins = s.totalWins ?? 0;
            totalSprintWins = s.totalSprintWins ?? 0;
            totalChampionshipWins = s.totalChampionshipWins ?? 0;
            totalPointsScored = s.totalPointsScored ?? 0;
            totalFastestLaps = s.totalFastestLaps ?? 0;
            totalStarts = s.totalStarts ?? 0;
        }

        return {
            ...d,
            totalStarts,
            firstRace,
            firstPodium,
            firstWin,
            lastWin,
            totalPoles,
            totalPodiums,
            totalWins,
            totalSprintWins,
            totalChampionshipWins,
            totalPointsScored,
            totalFastestLaps
        };
    });
}

export function getSelectedRecord(type, year) {
    let recordTargetColumn, recordTargetTable;

    if (type === "dotd") {
        if (year === "all") {
            ensureCustomDoDRankingTable();
            const rows = queryDB(`
        SELECT
          bas.FirstName,
          bas.LastName,
          t.DriverID,
          COUNT(*) AS Count,
          COALESCE((
            SELECT w.TeamID
            FROM Custom_DriverOfTheDay_Ranking w
            JOIN Races r ON r.RaceID = w.RaceID
            WHERE w.Rank = 1
              AND w.DriverID = t.DriverID
            ORDER BY w.Season DESC, r.Day DESC, w.RaceID DESC
            LIMIT 1
          ), -1) AS TeamID,
          COALESCE(gam.Retired, 0) AS Retired
        FROM Custom_DriverOfTheDay_Ranking t
        JOIN Staff_BasicData bas ON bas.StaffID = t.DriverID
        LEFT JOIN Staff_GameData gam ON gam.StaffID = t.DriverID
        WHERE t.Rank = 1
        GROUP BY t.DriverID
        ORDER BY Count DESC
      `, [], 'allRows') || [];

            const formatted = rows.map(r => ({
                name: formatNamesSimple([r[0], r[1]])[0],
                id: r[2],
                record: type,
                value: r[3],
                teamId: r[4],
                retired: r[5],
            }));

            return enrichDriversWithHistory(formatted);
        }

        const counts = fetchDriverOfTheDayCounts(year) || [];
        const formatted = counts.map(r => ({
            name: r.name,
            id: r.id,
            record: type,
            value: r.count,
            teamId: r.teamId,
            retired: 0,
        })).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

        return enrichDriversWithHistory(formatted, year);
    }

    if (type === "wins") recordTargetColumn = "TotalWins";
    else if (type === "podiums") recordTargetColumn = "TotalPodiums";
    else if (type === "poles") recordTargetColumn = "TotalPoles";
    else if (type === "champs") recordTargetColumn = "TotalChampionshipWins";
    else if (type === "fastestlaps") recordTargetColumn = "TotalFastestLaps";
    else if (type === "points") recordTargetColumn = "TotalPointsScored";
    else if (type === "races") recordTargetColumn = "TotalStarts";

    if (year === "all") {
        const recordTargetTableBefore = "Staff_Driver_RaceRecordBeforeGameStart";
        const recordTargetTableSince = "Staff_Driver_RaceRecordSinceGameStart";

        const beforeGameStart = queryDB(`
      SELECT bas.FirstName, bas.LastName, tab1.StaffID, tab1.${recordTargetColumn}, COALESCE(con.TeamID, -1) AS TeamID, gam.Retired
      FROM ${recordTargetTableBefore} tab1
      JOIN Staff_BasicData bas ON tab1.StaffID = bas.StaffID
      LEFT JOIN Staff_Contracts con ON tab1.StaffID = con.StaffID AND con.ContractType = 0
      LEFT JOIN Staff_GameData gam ON tab1.StaffID = gam.StaffID
      WHERE tab1.Formula = 1 AND tab1.${recordTargetColumn} IS NOT 0
      ORDER BY tab1.${recordTargetColumn} DESC
    `, [], 'allRows');

        const sinceGameStart = queryDB(`
      SELECT bas.FirstName, bas.LastName, tab1.StaffID, tab1.${recordTargetColumn}, COALESCE(con.TeamID, -1) AS TeamID, gam.Retired
      FROM ${recordTargetTableSince} tab1
      JOIN Staff_BasicData bas ON tab1.StaffID = bas.StaffID
      LEFT JOIN Staff_Contracts con ON tab1.StaffID = con.StaffID AND con.ContractType = 0
      LEFT JOIN Staff_GameData gam ON tab1.StaffID = gam.StaffID
      WHERE tab1.Formula = 1 AND tab1.${recordTargetColumn} IS NOT 0
      ORDER BY tab1.${recordTargetColumn} DESC
    `, [], 'allRows');

        const formattedBefore = beforeGameStart.map(r => ({
            name: formatNamesSimple([r[0], r[1]])[0],
            id: r[2],
            record: type,
            value: r[3],
            teamId: r[4],
            retired: r[5],
        }));

        const formattedSince = sinceGameStart.map(r => ({
            name: formatNamesSimple([r[0], r[1]])[0],
            id: r[2],
            record: type,
            value: r[3],
            teamId: r[4],
            retired: r[5],
        }));

        const byId = {};
        formattedBefore.forEach(r => { byId[r.id] = { ...r }; });
        formattedSince.forEach(r => {
            if (byId[r.id]) byId[r.id].value += r.value;
            else byId[r.id] = { ...r };
        });

        const combinedArray = Object.values(byId).sort((a, b) => b.value - a.value);

        // enriquecemos aquí
        const enriched = enrichDriversWithHistory(combinedArray);

        const ALLTIME_EXTERNAL_DRIVERS = records;
        const merged = mergeWithExternalRecords(enriched, ALLTIME_EXTERNAL_DRIVERS, type, year);

        //sort again after merging
        merged.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

        console.log("final all-time records:", merged);

        return merged;
    }
    else {
        // temporada concreta
        recordTargetTable = "Staff_Driver_RaceRecordPerSeason";

        const record = queryDB(`
    SELECT 
        bas.FirstName,
        bas.LastName,
        tab1.StaffID,
        tab1.${recordTargetColumn},

        -- Team en la ÚLTIMA carrera de esa temporada
        COALESCE((
        SELECT rr.TeamID
        FROM Races_Results rr
        JOIN Races r ON r.RaceID = rr.RaceID
        WHERE rr.DriverID = tab1.StaffID
            AND r.SeasonID = ?
        ORDER BY r.Day DESC, r.RaceID DESC
        LIMIT 1
        ), -1) AS TeamID,

        COALESCE(gam.Retired, 0) AS Retired

    FROM Staff_Driver_RaceRecordPerSeason tab1
    JOIN Staff_BasicData bas ON tab1.StaffID = bas.StaffID
    LEFT JOIN Staff_GameData gam ON tab1.StaffID = gam.StaffID
    WHERE tab1.SeasonID = ?
        AND tab1.${recordTargetColumn} IS NOT 0
        AND (tab1.TeamID <= 10 OR tab1.TeamID = 32)
    ORDER BY tab1.${recordTargetColumn} DESC
    `, [year, year], 'allRows');

        const formatted = (record || []).map(r => ({
            name: formatNamesSimple([r[0], r[1]])[0],
            id: r[2],
            record: type,
            value: r[3],
            teamId: r[4],
            retired: r[5],
        })).sort((a, b) => b.value - a.value);

        // enriquecemos también para temporada concreta con histórico all-time
        return enrichDriversWithHistory(formatted, year);

    }

}

export function fetchSeasonReviewData(year, formula = 1, isCurrentYear = true) {
    const teamsStandings = fetchTeamsStandingsWithPoints(year, formula);
    const driversStandings = fetchDriversStandings(year, formula);
    const winsRecords = getSelectedRecord("wins", year);
    const polesRecords = getSelectedRecord("poles", year);
    const podiumsRecords = getSelectedRecord("podiums", year);
    const teamWinsTotals = fetchTeamSeasonWinsTotals(year, formula);
    const teamPolesTotals = fetchTeamSeasonPolesTotals(year, formula);
    const teamPodiumsTotals = fetchTeamSeasonPodiumsTotals(year, formula);
    const qualifyingStageCounts = fetchQualifyingStageCounts(year, formula, isCurrentYear);
    const driverOfTheDayCounts = Number(formula) === 1 ? fetchDriverOfTheDayCounts(year) : [];
    const teamMateHeadToHead = Number(formula) === 1 ? fetchTeamMateQualiRaceHeadToHead(year) : [];

    return {
        year,
        formula,
        teamsStandings,
        driversStandings,
        qualifyingStageCounts,
        driverOfTheDayCounts,
        teamMateHeadToHead,
        teamWinsTotals,
        teamPolesTotals,
        teamPodiumsTotals,
        polesRecords,
        podiumsRecords,
        winsRecords
    };
}

export function getSelectedTeamRecord(type, year, formula = 1) {
    if (!type) return [];
    if (String(year) === "all") return [];

    const recordType = String(type);

    let base = [];
    let breakdownRows = [];
    if (recordType === "wins") base = fetchTeamSeasonWinsTotals(year, formula);
    else if (recordType === "podiums") base = fetchTeamSeasonPodiumsTotals(year, formula);
    else if (recordType === "poles") base = fetchTeamSeasonPolesTotals(year, formula);
    else if (recordType === "dotd") {
        if (Number(formula) !== 1) return [];

        ensureCustomDoDRankingTable();
        const globals = getGlobals();
        const teamFilterSql = globals.isCreateATeam
            ? `(t.TeamID BETWEEN 1 AND 10 OR t.TeamID = 32)`
            : `(t.TeamID BETWEEN 1 AND 10)`;

        const rows = queryDB(`
      SELECT t.TeamID, COUNT(*) AS Cnt
      FROM Custom_DriverOfTheDay_Ranking t
      WHERE t.Season = ?
        AND t.Rank = 1
        AND ${teamFilterSql}
      GROUP BY t.TeamID
      ORDER BY Cnt DESC, t.TeamID ASC
    `, [year], 'allRows') || [];

        base = rows.map(r => ({
            teamId: Number(r[0]),
            value: Number(r[1]) || 0,
        }));

        breakdownRows = queryDB(`
      SELECT
        t.TeamID,
        t.DriverID,
        bas.FirstName,
        bas.LastName,
        COUNT(*) AS Cnt
      FROM Custom_DriverOfTheDay_Ranking t
      JOIN Staff_BasicData bas ON bas.StaffID = t.DriverID
      WHERE t.Season = ?
        AND t.Rank = 1
        AND ${teamFilterSql}
      GROUP BY t.TeamID, t.DriverID
      ORDER BY t.TeamID ASC, Cnt DESC
    `, [year], 'allRows') || [];
    }
    else {
        return [];
    }

    const breakdownByTeamId = new Map();
    if (recordType === "wins" || recordType === "podiums" || recordType === "poles") {
        if (Number(formula) !== 1) return base;
        const globals = getGlobals();
        const teamFilterSql = globals.isCreateATeam
            ? `(rr.TeamID BETWEEN 1 AND 10 OR rr.TeamID = 32)`
            : `(rr.TeamID BETWEEN 1 AND 10)`;

        let whereSql = "";
        if (recordType === "wins") whereSql = `rr.FinishingPos = 1`;
        else if (recordType === "podiums") whereSql = `rr.FinishingPos BETWEEN 1 AND 3`;
        else whereSql = `rr.StartingPos = 1`;

        breakdownRows = queryDB(`
      SELECT
        rr.TeamID,
        rr.DriverID,
        bas.FirstName,
        bas.LastName,
        COUNT(*) AS Cnt
      FROM Races_Results rr
      JOIN Staff_BasicData bas ON bas.StaffID = rr.DriverID
      WHERE rr.Season = ?
        AND ${teamFilterSql}
        AND ${whereSql}
      GROUP BY rr.TeamID, rr.DriverID
      ORDER BY rr.TeamID ASC, Cnt DESC
    `, [year], 'allRows') || [];
    }

    breakdownRows.forEach((r) => {
        const teamId = Number(r[0]);
        const driverId = Number(r[1]);
        const count = Number(r[4]) || 0;
        if (!Number.isFinite(teamId) || !Number.isFinite(driverId) || count <= 0) return;
        const name = formatNamesSimple([r[2], r[3]])[0];
        if (!breakdownByTeamId.has(teamId)) breakdownByTeamId.set(teamId, []);
        breakdownByTeamId.get(teamId).push({ id: driverId, name, count });
    });

    const lastRaceId = Number(formula) === 1 ? queryDB(`
    SELECT RaceID
    FROM Races
    WHERE SeasonID = ?
      AND State = 2
    ORDER BY Day DESC, RaceID DESC
    LIMIT 1
  `, [year], 'singleValue') : null;

    const attachDriversAndBreakdown = (item) => ({
        ...item,
        breakdown: breakdownByTeamId.get(item.teamId) || [],
        drivers: (() => {
            if (!lastRaceId) return { driver1: null, driver2: null };
            const drivers = fetchTeamDriversAtRace(lastRaceId, item.teamId);
            return {
                driver1: drivers[0] ?? null,
                driver2: drivers[1] ?? null
            };
        })()
    });

    if (!lastRaceId) return base.map(attachDriversAndBreakdown);

    const fetchTeamDriversAtRace = (raceId, teamId) => {
        const rows = queryDB(`
      SELECT DISTINCT rr.DriverID, bas.FirstName, bas.LastName, rr.FinishingPos
      FROM Races_Results rr
      JOIN Staff_BasicData bas ON bas.StaffID = rr.DriverID
      WHERE rr.RaceID = ?
        AND rr.TeamID = ?
      ORDER BY rr.FinishingPos ASC, rr.DriverID ASC
    `, [raceId, teamId], 'allRows') || [];

        return rows.slice(0, 2).map(r => {
            const driverID = r[0];
            const driverName = formatNamesSimple([r[1], r[2]])[0];
            const currentNumber = queryDB(`
        SELECT Number
        FROM Staff_DriverNumbers
        WHERE CurrentHolder = ?
      `, [driverID], 'singleValue');

            return {
                id: Number(driverID),
                name: driverName,
                number: currentNumber != null ? Number(currentNumber) : null
            };
        });
    };

    return base.map(attachDriversAndBreakdown);
}

export function fetchQualifyingStageCounts(year, formula = 1, isCurrentYear = true) {
    if (Number(formula) === 1 && !isCurrentYear) {
        const cutoffQ2 = getGlobals().isCreateATeam ? 16 : 15;
        const rows = queryDB(`
      SELECT
        ds.DriverID,
        bas.FirstName,
        bas.LastName,
        COALESCE((
          SELECT rr.TeamID
          FROM Races_Results rr
          JOIN Races r ON r.RaceID = rr.RaceID
          WHERE rr.DriverID = ds.DriverID
            AND r.SeasonID = ?
          ORDER BY r.Day DESC, r.RaceID DESC
          LIMIT 1
        ), -1) AS TeamID,
        SUM(CASE WHEN rr.StartingPos = 1 THEN 1 ELSE 0 END) AS PoleCount,
        SUM(CASE WHEN rr.StartingPos > 0 AND rr.StartingPos != 99 AND rr.StartingPos <= 10 THEN 1 ELSE 0 END) AS Q3Count,
        SUM(CASE WHEN rr.StartingPos > 0 AND rr.StartingPos != 99 AND rr.StartingPos <= ${cutoffQ2} THEN 1 ELSE 0 END) AS Q2Count
      FROM Races_DriverStandings ds
      JOIN Staff_BasicData bas ON bas.StaffID = ds.DriverID
      LEFT JOIN Races_Results rr
        ON rr.DriverID = ds.DriverID
       AND rr.Season = ?
      WHERE ds.SeasonID = ?
        AND ds.RaceFormula = ?
      GROUP BY ds.DriverID
      ORDER BY PoleCount DESC, Q3Count DESC, Q2Count DESC, ds.Position ASC
    `, [year, year, year, formula], 'allRows') || [];

        return rows.map(r => ({
            id: r[0],
            name: formatNamesSimple([r[1], r[2]])[0],
            teamId: r[3],
            q2Count: r[6] ?? 0,
            q3Count: r[5] ?? 0,
            poleCount: r[4] ?? 0
        }));
    }

    if (Number(formula) === 1) {
        const rows = queryDB(`
      SELECT
        ds.DriverID,
        bas.FirstName,
        bas.LastName,
        COALESCE((
          SELECT rr.TeamID
          FROM Races_Results rr
          JOIN Races r ON r.RaceID = rr.RaceID
          WHERE rr.DriverID = ds.DriverID
            AND r.SeasonID = ?
          ORDER BY r.Day DESC, r.RaceID DESC
          LIMIT 1
        ), -1) AS TeamID,
        COUNT(DISTINCT CASE WHEN q.QualifyingStage = 2 THEN q.RaceID END) AS Q2Count,
        COUNT(DISTINCT CASE WHEN q.QualifyingStage = 3 THEN q.RaceID END) AS Q3Count,
        COUNT(DISTINCT CASE WHEN q.QualifyingStage = 3 AND q.FinishingPos = 1 THEN q.RaceID END) AS PoleCount
      FROM Races_DriverStandings ds
      JOIN Staff_BasicData bas ON bas.StaffID = ds.DriverID
      LEFT JOIN Races_QualifyingResults q
        ON q.DriverID = ds.DriverID
       AND q.SeasonID = ds.SeasonID
       AND q.RaceFormula = ds.RaceFormula
       AND q.QualifyingStage IN (2, 3)
      WHERE ds.SeasonID = ?
        AND ds.RaceFormula = ?
      GROUP BY ds.DriverID
      ORDER BY Q3Count DESC, Q2Count DESC, ds.Position ASC
    `, [year, year, formula], 'allRows') || [];

        return rows.map(r => ({
            id: r[0],
            name: formatNamesSimple([r[1], r[2]])[0],
            teamId: r[3],
            q2Count: r[4] ?? 0,
            q3Count: r[5] ?? 0,
            poleCount: r[6] ?? 0
        }));
    }

    const rows = queryDB(`
    SELECT
      ds.DriverID,
      bas.FirstName,
      bas.LastName,
      COALESCE((
        SELECT fr.TeamID
        FROM Races_FeatureRaceResults fr
        JOIN Races r ON r.RaceID = fr.RaceID
        WHERE fr.DriverID = ds.DriverID
          AND fr.SeasonID = ?
          AND fr.RaceFormula = ?
        ORDER BY r.Day DESC, r.RaceID DESC
        LIMIT 1
      ), -1) AS TeamID,
      COUNT(DISTINCT CASE WHEN q.QualifyingStage = 2 THEN q.RaceID END) AS Q2Count,
      COUNT(DISTINCT CASE WHEN q.QualifyingStage = 3 THEN q.RaceID END) AS Q3Count,
      COUNT(DISTINCT CASE WHEN q.QualifyingStage = 3 AND q.FinishingPos = 1 THEN q.RaceID END) AS PoleCount
    FROM Races_DriverStandings ds
    JOIN Staff_BasicData bas ON bas.StaffID = ds.DriverID
    LEFT JOIN Races_QualifyingResults q
      ON q.DriverID = ds.DriverID
     AND q.SeasonID = ds.SeasonID
     AND q.RaceFormula = ds.RaceFormula
     AND q.QualifyingStage IN (2, 3)
    WHERE ds.SeasonID = ?
      AND ds.RaceFormula = ?
    GROUP BY ds.DriverID
    ORDER BY Q3Count DESC, Q2Count DESC, ds.Position ASC
  `, [year, formula, year, formula], 'allRows') || [];

    return rows.map(r => ({
        id: r[0],
        name: formatNamesSimple([r[1], r[2]])[0],
        teamId: r[3],
        q2Count: r[4] ?? 0,
        q3Count: r[5] ?? 0,
        poleCount: r[6] ?? 0
    }));
}

function pickValueFromType(item, type) {
    if (!item) return 0;
    switch (type) {
        case "wins": return item.totalWins ?? 0;
        case "podiums": return item.totalPodiums ?? 0;
        case "poles": return item.totalPoles ?? 0;
        case "champs": return item.totalChampionshipWins ?? 0;
        case "fastestLaps": return item.totalFastestLaps ?? 0;
        case "points": return item.totalPointsScored ?? 0;
        case "races": return item.totalStarts ?? 0;
        default: return 0;
    }
}

function mapExternalItem(item, type) {
    return {
        ...item,
        // forzados como pediste
        id: -1,
        retired: 1,
        teamId: -1,
        record: type,
        value: pickValueFromType(item, type),

        // por si en tu app esperas que existan siempre
        totalStarts: item.totalStarts ?? 0,
        totalPoles: item.totalPoles ?? 0,
        totalPodiums: item.totalPodiums ?? 0,
        totalWins: item.totalWins ?? 0,
        totalSprintWins: item.totalSprintWins ?? 0,
        totalChampionshipWins: item.totalChampionshipWins ?? 0,
        totalPointsScored: item.totalPointsScored ?? 0,
        totalFastestLaps: item.totalFastestLaps ?? 0,


        firstRace: item.firstRace ?? { season: 0, trackName: null },
        firstPodium: item.firstPodium ?? { season: 0, trackName: null },
        firstWin: item.firstWin ?? { season: 0, trackName: null },
        lastWin: item.lastWin ?? { season: 0, trackName: null },

    };
}

function mergeWithExternalRecords(dbDrivers, externalJson, type, year) {
    const normName = (name) => {
        return (name || "").replace(/\s+/g, " ").trim().toLowerCase();
    };

    if (year !== "all") return dbDrivers || [];

    const byName = new Set((dbDrivers || []).map(d => normName(d.name)));

    const externalMapped = (externalJson || [])
        .map(it => mapExternalItem(it, type))
        .filter(it => !byName.has(normName(it.name)));

    const merged = [...(dbDrivers || []), ...externalMapped];

    // Ordenamos por la columna value desc
    merged.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return merged;
}
