import { queryDB, setMetaData, getMetadata } from "../dbManager.js";
import { formatNamesSimple } from "./dbUtils.js";

function idsToCsv(ids) {
    return Array.from(new Set(ids)).filter(x => x != null).join(",");
}

function fetchHistoryMap(tableName, ids) {
    if (!ids.length) return new Map();
    const csv = idsToCsv(ids);
    const rows = queryDB(`
    SELECT 
      StaffID,
      TotalStarts,
      FirstRace   AS FirstRaceSeason,   FirstRaceTrackID,
      FirstPodium AS FirstPodiumSeason, FirstPodiumTrackID,
      FirstWin    AS FirstWinSeason,    FirstWinTrackID,
      LastWin     AS LastWinSeason,     LastWinTrackID
    FROM ${tableName}
    WHERE StaffID IN (${csv})
    AND Formula = 1
  `, 'allRows') || [];

    const map = new Map();
    for (const r of rows) {
        map.set(r[0], {
            totalStarts: r[1] ?? 0,
            firstRace: { season: r[2], trackId: r[3] },
            firstPodium: { season: r[4], trackId: r[5] },
            firstWin: { season: r[6], trackId: r[7] },
            lastWin: { season: r[8], trackId: r[9] },
        });
    }
    return map;
}

function validSeason(x) {
    return x && x.season && x.season !== 0;
}

function enrichDriversWithHistory(drivers) {
    if (!drivers || drivers.length === 0) return drivers;

    const ids = drivers.map(d => d.id);

    const BEFORE = "Staff_Driver_RaceRecordBeforeGameStart";
    const SINCE = "Staff_Driver_RaceRecordSinceGameStart";

    const bMap = fetchHistoryMap(BEFORE, ids);
    const sMap = fetchHistoryMap(SINCE, ids);

    return drivers.map(d => {
        const b = bMap.get(d.id) || {};
        const s = sMap.get(d.id) || {};

        const totalStarts = (b.totalStarts ?? 0) + (s.totalStarts ?? 0);

        const firstRace = validSeason(b.firstRace) ? b.firstRace : (validSeason(s.firstRace) ? s.firstRace : { season: 0, trackId: null });
        const firstPodium = validSeason(b.firstPodium) ? b.firstPodium : (validSeason(s.firstPodium) ? s.firstPodium : { season: 0, trackId: null });
        const firstWin = validSeason(b.firstWin) ? b.firstWin : (validSeason(s.firstWin) ? s.firstWin : { season: 0, trackId: null });

        const lastWin = validSeason(s.lastWin) ? s.lastWin : (validSeason(b.lastWin) ? b.lastWin : { season: 0, trackId: null });

        return {
            ...d,
            totalStarts,
            firstRace,
            firstPodium,
            firstWin,
            lastWin,
        };
    });
}

export function getSelectedRecord(type, year) {
    console.log("GETTING RECORD:", type, year);
    let recordTargetColumn, recordTargetTable;

    if (type === "wins") recordTargetColumn = "TotalWins";
    else if (type === "podiums") recordTargetColumn = "TotalPodiums";
    else if (type === "poles") recordTargetColumn = "TotalPoles";
    else if (type === "champs") recordTargetColumn = "TotalChampionshipWins";

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
    `, 'allRows');

        const sinceGameStart = queryDB(`
      SELECT bas.FirstName, bas.LastName, tab1.StaffID, tab1.${recordTargetColumn}, COALESCE(con.TeamID, -1) AS TeamID, gam.Retired
      FROM ${recordTargetTableSince} tab1
      JOIN Staff_BasicData bas ON tab1.StaffID = bas.StaffID
      LEFT JOIN Staff_Contracts con ON tab1.StaffID = con.StaffID AND con.ContractType = 0
      LEFT JOIN Staff_GameData gam ON tab1.StaffID = gam.StaffID
      WHERE tab1.Formula = 1 AND tab1.${recordTargetColumn} IS NOT 0
      ORDER BY tab1.${recordTargetColumn} DESC
    `, 'allRows');

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
        return enrichDriversWithHistory(combinedArray);
    }

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
            AND r.SeasonID = ${year}
        ORDER BY r.Day DESC, r.RaceID DESC
        LIMIT 1
        ), -1) AS TeamID,

        COALESCE(gam.Retired, 0) AS Retired

    FROM Staff_Driver_RaceRecordPerSeason tab1
    JOIN Staff_BasicData bas ON tab1.StaffID = bas.StaffID
    LEFT JOIN Staff_GameData gam ON tab1.StaffID = gam.StaffID
    WHERE tab1.SeasonID = ${year}
        AND tab1.${recordTargetColumn} IS NOT 0
        AND (tab1.TeamID <= 10 OR tab1.TeamID = 32)
    ORDER BY tab1.${recordTargetColumn} DESC
    `, 'allRows');

    const formatted = (record || []).map(r => ({
        name: formatNamesSimple([r[0], r[1]])[0],
        id: r[2],
        record: type,
        value: r[3],
        teamId: r[4],
        retired: r[5],
    })).sort((a, b) => b.value - a.value);

    // enriquecemos también para temporada concreta con histórico all-time
    return enrichDriversWithHistory(formatted);
}