import { countries_abreviations } from "./countries.js";
import { engine_unitValueToValue } from "./carConstants.js";
import { manageDifficultyTriggers, manageRefurbishTrigger, editFreezeMentality, fetchExistingTriggers } from "./triggerUtils.js";
import { getMetadata, queryDB } from "../dbManager.js";
import { getGlobals } from "../commandGlobals.js";
import { default_dict } from "../../frontend/config.js";
import { _standingsCache, rebuildStandingsUntil, rebuildStandingsUntilCached } from "./newsUtils.js";


/**
 * Convierte un color ARGB a hexadecimal.
 */
export function argbToHex(argb) {
  const rgb = argb & 0xFFFFFF; // Ignora el canal alfa
  return `#${rgb.toString(16).padStart(6, '0').toUpperCase()}`;
}

export function getDate() {
  const daySeason = queryDB(`
        SELECT Day, CurrentSeason
        FROM Player_State
    `, [], 'singleRow');

  return daySeason
}

/**
 * Verifica si el archivo de guardado es de un año específico.
 * @returns {Array} [ "23" o "24", TeamName, primaryColor, secondaryColor ]
 */
export function checkYearSave() {
  // Ver si existe la tabla Countries_RaceRecord
  const row = queryDB(`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' AND name='Countries_RaceRecord'
    `, [], 'singleRow');

  if (!row) {
    // No existe la tabla -> asumo que es "23"
    return ["23", null, null, null];
  }

  // Si existe, entonces busco TeamNameLocKey del TeamID=32
  const nameValue = queryDB(`
      SELECT TeamNameLocKey 
      FROM Teams 
      WHERE TeamID = 32
    `, [], 'singleValue');

  if (!nameValue) {
    // No hay valor -> devuelvo "24" sin datos
    return ["24", null, null, null];
  }

  // Extraer nombre
  const match = nameValue.match(/\[STRING_LITERAL:Value=\|(.*?)\|\]/);
  let name = null, primaryColor = null, secondaryColor = null;

  if (match) {
    name = match[1];

    // Busco los colores
    const primaryColorRow = queryDB(`
        SELECT Colour
        FROM Teams_Colours
        WHERE TeamID = 32 AND ColourID = 0
      `, [], 'singleRow');

    const secondaryColorRow = queryDB(`
        SELECT Colour
        FROM Teams_Colours
        WHERE TeamID = 32 AND ColourID = 1
      `, [], 'singleRow');

    if (primaryColorRow) {
      primaryColor = argbToHex(primaryColorRow[0]);
    }
    if (secondaryColorRow) {
      secondaryColor = argbToHex(secondaryColorRow[0]);
    }
  }

  return ["24", name, primaryColor, secondaryColor];
}

export function fetchNationality(driverID, gameYear) {
  if (gameYear === "24") {
    const countryID = queryDB(`
        SELECT CountryID 
        FROM Staff_BasicData 
        WHERE StaffID = ?
      `, [driverID], 'singleValue');
    if (!countryID) return "";

    const countryName = queryDB(`
        SELECT Name 
        FROM Countries 
        WHERE CountryID = ?
      `, [countryID], 'singleValue');
    if (!countryName) return "";


    const match = countryName.match(/(?<=\[Nationality_)[^\]]+/);
    if (match) {
      const nat = match[0];
      const natName = nat.replace(/(?<!^)([A-Z])/g, " $1");
      return countries_abreviations[natName] || "";
    }

    return "";
  } else if (gameYear === "23") {
    const nationality = queryDB(`
        SELECT Nationality 
        FROM Staff_BasicData 
        WHERE StaffID = ?
      `, [driverID], 'singleValue');
    if (!nationality) return "";

    const natName = nationality.replace(/(?<!^)([A-Z])/g, " $1");
    return countries_abreviations[natName] || "";
  }

  return "";
}

export function fetchForFutureContract(driverID) {
  const teamInfo = queryDB(`
      SELECT TeamID, PosInTeam 
      FROM Staff_Contracts 
      WHERE StaffID = ?
        AND ContractType = 3
    `, [driverID], 'singleRow');

  let futureTeamInfo = {
    teamId: -1,
    posInTeam: -1
  }

  if (teamInfo) {
    futureTeamInfo.teamId = teamInfo[0];
    futureTeamInfo.posInTeam = teamInfo[1];
  }

  return futureTeamInfo;
}

function fetchJuniorContracts(driverID) {
  const juniorContracts = queryDB(`
    SELECT TeamID, PosInTeam
    FROM Staff_Contracts
    WHERE StaffID = ?
      AND (ContractType = 0 OR ContractType = 3)
      AND TeamID BETWEEN 11 AND 31
  `, [driverID], 'allRows');
  
  let juniorFormulaInfo = {
    teamId: -1,
    posInTeam: -1
  }
  if (juniorContracts && juniorContracts.length > 0) {
    juniorFormulaInfo.teamId = juniorContracts[0][0];
    juniorFormulaInfo.posInTeam = juniorContracts[0][1];
  }

  return juniorFormulaInfo;
}

export function fetchEngines() {
  const statsIds = [6, 10, 11, 12, 14, 15];
  const enginesList = [];


  let newEngineIds = queryDB(`
      SELECT engineID FROM Custom_Engines_List`, [], 'allRows');

  newEngineIds = newEngineIds.map(row => row[0]);
  let newErsIds = newEngineIds.map(id => id + 1);
  let newGearboxesIds = newEngineIds.map(id => id + 2);

  for (let i = 0; i < newEngineIds.length; i++) {
    let resultDict = {};

    // Obtener valores de stats
    for (const stat of statsIds) {
      const statResult = queryDB(`
                SELECT partStat, unitValue 
                FROM Custom_Engines_Stats 
                WHERE designId = ? AND partStat = ?
            `, [newEngineIds[i], stat], 'singleRow');
      if (statResult) {
        resultDict[statResult[0]] = statResult[1];
      }
    }


    // Obtener valor de ERS
    const ersResult = queryDB(`
            SELECT UnitValue 
            FROM Custom_Engines_Stats 
            WHERE designId = ? AND partStat = 15
        `, [newErsIds[i]], 'singleValue');
    if (ersResult !== null) {
      resultDict[18] = ersResult;
    }

    // Obtener valor de gearbox
    const gearboxResult = queryDB(`
            SELECT UnitValue 
            FROM Custom_Engines_Stats 
            WHERE designId = ? AND partStat = 15
        `, [newGearboxesIds[i]], 'singleValue');
    if (gearboxResult !== null) {
      resultDict[19] = gearboxResult;
    }

    const engineName = queryDB(`
          SELECT name 
          FROM Custom_Engines_List
          WHERE engineID = ?
      `, [newEngineIds[i]], 'singleValue');

    // Añadir la información del motor a la lista
    enginesList.push([newEngineIds[i], resultDict, engineName]);
  }

  const engineAllocations = queryDB(`
      SELECT * FROM Custom_Engine_Allocations
    `, [], 'allRows');

  return [enginesList, engineAllocations];
}


export function fetchMentality(staffID) {
  // Obtengo todas las filas (morale es un array de arrays [[opinion],[opinion], ...])
  const morale = queryDB(`
      SELECT Opinion
      FROM Staff_Mentality_AreaOpinions
      WHERE StaffID = ?
    `, [staffID], 'allRows');

  // Obtengo un solo valor
  const globalMentality = queryDB(`
      SELECT Mentality
      FROM Staff_State
      WHERE StaffID = ?
    `, [staffID], 'singleValue');

  return [morale, globalMentality];
}

export function checkDrivesForTeam32(staffData) {
  // staffData = [ firstName, lastName, staffID, teamID, posInTeam, minContractType, retired, countContracts ]

  const contractRow = queryDB(`
      SELECT TeamID, PosInTeam
      FROM Staff_Contracts
      WHERE StaffID = ?
        AND ContractType = 0 
        AND TeamID = 32
    `, [staffData[2]], 'singleRow');

  if (contractRow) {
    return [
      staffData[0],
      staffData[1],
      staffData[2],
      32,
      contractRow[1],
      staffData[5],
      staffData[6],
      staffData[7]
    ];
  }
  return staffData;
}

export function removeNumber(str) {
  if (str && /\d$/.test(str)) {
    return str.slice(0, -1);
  }
  return str;
}

export function formatNamesAndFetchStats(nameData, type) {
  // nameData: [ FirstName, LastName, StaffID, teamId, positionInTeam, minContractType, retired, countContracts ]
  let firstName = "";
  let lastName = "";

  // Extract firstName
  if (!nameData[0].includes("STRING_LITERAL")) {
    const m = nameData[0].match(/StaffName_Forename_(?:Male|Female)_(\w+)/);
    firstName = m ? removeNumber(m[1]) : "";
  } else {
    const m = nameData[0].match(/\|([^|]+)\|/);
    firstName = m ? m[1] : "";
  }

  // Extract lastName
  if (!nameData[1].includes("STRING_LITERAL")) {
    const m = nameData[1].match(/StaffName_Surname_(\w+)/);
    lastName = m ? removeNumber(m[1]) : "";
  } else {
    const m = nameData[1].match(/\|([^|]+)\|/);
    lastName = m ? m[1] : "";
  }

  const formattedName = `${firstName} ${lastName}`;
  let teamId = nameData[3] ?? 0;
  let positionInTeam = nameData[4] ?? 0;

  // para drivers que tienen minContractType != 0 (p.ej. reservas)
  if (type === "driver" && nameData[5] !== 0) {
    teamId = 0;
    positionInTeam = 0;
  }

  let baseResult;
  if (type === "driver") {
    // [nombre, staffID, teamID, posInTeam, retired]
    baseResult = [formattedName, nameData[2], teamId, positionInTeam, nameData[6]];
  } else {
    // staff normal
    baseResult = [formattedName, nameData[2], teamId, positionInTeam];
  }

  // Buscamos stats
  if (type === "driver") {
    const statsRows = queryDB(`
        SELECT Val
        FROM Staff_PerformanceStats
        WHERE StaffID = ?
          AND StatID BETWEEN 2 AND 10
      `, [nameData[2]], 'allRows');

    let stats = statsRows;
    if (!stats || !stats.length) {
      // si no hay stats, por defecto 50
      stats = Array(9).fill([50]);
    }

    const extraRow = queryDB(`
        SELECT Improvability, Aggression
        FROM Staff_DriverData
        WHERE StaffID = ?
      `, [nameData[2]], 'singleRow');

    // Concatenamos: baseResult + stats + extraRow
    // stats es array de arrays: [[val],[val],...]
    // mapeamos para quedarnos con stats[i][0]
    return baseResult.concat(
      stats.map(s => s[0]),
      extraRow ?? []
    );
  }

  // staff normal
  let statIDs = [];
  if (type === "staff1") {
    statIDs = [0, 1, 14, 15, 16, 17];
  } else if (type === "staff2") {
    statIDs = [13, 25, 43];
  } else if (type === "staff3") {
    statIDs = [19, 20, 26, 27, 28, 29, 30, 31];
  } else if (type === "staff4") {
    statIDs = [11, 22, 23, 24];
  }

  if (statIDs.length) {
    const statsRows = queryDB(`
        SELECT Val
        FROM Staff_PerformanceStats
        WHERE StaffID = ?
          AND StatID IN (${statIDs.join(",")})
      `, [nameData[2]], 'allRows');

    return baseResult.concat(statsRows.map(s => s[0]));
  }

  // Si no entra en esos casos, simplemente devolvemos baseResult
  return baseResult;
}

export function fetchDriverRetirement(driverID) {
  const playerRow = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, [], 'singleRow');

  let day = 0, currentSeason = 0;
  if (playerRow) {
    [day, currentSeason] = playerRow;
  } else {
    console.warn("No se encontraron datos en Player_State.");
  }

  const retirementAge = queryDB(`
      SELECT RetirementAge
      FROM Staff_GameData
      WHERE StaffID = ?
    `, [driverID], 'singleValue');

  const dob = queryDB(`
      SELECT DOB
      FROM Staff_BasicData
      WHERE StaffID = ?
    `, [driverID], 'singleValue');

  const age = (dob != null) ? Math.floor((day - dob) / 365.25) : 0;
  return [retirementAge, age];
}

export function fetchDriverCode(driverID) {
  let code = queryDB(`
      SELECT DriverCode
      FROM Staff_DriverData
      WHERE StaffID = ?
    `, [driverID], 'singleValue');

  if (!code) return "";

  if (!code.includes("STRING_LITERAL")) {
    const m = code.match(/\[DriverCode_(...)\]/);
    code = m ? m[1] : "";
  } else {
    const m = code.match(/\[STRING_LITERAL:Value=\|(...)\|\]/);
    code = m ? m[1] : "";
  }

  return code.toUpperCase();
}

export function fetchYear() {
  const row = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, [], 'singleRow');

  if (!row) {
    console.warn("No data found in Player_State.");
    return 0;
  }
  // Devolvemos CurrentSeason (row[1])
  return row[1];
}

export function fetchDriverNumberDetails(driverID) {
  let currentNumber = queryDB(`
      SELECT Number
      FROM Staff_DriverNumbers
      WHERE CurrentHolder = ?
    `, [driverID], 'singleValue');

  if (currentNumber == null) {
    // Si no tiene número, ver si hay libres
    const available = queryDB(`
        SELECT Number
        FROM Staff_DriverNumbers
        WHERE CurrentHolder IS NULL
      `, [], 'allRows');

    if (!available.length) {
      currentNumber = 0;
    } else {
      // Elige uno aleatorio
      const randomIdx = Math.floor(Math.random() * available.length);
      currentNumber = available[randomIdx][0];
    }
  }

  // Quiere usar número de campeón?
  const wantsChampion = queryDB(`
      SELECT WantsChampionDriverNumber
      FROM Staff_DriverData
      WHERE StaffID = ?
    `, [driverID], 'singleValue');

  return [currentNumber, wantsChampion];
}

export function fetchRaceFormula(driverID) {
  const category = queryDB(`
      SELECT MAX(
        CASE 
          WHEN (TeamID <= 10 OR TeamID = 32) THEN 1
          WHEN TeamID BETWEEN 11 AND 21 THEN 2
          WHEN TeamID BETWEEN 22 AND 31 THEN 3
          ELSE 4
        END
      ) AS Cat
      FROM Staff_Contracts
      WHERE ContractType = 0 AND StaffID = ?
    `, [driverID], 'singleValue');

  // Por defecto 4 si no existe
  return category ?? 4;
}

export function fetchMarketability(driverID) {
  return queryDB(`
      SELECT Marketability
      FROM Staff_DriverData
      WHERE StaffID = ?
    `, [driverID], 'singleValue');
}

export function fetchSuperlicense(driverID) {
  return queryDB(`
      SELECT HasSuperLicense
      FROM Staff_DriverData
      WHERE StaffID = ?
    `, [driverID], 'singleValue');
}

export function fetchDrivers(gameYear) {
  const rows = queryDB(`
      SELECT DISTINCT 
        bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, con.PosInTeam, 
        MIN(con.ContractType) AS MinContractType, gam.Retired, COUNT(*)
      FROM Staff_BasicData bas
      JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID
      LEFT JOIN Staff_Contracts con ON dri.StaffID = con.StaffID
      LEFT JOIN Staff_GameData gam ON dri.StaffID = gam.StaffID
      GROUP BY gam.StaffID
      ORDER BY con.TeamID;
    `, [], 'allRows');

  const formattedData = [];

  for (let driver of rows) {
    // Si driver[7] > 1 => hay más de un contrato
    if (driver[7] > 1) {
      driver = checkDrivesForTeam32(driver);
    }

    const driverID = driver[2];

    // Ignoramos placeholders
    if (driver[0] === "Placeholder") {
      continue;
    }

    // Format + stats
    const result = formatNamesAndFetchStats(driver, "driver");

    // Extra info
    const [retirementAge, age] = fetchDriverRetirement(driverID);
    let raceFormula = fetchRaceFormula(driverID) || 4;
    const [driverNumber, wants1] = fetchDriverNumberDetails(driverID);
    const superlicense = fetchSuperlicense(driverID);
    const futureTeam = fetchForFutureContract(driverID);
    const juniorContracts = fetchJuniorContracts(driverID);
    const driverCode = fetchDriverCode(driverID);
    const nationality = fetchNationality(driverID, gameYear);

    // result es array, lo convertimos a objeto para mayor claridad
    const data = { ...result };
    data.driver_number = driverNumber;
    data.wants1 = wants1;
    data.retirement_age = retirementAge;
    data.age = age;
    data.superlicense = superlicense;
    data.race_formula = raceFormula;
    data.team_future = futureTeam;
    data.team_junior = juniorContracts;
    data.driver_code = driverCode;
    data.nationality = nationality;

    // Datos específicos para 2024
    if (gameYear === "24") {
      const [morale, gMentality] = fetchMentality(driverID);
      data.global_mentality = gMentality ?? null;

      // morale es array de arrays. Ejemplo: [ [op1], [op2], [op3] ]
      if (morale.length >= 3) {
        data.mentality0 = morale[0][0];
        data.mentality1 = morale[1][0];
        data.mentality2 = morale[2][0];
      }

      const market = fetchMarketability(driverID);
      data.marketability = market ?? 0;
    }

    formattedData.push(data);
  }

  return formattedData;
}

export function fetchStaff(gameYear) {
  const rows = queryDB(`
      SELECT DISTINCT
        bas.FirstName, 
        bas.LastName, 
        bas.StaffID, 
        con.TeamID, 
        gam.StaffType
      FROM Staff_GameData gam
      JOIN Staff_BasicData bas ON gam.StaffID = bas.StaffID
      LEFT JOIN Staff_Contracts con 
        ON bas.StaffID = con.StaffID 
        AND (con.ContractType = 0 OR con.ContractType IS NULL)
      WHERE gam.StaffType != 0
      ORDER BY 
        CASE WHEN con.TeamID IS NULL THEN 1 ELSE 0 END,
        con.TeamID
    `, [], 'allRows');

  if (!rows.length) {
    console.warn("No staff data found.");
    return [];
  }

  const formattedData = [];

  for (let staff of rows) {
    // staff = [ FirstName, LastName, StaffID, TeamID, StaffType ]
    if (staff[0] === "Placeholder") {
      continue;
    }

    const staffID = staff[2];
    const staffType = `staff${staff[4]}`;
    const result = formatNamesAndFetchStats(staff, staffType);

    const [retirementAge, age] = fetchDriverRetirement(staffID);
    let raceFormula = fetchRaceFormula(staffID) || 4;
    const futureTeam = fetchForFutureContract(staffID);
    const nationality = fetchNationality(staffID, gameYear);

    const data = { ...result };
    data.retirement_age = retirementAge;
    data.age = age;
    data.race_formula = raceFormula;
    data.team_future = futureTeam;
    data.nationality = nationality;

    if (gameYear === "24") {
      const [morale, gMentality] = fetchMentality(staffID);
      data.global_mentality = gMentality ?? -1;

      if (morale.length >= 3) {
        data.mentality0 = morale[0][0] ?? -1;
        data.mentality1 = morale[1][0] ?? -1;
        data.mentality2 = morale[2][0] ?? -1;
      } else {
        data.mentality0 = -1;
        data.mentality1 = -1;
        data.mentality2 = -1;
      }
    }

    formattedData.push(data);
  }

  return formattedData;
}

export function fetchDriversPerYear(year) {
  // Construimos la consulta SQL
  const sql = `
      SELECT 
        bas.FirstName, 
        bas.LastName, 
        res.DriverID, 
        res.TeamID
      FROM Staff_BasicData bas
      JOIN Races_Results res 
        ON bas.StaffID = res.DriverID
      WHERE Season = ?
      GROUP BY 
        bas.FirstName, 
        bas.LastName, 
        bas.StaffID, 
        res.TeamID
      ORDER BY res.TeamID
    `;

  // Obtenemos todas las filas (array de objetos o tuplas)
  const drivers = queryDB(sql, [year], 'allRows') || [];

  // Formateamos cada fila como quieras (equivalente a "format_names_simple")
  const formattedTuples = drivers.map(row => formatNamesSimple(row));

  return formattedTuples;
}

export function formatNamesSimple(name) {
  let nombre = "";
  let apellido = "";

  // Si no contiene "STRING_LITERAL", buscamos "StaffName_Forename_(Male|Female)_(...)".
  if (!name[0].includes("STRING_LITERAL")) {
    const nombrePattern = /StaffName_Forename_(Male|Female)_(\w+)/;
    const match = name[0].match(nombrePattern);
    if (match) {
      // Asumiendo que tienes un método removeNumber similar al de Python
      nombre = removeNumber(match[2]);
    } else {
      nombre = "";
    }
  } else {
    // De lo contrario, buscamos la parte entre "| ... |"
    const pattern = /\|([^|]+)\|/;
    const match = name[0].match(pattern);
    if (match) {
      nombre = match[1];
    } else {
      nombre = "";
    }
  }

  // Repetimos la lógica para el apellido
  if (!name[1].includes("STRING_LITERAL")) {
    const apellidoPattern = /StaffName_Surname_(\w+)/;
    const match = name[1].match(apellidoPattern);
    if (match) {
      apellido = removeNumber(match[1]);
    } else {
      apellido = "";
    }
  } else {
    const pattern = /\|([^|]+)\|/;
    const match = name[1].match(pattern);
    if (match) {
      apellido = match[1];
    } else {
      apellido = "";
    }
  }

  // Construimos el nombre completo
  const nameFormatted = `${nombre} ${apellido}`.trim();

  // El TeamID (índice 3 en el array). Si es nulo/indefinido, lo ponemos a 0
  const teamId = name[3] != null ? name[3] : 0;

  // Devolvemos la misma estructura que en Python: (Nombre Formateado, DriverID, TeamID)
  return [nameFormatted, name[2], teamId];
}

function getSeasonRaceIds(season) {
  return (queryDB(`
    SELECT RaceID
    FROM Races
    WHERE SeasonID = ?
    ORDER BY RaceID ASC
  `, [season], 'allRows') || []).map(r => Number(r[0]));
}

export function buildPerRaceTeamRankContext(seasonResults, raceIds, season) {
  const cacheKey = `teamRanks:${season}:prev=false:pts=false`;
  const cached = _standingsCache.get(cacheKey);
  if (cached) return cached;

  const perRaceTeamPoints = new Map();

  for (const dr of (seasonResults || [])) {
    const races = dr.races || [];
    for (const r of races) {
      const raceId = Number(r.raceId);
      const teamId = Number(r.teamId);
      const pts = Math.max(0, Number(r.points) || 0);
      const spts = (r.sprintPoints != null && Number(r.sprintPoints) !== -1) ? Number(r.sprintPoints) : 0;
      const total = pts + spts;

      if (!perRaceTeamPoints.has(raceId)) perRaceTeamPoints.set(raceId, new Map());
      const m = perRaceTeamPoints.get(raceId);
      m.set(teamId, (m.get(teamId) || 0) + total);
    }
  }

  const perRaceRank = new Map();
  const cumPoints = new Map();

  const orderedRaceIds = [...(raceIds || [])].map(Number).sort((a, b) => a - b);

  for (const rid of orderedRaceIds) {
    const standingsArr = [...cumPoints.entries()]
      .map(([teamId, points]) => ({ teamId: Number(teamId), points: Number(points) }))
      .sort((a, b) => b.points - a.points);

    const rankMap = new Map();
    standingsArr.forEach((t, idx) => rankMap.set(t.teamId, idx + 1));
    perRaceRank.set(rid, rankMap);

    const thisRacePts = perRaceTeamPoints.get(rid);
    if (thisRacePts) {
      for (const [teamId, pts] of thisRacePts.entries()) {
        cumPoints.set(teamId, (cumPoints.get(teamId) || 0) + pts);
      }
    }
  }

  _standingsCache.set(cacheKey, perRaceRank);
  return perRaceRank;
}

export function buildPerRaceTeamRankContext_OLD(seasonResults, raceIds, season) {
  // raceId -> Map(teamId -> rank 1..10)
  const perRace = new Map();

  for (const raceId of raceIds) {
    // reconstruye standings "hasta" esa carrera
    const { teamStandings } = rebuildStandingsUntilCached(
      season,
      seasonResults,
      raceId,
      false,
      false
    );

    const rankMap = new Map();
    teamStandings.forEach((t, idx) => rankMap.set(Number(t.teamId), idx + 1));
    perRace.set(Number(raceId), rankMap);
  }

  return perRace;
}

function applyDoDFlagsToSeasonResults(seasonResults, dodMap) {
  for (const dr of seasonResults) {
    const driverId =
      Number(dr.driverID?.[0] ?? dr.DriverID?.[0] ?? dr.driverId ?? dr.id ?? -1);
    for (const r of (dr.races || [])) {
      const rid = Number(r.raceId ?? r.RaceID ?? r.id);
      r.driverOfTheDay = dodMap.get(rid) === driverId;
    }
  }
  return seasonResults;
}

export function getDotDWinnersMap(season) {
  const rows = queryDB(`
    SELECT RaceID, DriverID
    FROM Custom_DriverOfTheDay_Ranking
    WHERE Season = ? AND Rank = 1
  `, [season], 'allRows') || [];

  const m = new Map();
  for (const [raceId, driverId] of rows) {
    m.set(Number(raceId), Number(driverId));
  }
  return m;
}

function computeSeasonDriverOfTheDay(seasonResults, season) {
  ensureCustomDoDRankingTable();

  // A) contexto por carrera
  const raceIds = getSeasonRaceIds(season).map(Number);
  const perRaceTeamRank = buildPerRaceTeamRankContext(seasonResults, raceIds, season);

  // B) ganadores ya cacheados (Rank=1)
  const winnersMap = getDotDWinnersMap(season); // Map<raceId, driverId>

  // C) carreras faltantes
  const missing = raceIds.filter(rid => !winnersMap.has(rid));
  if (missing.length > 0) {
    // Trae solo lo necesario
    const rows = queryDB(`
      SELECT RaceID, DriverID, TeamID, StartingPos, FinishingPos, DNF, Time, Laps
      FROM Races_Results
      WHERE Season = ${season}
        AND RaceID IN (${missing.join(',')})
    `, [], 'allRows') || [];

    // Agrupar por carrera en el formato que ya usas
    const byRace = new Map();
    for (const [raceId, driverId, teamId, startPos, finishPos, dnf, time, laps] of rows) {
      const r = Number(raceId);
      if (!byRace.has(r)) byRace.set(r, []);
      byRace.get(r).push([
        null, null, Number(driverId), Number(teamId),
        Number(finishPos), Number(startPos),
        null, Number(dnf), null, null,
        Number(time), Number(laps)
      ]);
    }

    // Calcular leaderboard y guardar top-3
    for (const raceId of missing) {
      const raceRows = (byRace.get(raceId) || []).sort((a, b) => Number(a[4]) - Number(b[4]));
      const ctx = { teamRankByTeamId: perRaceTeamRank.get(raceId) || new Map() };

      const leaderboard = computeDriverOfTheDayLeaderboardFromRows(raceRows, raceId, ctx);
      if (leaderboard?.length) {
        upsertDoDRanking(season, raceId, leaderboard, /*topN*/ 3);
        winnersMap.set(raceId, Number(leaderboard[0].driverId));
      }
    }
  }

  // D) aplicar flags como ya hacías
  const dodMap = winnersMap; // Map<raceId, driverId>
  const enriched = applyDoDFlagsToSeasonResults(seasonResults, dodMap);
  enriched._driverOfTheDayMap = dodMap;
  return enriched;
}

export function fetchSeasonResults(
  yearSelected,
  isCurrentYear = true,
  fetchDriverOfTheDay = false,
  formula = 1
) {
  const drivers = queryDB(`
        SELECT DriverID
        FROM Races_DriverStandings
        WHERE RaceFormula = ?
          AND SeasonID = ?
      `, [formula, yearSelected], 'allRows') || [];

  const seasonResults = [];
  for (const row of drivers) {
    const driverID = row[0];
    const driverRes = fetchOneDriverSeasonResults([driverID], [yearSelected], isCurrentYear, formula);
    if (driverRes) seasonResults.push(driverRes);
  }

  if (!fetchDriverOfTheDay || Number(formula) !== 1) {
    return seasonResults;
  }

  const resultsWithDoD = computeSeasonDriverOfTheDay(seasonResults, yearSelected);


  return resultsWithDoD;
}

export function fetchQualiResults(yearSelected) {
  const drivers = queryDB(`
      SELECT DriverID
      FROM Races_DriverStandings
      WHERE RaceFormula = 1
        AND SeasonID = ?
    `, [yearSelected], 'allRows') || [];

  const seasonResults = [];
  drivers.forEach((row) => {
    const driverID = row[0];
    const driverRes = fetchOneDriverQualiResults([driverID], [yearSelected]);
    if (driverRes) {
      seasonResults.push(driverRes);
    }
  });
  return seasonResults;
}

export function fetchTeamsStandings(year, formula = 1) {
  return queryDB(`
        SELECT TeamID, Position
        FROM Races_TeamStandings
        WHERE SeasonID = ?
          AND RaceFormula = ?
        ORDER BY Position
      `, [year, formula], 'allRows') || [];
}

export function fetchPointsRegulations() {
  const pointScheme = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 7`, [], 'singleValue');
  const twoBiggestPoints = queryDB(`SELECT Points FROM Regulations_NonTechnical_PointSchemes WHERE (PointScheme = ?) AND (RacePos = 1 OR RacePos = 2); `, [pointScheme], 'allRows');
  const isLastraceDouble = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 8`, [], 'singleValue');
  const fastestLapBonusPoint = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 9`, [], 'singleValue');
  const poleBonusPoint = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 10`, [], 'singleValue');
  const positionAndPointsRows = queryDB(`SELECT RacePos, Points FROM Regulations_NonTechnical_PointSchemes WHERE PointScheme = ?`, [pointScheme], 'allRows');
  const res = {
    pointScheme: pointScheme,
    twoBiggestPoints: twoBiggestPoints,
    isLastraceDouble: isLastraceDouble,
    fastestLapBonusPoint: fastestLapBonusPoint,
    poleBonusPoint: poleBonusPoint,
    positionAndPoints: positionAndPointsRows
  }

  return res;
}

export function fetchOneTeamSeasonResults(team, year) {
  const teamID = team;
  const season = year;
  const drivers = queryDB(` SELECT DISTINCT DriverID
       FROM Races_Results
       WHERE Season = ?
       AND TeamID = ? `,
    [season, teamID], 'allRows') || [];

  const results = [];
  for (let driver of drivers) {
    const driverID = driver[0];
    const driverResults = fetchOneDriverSeasonResults(driverID, season);
    if (driverResults) {
      results.push(driverResults);
    }
  }

  return results;
}

export function fetchOneDriverSeasonResults(driver, year, isCurrentYear = true, formula = 1) {
  const driverID = Array.isArray(driver) ? driver[0] : driver; //if its not an array, take it as is, if it is, take first element
  const season = Array.isArray(year) ? year[0] : year;

  if (Number(formula) === 1) {
    const results = queryDB(`
          SELECT DriverID, TeamID, FinishingPos, Points
          FROM Races_Results
          WHERE Season = ?
            AND DriverID = ?
        `, [season, driverID], 'allRows') || [];

    if (results.length > 0) {
      const sprintResults = queryDB(`
            SELECT RaceID, FinishingPos, ChampionshipPoints
            FROM Races_SprintResults
            WHERE SeasonID = ?
              AND DriverID = ?
              AND RaceFormula = ?
          `, [season, driverID, formula], 'allRows') || [];

      const teamID = results[0][1];

      const driverNameRow = queryDB(`
            SELECT FirstName, LastName
            FROM Staff_BasicData
            WHERE StaffID = ?
          `, [driverID], 'singleRow');

      return formatSeasonResults(
        results,
        driverNameRow,
        teamID,
        driver,
        year,
        sprintResults,
        isCurrentYear,
        formula
      );
    }

    return null;
  }
  else if (Number(formula) > 1) {

    const results = queryDB(`
      SELECT RaceID, TeamID, FinishingPos, ChampionshipPoints, 0, FastestLap
      FROM Races_FeatureRaceResults
      WHERE SeasonID = ?
        AND DriverID = ?
        AND RaceFormula = ?
      ORDER BY RaceID
    `, [season, driverID, formula], 'allRows') || [];

    if (results.length > 0) {
      const sprintResults = queryDB(`
        SELECT RaceID, FinishingPos, ChampionshipPoints
        FROM Races_SprintResults
        WHERE SeasonID = ?
          AND DriverID = ?
          AND RaceFormula = ?
      `, [season, driverID, formula], 'allRows') || [];

      const teamID = results[0][1];

      const driverNameRow = queryDB(`
        SELECT FirstName, LastName
        FROM Staff_BasicData
        WHERE StaffID = ?
      `, [driverID], 'singleRow');

      return formatSeasonResults(
        results,
        driverNameRow,
        teamID,
        driver,
        year,
        sprintResults,
        isCurrentYear,
        formula
      );
    }

    return null;
  }

  
}


export function computeDriverOfTheDayFromRows(rows, raceId, opts = {}) {
  // const lb = computeDriverOfTheDayLeaderboardFromRows(rows, raceId, opts); //debug
  // console.table(lb.slice(0, 10));
  // return lb[0]?.driverId || null;
  const dodId = computeDriverOfTheDayFromRows_fast(rows, raceId, opts);
  return dodId;
}

export function computeDriverOfTheDayFromRows_fast(rows, raceId, opts = {}) {
  if (!rows || !rows.length) return null;

  // --- constantes internas (sin pasar por opts si quieres fijarlas) ---
  const TEAM_WEIGHT = 0.4;
  const TEAM_BONUS_CAP = 4;
  const RANDOM_INTENSITY = 0.8; // ±0.4
  const dominancePerGap = 1;   // +1 punto por bloque de gap
  const dominanceBlock = 4;   // cada 4s → 1 punto
  const dominanceMax = 10;

  // ranking de equipo
  const teamRankByTeamId = (opts.teamRankByTeamId instanceof Map) ? opts.teamRankByTeamId : new Map();

  // bonus por dominancia del ganador (P1 vs P2 en misma vuelta)
  let p1GapBonus = 0;
  const p1 = rows.find(r => Number(r[4]) === 1 && Number(r[7]) === 0);
  const p2 = rows.find(r => Number(r[4]) === 2 && Number(r[7]) === 0);
  if (p1 && p2) {
    const p1Time = Number(p1[10]), p2Time = Number(p2[10]);
    const p1Laps = Number(p1[11]), p2Laps = Number(p2[11]);
    if (Number.isFinite(p1Time) && Number.isFinite(p2Time) && p1Laps === p2Laps) {
      const gapBehind = p2Time - p1Time;
      if (gapBehind > 0) {
        const blocks = Math.floor(gapBehind / dominanceBlock);
        p1GapBonus = Math.min(blocks * dominancePerGap, dominanceMax);
      }
    }
  }

  // posScore fijo
  const posScore = (finishingPos) => {
    if (finishingPos === 1) return 4;
    if (finishingPos === 2) return 2;
    if (finishingPos === 3) return 1;
    if (finishingPos > 13) return -10;
    if (finishingPos > 10) return -7;
    if (finishingPos > 8) return -2;
    return 0;
  };

  // grid válido para expectedPos por equipo
  const validRows = rows.filter(r => Number(r[7]) !== 1 && Number(r[5]) > 0 && Number(r[4]) > 0 && Number(r[4]) !== 99);
  const gridSize = validRows.length;
  const gridFactor = gridSize > 0 ? (gridSize / 20) : 1;

  const teamBonus = (teamRank, finishingPos) => {
    if (!Number.isFinite(teamRank) || !Number.isFinite(finishingPos)) return 0;
    const expectedPos = (2 * teamRank - 0.5) * gridFactor; // 2 coches por equipo
    const delta = expectedPos - finishingPos; // + si rinde mejor que lo esperado
    let bonus = delta * TEAM_WEIGHT;
    if (bonus > TEAM_BONUS_CAP) bonus = TEAM_BONUS_CAP;
    if (bonus < -TEAM_BONUS_CAP) bonus = -TEAM_BONUS_CAP;
    return bonus;
  };

  // ganador en una sola pasada (sin arrays ni sort)
  let bestId = null, bestScore = -Infinity, bestFinishPos = 99;

  for (const row of rows) {
    const driverId = Number(row[2]);
    const teamId = Number(row[3]);
    const finishingPos = Number(row[4]);
    const startingPos = Number(row[5]);
    const dnf = Number(row[7]) === 1;

    if (dnf || startingPos <= 0 || finishingPos <= 0 || finishingPos === 99) continue;

    const gain = startingPos - finishingPos;
    const ps = posScore(finishingPos);
    const tr = Number(teamRankByTeamId.get(teamId));
    const tb = Number.isFinite(tr) ? teamBonus(tr, finishingPos) : 0;
    const dominanceBonus = (finishingPos === 1) ? p1GapBonus : 0;

    const rand = seededRandom(Number(raceId));
    const randomOffset = (rand() - 0.5) * RANDOM_INTENSITY;

    const score = gain + ps + tb + dominanceBonus + randomOffset;

    // desempate por mejor posición final
    if (
      score > bestScore ||
      (score === bestScore && finishingPos < bestFinishPos)
    ) {
      bestScore = score;
      bestFinishPos = finishingPos;
      bestId = driverId;
    }
  }

  return bestId;
}

export function computeDriverOfTheDayLeaderboardFromRows(rows, raceId, opts = {}) {
  if (!rows || !rows.length) return [];

  raceId = Number(raceId);

  const teamRankByTeamId = (opts.teamRankByTeamId instanceof Map) ? opts.teamRankByTeamId : new Map();
  const TEAM_WEIGHT = 0.4;
  const TEAM_BONUS_CAP = 4;

  const dominancePerGap = 1;
  const dominanceMax = 10;

  let p1GapBonus = 0;
  const p1 = rows.find(r => Number(r[4]) === 1 && Number(r[7]) === 0);
  const p2 = rows.find(r => Number(r[4]) === 2 && Number(r[7]) === 0);
  if (p1 && p2) {
    const p1Time = Number(p1[10]), p2Time = Number(p2[10]);
    const p1Laps = Number(p1[11]), p2Laps = Number(p2[11]);
    if (Number.isFinite(p1Time) && Number.isFinite(p2Time) && p1Laps === p2Laps) {
      const gapBehind = p2Time - p1Time; // s
      if (gapBehind > 0) {
        const blocks = Math.floor(gapBehind / 4);
        p1GapBonus = Math.min(blocks * dominancePerGap, dominanceMax);
      }
    }
  }

  const posScore = (finishingPos) => {
    if (finishingPos === 1) return 4;
    if (finishingPos === 2) return 2;
    if (finishingPos === 3) return 1;
    if (finishingPos > 13) return -10;
    if (finishingPos > 10) return -7;
    if (finishingPos > 8) return -2;
    return 0;
  };

  const validRows = rows.filter(r => Number(r[7]) !== 1 && Number(r[5]) > 0 && Number(r[4]) > 0 && Number(r[4]) !== 99);
  const gridSize = validRows.length;

  const teamBonus = (teamRank, finishingPos) => {
    if (!Number.isFinite(teamRank) || !Number.isFinite(finishingPos)) return 0;
    const factor = gridSize > 0 ? (gridSize / 20) : 1;
    const expectedPos = (2 * teamRank - 0.5) * factor;
    const delta = expectedPos - finishingPos;
    let bonus = delta * TEAM_WEIGHT;
    if (TEAM_BONUS_CAP > 0) {
      if (bonus > TEAM_BONUS_CAP) bonus = TEAM_BONUS_CAP;
      if (bonus < -TEAM_BONUS_CAP) bonus = -TEAM_BONUS_CAP;
    }
    return bonus;
  };

  const rand = seededRandom(raceId);
  const RANDOM_INTENSITY = 0.8;

  const rowsScored = [];
  for (const row of rows) {
    const driverId = Number(row[2]);
    const teamId = Number(row[3]);
    const finishingPos = Number(row[4]);
    const startingPos = Number(row[5]);
    const dnf = Number(row[7]) === 1;

    if (dnf || startingPos <= 0 || finishingPos <= 0 || finishingPos === 99) continue;

    const gain = startingPos - finishingPos;
    const ps = posScore(finishingPos);
    const tr = Number(teamRankByTeamId.get(teamId));
    const tb = Number.isFinite(tr) ? teamBonus(tr, finishingPos) : 0;

    const dominanceBonus = (finishingPos === 1) ? p1GapBonus : 0;
    const poleBonus = (startingPos === 1) ? 1.0 : 0.0;

    const randomOffset = (rand() - 0.5) * RANDOM_INTENSITY;
    const scoreRaw = gain + ps + tb + dominanceBonus + randomOffset + poleBonus;

    const name = getNameByIdAndFormat(driverId);
    rowsScored.push({
      driverId,
      name: name[0],
      scoreRaw,             // <-- guardamos el bruto para depurar
      finishPos: finishingPos,
      startPos: startingPos,
      teamId,
      components: { gain, posScore: ps, teamBonus: tb, dominanceBonus, poleBonus, randomOffset }
    });
  }

  // Softmax -> porcentajes que suman 100
  const shares = softmaxToPercent(rowsScored.map(r => r.scoreRaw), /*temperature*/ 1.0);
  for (let i = 0; i < rowsScored.length; i++) {
    rowsScored[i].share = Math.round(shares[i] * 10) / 10; // p.ej., 1 decimal
  }

  // Orden: mayor share (equivale a mayor scoreRaw)
  rowsScored.sort((a, b) =>
    (b.share - a.share) || (a.finishPos - b.finishPos)
  );

  return rowsScored;
}

function softmaxToPercent(values, temperature = 1.0) {
  // estabilidad numérica
  const maxV = Math.max(...values);
  const exps = values.map(v => Math.exp((v - maxV) / temperature));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => (x / sum) * 100);
}

export function upsertDoDRanking(season, raceId, leaderboard, topN = 3) {
  const top = leaderboard.slice(0, topN);
  for (let i = 0; i < top.length; i++) {
    const { driverId, share, name, teamId } = top[i]; // usamos share (%)
    const rank = i + 1;
    queryDB(`
      INSERT INTO Custom_DriverOfTheDay_Ranking (Season, RaceID, Rank, DriverID, Name, TeamID, Score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(Season, RaceID, Rank) DO UPDATE
      SET DriverID = excluded.DriverID, Score = excluded.Score
    `, [season, raceId, rank, driverId, name, teamId, Number(share)], 'run');
  }
}

export function getDoDTopNForRace(season, raceId, topN = 3) {
  const rows = queryDB(`
    SELECT DriverID, Rank, Name, Score, TeamID
    FROM Custom_DriverOfTheDay_Ranking
    WHERE Season = ? AND RaceID = ?
    ORDER BY Rank ASC
    LIMIT ?
  `, [season, raceId, topN], 'allRows') || [];

  return rows.map(([driverId, rank, name, share, teamId]) => ({
    driverId: Number(driverId),
    rank: Number(rank),
    name,
    share: Number(share),
    teamId: Number(teamId)
  }));
}

export function ensureCustomDoDRankingTable() {
  queryDB(`
    CREATE TABLE IF NOT EXISTS Custom_DriverOfTheDay_Ranking (
      Season    INTEGER NOT NULL,
      RaceID    INTEGER NOT NULL,
      Rank      INTEGER NOT NULL,   -- 1,2,3...
      DriverID  INTEGER NOT NULL,
      Name      TEXT    NOT NULL,
      Score     REAL    NOT NULL,
      TeamID    INTEGER NOT NULL,
      PRIMARY KEY (Season, RaceID, Rank)
    )
  `, [], 'run');

}

function seededRandom(seed) {
  // xmur3 + mulberry32 style
  let t = (seed + 0x6D2B79F5) | 0;
  return function () {
    t ^= t << 13; t ^= t >>> 17; t ^= t << 5;
    return ((t < 0 ? ~t + 1 : t) % 4294967296) / 4294967296;
  };
}

function getNameByIdAndFormat(driverID) {
  const driverNameRow = queryDB(`
      SELECT FirstName, LastName, StaffID
      FROM Staff_BasicData
      WHERE StaffID = ?
    `, [driverID], 'singleRow');

  const name = formatNamesSimple(driverNameRow);
  return name;
}


export function fetchOneDriverQualiResults(driver, year) {
  const driverID = Array.isArray(driver) ? driver[0] : driver;
  const season = Array.isArray(year) ? year[0] : year;

  const results = queryDB(`
      SELECT DriverID, TeamID, StartingPos, Points
      FROM Races_Results
      WHERE Season = ?
        AND DriverID = ?
    `, [season, driverID], 'allRows') || [];


  if (results.length > 0) {
    const teamID = results[0][1];

    const driverNameRow = queryDB(`
        SELECT FirstName, LastName
        FROM Staff_BasicData
        WHERE StaffID = ?
      `, [driverID], 'singleRow');

    return formatSeasonResults(
      results,
      driverNameRow,
      teamID,
      driver,
      year,
      [],
      true
    );
  }

  return null;
}


export function fetchEventsDoneFrom(year) {
  const daySeasonRow = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, [], 'singleRow');

  if (!daySeasonRow) {
    return [];
  }
  const [currentDay, currentSeason] = daySeasonRow;

  const seasonIdsRows = queryDB(`
      SELECT RaceID
      FROM Races
      WHERE SeasonID = ?
        AND Day < ?
    `, [year, currentDay], 'allRows') || [];


  const eventsIds = seasonIdsRows.map(row => row[0]);

  return eventsIds;
}

export function fetchEventsDoneBefore(year, day) {
  const daySeasonRow = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, [], 'singleRow');

  if (!daySeasonRow) {
    return [];
  }

  const seasonIdsRows = queryDB(`
      SELECT RaceID
      FROM Races
      WHERE SeasonID = ?
        AND Day < ?
    `, [year, day], 'allRows') || [];


  const eventsIds = seasonIdsRows.map(row => row[0]);

  return eventsIds;
}

export function fetchEventsFrom(year, formula = 1) {
  const seasonEventsRows = queryDB(`
      SELECT r.RaceID, r.TrackID, r.WeekendType, t.isF2Race, t.IsF3Race
      FROM Races r
      LEFT JOIN Races_Tracks t ON r.TrackID = t.TrackID
      WHERE r.SeasonID = ?
      ORDER BY r.RaceID
    `, [year], 'allRows') || [];

  if (Number(formula) === 2) {
    return seasonEventsRows.filter(row => Number(row[3]) === 1);
  }
  if (Number(formula) === 3) {
    return seasonEventsRows.filter(row => Number(row[4]) === 1);
  }
  return seasonEventsRows;
}



function formatDriverName(driverName) {
  let nombre = "", apellido = "";
  const firstName = driverName ? driverName[0] : "";
  const lastName = driverName ? driverName[1] : "";
  if (!firstName.includes("STRING_LITERAL")) {
    const m = firstName.match(/StaffName_Forename_(Male|Female)_(\w+)/);
    nombre = m ? removeNumber(m[2]) : "";
  } else {
    const m = firstName.match(/\|([^|]+)\|/);
    nombre = m ? m[1] : "";
  }
  if (!lastName.includes("STRING_LITERAL")) {
    const m = lastName.match(/StaffName_Surname_(\w+)/);
    apellido = m ? removeNumber(m[1]) : "";
  } else {
    const m = lastName.match(/\|([^|]+)\|/);
    apellido = m ? m[1] : "";
  }
  return `${nombre} ${apellido}`.trim();
}

function formatSeasonResultsF2F3(
  results,
  driverName,
  teamID,
  driver,
  year,
  sprints,
  formula
) {
  const driverID = Array.isArray(driver) ? driver[0] : driver;
  const season = Array.isArray(year) ? year[0] : year;
  const nameFormatted = formatDriverName(driverName);

  const raceObjects = [];
  const byRace = new Map();

  results.forEach((row) => {
    const raceID = row[0];
    const teamId = row[1] ?? teamID;
    const finishingPos = row[2];
    const points = row[3];
    const dnf = Number(row[4]) === 1;

    const base = {
      raceId: raceID,
      finishingPos: finishingPos ?? 99,
      points: points ?? 0,
      dnf: dnf,
      fastestLap: false,
      qualifyingPos: 99,
      qualifyingPoints: 0,
      gapToWinner: null,
      gapToPole: null,
      startingPos: 99,
      gapAhead: null,
      gapBehind: null,
      sprintPoints: 0,
      sprintPos: null,
      sprintQualiPos: null,
      teamId: teamId,
      driverOfTheDay: false
    };

    if (base.dnf) {
      base.finishingPos = -1;
      base.points = -1;
    }

    const qualiRow = queryDB(`
        SELECT FinishingPos, ChampionshipPoints
        FROM Races_QualifyingResults
        WHERE RaceFormula = ?
          AND RaceID = ?
          AND SeasonID = ?
          AND DriverID = ?
          AND QualifyingStage = 1
      `, [formula, raceID, season, driverID], "singleRow") || [];

    const qualiPos = qualiRow[0] ?? 99;
    base.qualifyingPos = qualiPos;
    base.qualifyingPoints = qualiRow[1] ?? 0;
    base.startingPos = qualiPos;
    const invertLimit = Number(formula) === 2 ? 10 : (Number(formula) === 3 ? 12 : 0);
    if (invertLimit > 0 && Number.isFinite(Number(qualiPos))) {
      const qPos = Number(qualiPos);
      base.sprintQualiPos = (qPos > 0 && qPos <= invertLimit) ? (invertLimit + 1 - qPos) : qPos;
    } else {
      base.sprintQualiPos = qualiPos;
    }

    const fastestLapDriver = queryDB(`
        SELECT DriverID
        FROM Races_FeatureRaceResults
        WHERE FastestLap > 0
          AND RaceID = ?
          AND SeasonID = ?
          AND RaceFormula = ?
        ORDER BY FastestLap
        LIMIT 1
      `, [raceID, season, formula], "singleValue");

    base.fastestLap = parseInt(fastestLapDriver) === parseInt(driverID);

    raceObjects.push(base);
    byRace.set(raceID, base);
  });

  if (Array.isArray(sprints)) {
    for (const sprintRow of sprints) {
      const [sprintRaceID, sprintPos, sprintPoints] = sprintRow;
      const obj = byRace.get(sprintRaceID);
      if (obj) {
        obj.sprintPoints = sprintPoints ?? 0;
        obj.sprintPos = sprintPos ?? null;
      }
    }
  }

  const latestTeamId =
    raceObjects.length ? raceObjects[raceObjects.length - 1].teamId : teamID;

  const championshipPosition =
    queryDB(`
      SELECT Position
      FROM Races_Driverstandings
      WHERE RaceFormula = ?
        AND SeasonID = ?
        AND DriverID = ?
    `, [formula, season, driverID], "singleValue") || 0;

  return {
    driverName: nameFormatted,
    latestTeamId,
    driverId: driverID[0] || driverID,
    championshipPosition,
    races: raceObjects
  };
}

export function formatSeasonResults(
  results,
  driverName,
  teamID,
  driver,
  year,
  sprints,
  isCurrentYear = true,
  formula = 1
) {
  if (Number(formula) !== 1) {
    return formatSeasonResultsF2F3(results, driverName, teamID, driver, year, sprints, formula);
  }
  const driverID = Array.isArray(driver) ? driver[0] : driver;
  const season = Array.isArray(year) ? year[0] : year;

  const toSeconds = (t) => {
    if (t == null) return null;
    if (typeof t === "number") return t;
    const s = String(t).trim();
    if (s === "" || s.toUpperCase() === "NR") return null;
    const clean = s.startsWith("(") && s.endsWith(")") ? s.slice(1, -1) : s;
    if (clean.includes(":")) {
      const [mm, rest] = clean.split(":");
      const secs = parseFloat(rest);
      if (isNaN(secs)) return null;
      return parseInt(mm, 10) * 60 + secs;
    }
    const n = parseFloat(clean);
    return isNaN(n) ? null : n;
  };
  const formatGap = (delta) => {
    if (delta == null) return null;
    return `+${delta.toFixed(3)}`;
  };

  const nameFormatted = formatDriverName(driverName);

  // ---- carreras del piloto ----
  const racesParticipated =
    queryDB(`
      SELECT RaceID
      FROM Races_Results
      WHERE DriverID = ?
        AND Season = ?
    `, [driverID, season], "allRows") || [];
  const raceObjects = [];
  const formattedBasics = results.map(r => ({
    finishingPos: r[2],
    points: r[3]
  }));

  for (let i = 0; i < racesParticipated.length; i++) {
    const raceID = racesParticipated[i][0];

    // Traemos resultados completos de la carrera para calcular gaps/startingPos en una sola query
    const raceResults =
      queryDB(`
        SELECT DriverID, FinishingPos, Points, Time, StartingPos, DNF
        FROM Races_Results
        WHERE Season = ?
          AND RaceID = ?
      `, [season, raceID], "allRows") || [];

    // info específica del piloto
    const myRow = raceResults.find(r => Number(r[0]) === Number(driverID));
    const myDNF = myRow ? (Number(myRow[5]) === 1) : 0;
    const myStartingPos = myRow ? (myRow[4] ?? 99) : 99;

    // vuelta rápida (tu lógica)
    const driverWithFastestLap = queryDB(`
        SELECT DriverID
        FROM Races_Results
        WHERE FastestLap > 0
          AND RaceID = ?
          AND Season = ?
        ORDER BY FastestLap
        LIMIT 1
      `, [raceID, season], "singleValue");

    // objeto base
    const base = {
      raceId: raceID,
      finishingPos: formattedBasics[i]?.finishingPos ?? 99,
      points: myDNF ? -1 : formattedBasics[i]?.points ?? 0,
      dnf: myDNF,
      fastestLap: parseInt(driverWithFastestLap) === parseInt(driverID),
      qualifyingPos: 99,
      gapToWinner: null,
      gapToPole: null,
      // NUEVOS CAMPOS:
      startingPos: myStartingPos,
      gapAhead: null,
      gapBehind: null,
      // sprint/equipo
      sprintPoints: 0,
      sprintPos: null,
      teamId: 0,
      driverOfTheDay: false
    };

    if (base.dnf) {
      base.finishingPos = -1;
      base.points = -1;
    }

    // Quali / parrilla (como antes)
    let QRes;
    if (isCurrentYear) {
      const QStage =
        queryDB(`
          SELECT MAX(QualifyingStage)
          FROM Races_QualifyingResults
          WHERE RaceFormula = 1
            AND RaceID = ?
            AND SeasonID = ?
            AND DriverID = ?
        `, [raceID, season, driverID], "singleValue") || 0;

      QRes =
        queryDB(`
          SELECT FinishingPos
          FROM Races_QualifyingResults
          WHERE RaceFormula = 1
            AND RaceID = ?
            AND SeasonID = ?
            AND DriverID = ?
            AND QualifyingStage = ?
        `, [raceID, season, driverID, QStage], "singleValue") || 99;
    } else {
      QRes =
        queryDB(`
          SELECT StartingPos
          FROM Races_Results
          WHERE RaceID = ?
            AND DriverID = ?
        `, [raceID, driverID], "singleValue") || 99;
    }
    base.qualifyingPos = QRes;

    // Gaps generales (tus funciones existentes)
    base.gapToWinner = calculateTimeDifference(driverID, raceID);
    base.gapToPole = calculateTimeToPole(driverID, raceID);

    // --- NUEVO: calcular gapAhead / gapBehind con todos los clasificados ---
    if (!base.dnf && raceResults.length > 0) {
      // clasificados con tiempo interpretable
      const classified = raceResults
        .filter(r => Number(r[1]) > 0) // FinishingPos > 0
        .sort((a, b) => Number(a[1]) - Number(b[1])); // por posición

      const idx = classified.findIndex(r => Number(r[0]) === Number(driverID));
      if (idx !== -1) {
        const myTime = toSeconds(classified[idx][3]); // Time
        // delante
        if (idx > 0) {
          const aheadTime = toSeconds(classified[idx - 1][3]);
          if (myTime != null && aheadTime != null) {
            base.gapAhead = formatGap(myTime - aheadTime);
          }
        }
        // detrás
        if (idx < classified.length - 1) {
          const behindTime = toSeconds(classified[idx + 1][3]);
          if (myTime != null && behindTime != null) {
            base.gapBehind = formatGap(behindTime - myTime);
          }
        }
      }
    }

    // gaps listos
    // equipo por carrera
    const teamInRace =
      queryDB(`
        SELECT TeamID
        FROM Races_Results
        WHERE RaceID = ?
          AND DriverID = ?
      `, [raceID, driverID], "singleValue") || 0;

    base.teamId = teamInRace;

    raceObjects.push(base);
  }

  // Sprints
  if (Array.isArray(sprints)) {
    const byRace = new Map(raceObjects.map(o => [o.raceId, o]));
    for (const sprintRow of sprints) {
      const [sprintRaceID, sprintPos, sprintPoints] = sprintRow;
      const obj = byRace.get(sprintRaceID);
      if (obj) {
        obj.sprintPoints = sprintPoints ?? 0;
        obj.sprintPos = sprintPos ?? null;
      }
    }
  }

  // último equipo / posición campeonato
  const latestTeamId =
    raceObjects.length ? raceObjects[raceObjects.length - 1].teamId : teamID;

  const championshipPosition =
    queryDB(`
        SELECT Position
        FROM Races_Driverstandings
        WHERE RaceFormula = ?
          AND SeasonID = ?
          AND DriverID = ?
      `, [formula, season, driverID], "singleValue") || 0;

  const payload = {
    driverName: nameFormatted,
    latestTeamId,
    driverId: driverID[0] || driverID,
    championshipPosition,
    races: raceObjects
  };

  return payload;
}



export function calculateTimeToPole(driverID, raceID) {
  const QStage = queryDB(`
      SELECT MAX(QualifyingStage)
      FROM Races_QualifyingResults
      WHERE RaceFormula = 1
        AND RaceID = ?
        AND DriverID = ?
    `, [raceID, driverID], 'singleValue') || 0;

  const poleTime = queryDB(`
      SELECT MIN(FastestLap)
      FROM Races_QualifyingResults
      WHERE RaceFormula = 1
        AND RaceID = ?
        AND QualifyingStage = 3
        AND FastestLap IS NOT 0
    `, [raceID], 'singleValue') || 9999;

  const driverTime = queryDB(`
      SELECT FastestLap
      FROM Races_QualifyingResults
      WHERE RaceFormula = 1
        AND RaceID = ?
        AND QualifyingStage = ?
        AND DriverID = ?
    `, [raceID, QStage, driverID], 'singleValue') || 9999;

  if (driverTime < poleTime) {
    return "NR";
  } else {
    const difference = Number((driverTime - poleTime).toFixed(2));
    return `+${difference}s`;
  }
}

export function calculateTimeDifference(driverID, raceID) {
  const totalLaps = queryDB(`
      SELECT MAX(Laps)
      FROM Races_Results
      WHERE RaceID = ?
    `, [raceID], 'singleValue') || 0;

  const driverLaps = queryDB(`
      SELECT Laps
      FROM Races_Results
      WHERE RaceID = ?
        AND DriverID = ?
    `, [raceID, driverID], 'singleValue') || 0;

  if (driverLaps < totalLaps) {
    return `+${totalLaps - driverLaps} L`;
  } else {
    const winnerID = queryDB(`
        SELECT DriverID
        FROM Races_Results
        WHERE RaceID = ?
          AND FinishingPos = 1
      `, [raceID], 'singleValue');

    const winnerTime = queryDB(`
        SELECT Time
        FROM Races_Results
        WHERE RaceID = ?
          AND DriverID = ?
      `, [raceID, winnerID], 'singleValue') || 0;

    const driverTime = queryDB(`
        SELECT Time
        FROM Races_Results
        WHERE RaceID = ?
          AND DriverID = ?
      `, [raceID, driverID], 'singleValue') || 0;

    const timeDiff = Number((driverTime - winnerTime).toFixed(1));
    return `+${timeDiff}s`;
  }
}





export function fetchDriverNumbers() {
  const numbers = queryDB(`SELECT DISTINCT Number
       FROM Staff_DriverNumbers dn 
        `, [], 'allRows');

  return numbers.map(n => n[0]);
}

export function fetchDriverContracts(id) {
  // Obtener el contrato actual
  const currentContract = queryDB(`
        SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos, TeamID
        FROM Staff_Contracts
        WHERE ContractType = 0 AND StaffID = ?
        AND (TeamID BETWEEN 1 AND 10 OR TeamID = 32)
    `, [id], 'singleRow');
    //teamID between 1 and 1 10 (10 included) and alsoc na be 32
  // Obtener el contrato futuro
  const futureContract = queryDB(`
        SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos, PosInTeam, TeamID
        FROM Staff_Contracts
        WHERE ContractType = 3 AND StaffID = ?
    `, [id], 'singleRow');

  // Obtener el día y la temporada actual
  const daySeason = queryDB(`
        SELECT Day, CurrentSeason
        FROM Player_State
    `, [], 'singleRow');

  const juniorFormulasContract = queryDB(`
        SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos, PosInTeam, TeamID
        FROM Staff_Contracts
        WHERE ContractType = 0 AND StaffID = ?
        AND (TeamID > 10 AND TeamID <> 32)
    `, [id], 'singleRow');

  // Retornar los resultados
  return [currentContract, futureContract, juniorFormulasContract, daySeason ? daySeason[1] : null];
}

function formatStaffNameFromLocKeys(firstNameLocKey, lastNameLocKey) {
  let firstName = "";
  let lastName = "";

  if (typeof firstNameLocKey === "string") {
    if (!firstNameLocKey.includes("STRING_LITERAL")) {
      const m = firstNameLocKey.match(/StaffName_Forename_(?:Male|Female)_(\w+)/);
      firstName = m ? removeNumber(m[1]) : "";
    } else {
      const m = firstNameLocKey.match(/\|([^|]+)\|/);
      firstName = m ? m[1] : "";
    }
  }

  if (typeof lastNameLocKey === "string") {
    if (!lastNameLocKey.includes("STRING_LITERAL")) {
      const m = lastNameLocKey.match(/StaffName_Surname_(\w+)/);
      lastName = m ? removeNumber(m[1]) : "";
    } else {
      const m = lastNameLocKey.match(/\|([^|]+)\|/);
      lastName = m ? m[1] : "";
    }
  }

  return `${firstName} ${lastName}`.trim();
}

export function fetchJuniorTeamDriverNames(teamId) {
  const maxCars = (teamId >= 11 && teamId <= 21) ? 2 : (teamId >= 22 && teamId <= 31) ? 3 : 0;
  if (!maxCars) return [];

  const rows = queryDB(`
      SELECT bas.FirstName, bas.LastName, con.PosInTeam
      FROM Staff_BasicData bas
      JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID
      JOIN Staff_Contracts con ON bas.StaffID = con.StaffID
      WHERE con.ContractType = 0
        AND con.TeamID = ?
      ORDER BY con.PosInTeam, bas.LastName, bas.FirstName
    `, [teamId], 'allRows') || [];

  const byPos = new Map();

  rows.forEach(([firstName, lastName, posInTeam]) => {
    const pos = Number(posInTeam);
    if (!Number.isFinite(pos) || pos < 1 || pos > maxCars) return;
    if (byPos.has(pos)) return;

    const name = formatStaffNameFromLocKeys(firstName, lastName);
    byPos.set(pos, name || "Free driver");
  });

  const result = [];
  for (let pos = 1; pos <= maxCars; pos++) {
    result.push({ name: byPos.get(pos) || "Free driver", posInTeam: pos });
  }

  return result;
}

export function checkCustomTables(year) {
  let createdEnginesList = false;
  let createdEnginesStats = false;
  let createdEnginesAllocations = false;
  let createdCustomSaveConfig = false;
  let createdEngineRegulationState = false;

  const tablesToCheck = [
    {
      name: 'Custom_Engines_List',
      createSQL: `
          CREATE TABLE Custom_Engines_List (
            engineId INTEGER PRIMARY KEY,
            name TEXT
          )
        `
    },
    {
      name: 'Custom_Engines_Stats',
      createSQL: `
        CREATE TABLE Custom_Engines_Stats (
            engineId INTEGER,
            designId INTEGER,
            partStat INTEGER,
            unitValue REAL,
            Value REAL,
            PRIMARY KEY (engineId, designId, partStat)
        )
        `
    },
    {
      name: 'Custom_Save_Config',
      createSQL: `
          CREATE TABLE Custom_Save_Config (
            key TEXT PRIMARY KEY,
            value TEXT
          )
        `
    },
    {
      name: 'Custom_Engine_Allocations',
      createSQL: `
          CREATE TABLE Custom_Engine_Allocations (
            teamId INTEGER,
            engineId INTEGER
            
          )
        `
    },
    {
      name: 'Custom_Engine_Regulation_State',
      createSQL: `
            CREATE TABLE IF NOT EXISTS Custom_Engine_Regulation_State (
              id INTEGER PRIMARY KEY CHECK (id = 1),
              lastSeasonApplied INTEGER
            );
        `
    }
  ];

  tablesToCheck.forEach((table) => {
    const tableExists = queryDB(`
        SELECT name
        FROM sqlite_master
        WHERE type='table'
          AND name=?
      `, [table.name], 'singleValue');


    if (!tableExists) {
      queryDB(table.createSQL, [], 'run');


      if (table.name === 'Custom_Engines_List') {
        createdEnginesList = true;
      }
      else if (table.name === 'Custom_Engines_Stats') {
        createdEnginesStats = true;
      }
      else if (table.name === 'Custom_Engine_Allocations') {
        createdEnginesAllocations = true;
      }
      else if (table.name === 'Custom_Save_Config') {
        createdCustomSaveConfig = true;
      }
      else if (table.name === 'Custom_Engine_Regulation_State') {
        createdEngineRegulationState = true;
      }
    }
  });

  fixCustomEnginesStatsTable();

  insertDefualtEnginesData(createdEnginesList, createdEnginesStats, createdEnginesAllocations, createdCustomSaveConfig, createdEngineRegulationState, year);

  createEngineMigrationTrigger();
}

export function fixCustomEnginesStatsTable() {
  // Verificar si la tabla tiene la PRIMARY KEY
  const hasPrimaryKey = queryDB(`
    PRAGMA table_info(Custom_Engines_Stats);
  `, [], 'allRows'); // PRAGMA returns rows

  let primaryKeyExists = hasPrimaryKey.some(
    (column) => column[5] > 0 // Column index 5 is pk
  );

  if (!primaryKeyExists) {
    queryDB(`
      CREATE TABLE Custom_Engines_Stats_TEMP (
        engineId INTEGER,
        designId INTEGER,
        partStat INTEGER,
        unitValue REAL,
        Value REAL,
        PRIMARY KEY (engineId, designId, partStat)
      );
    `, [], 'run');

    queryDB(`
      INSERT INTO Custom_Engines_Stats_TEMP (engineId, designId, partStat, unitValue, Value)
      SELECT engineId, designId, partStat, unitValue, Value
      FROM Custom_Engines_Stats
      WHERE rowid IN (
        SELECT MAX(rowid) 
        FROM Custom_Engines_Stats
        GROUP BY engineId, designId, partStat
      );
    `, [], 'run');

    queryDB(`DROP TABLE Custom_Engines_Stats;`, [], 'run');

    queryDB(`ALTER TABLE Custom_Engines_Stats_TEMP RENAME TO Custom_Engines_Stats;`, [], 'run');


  }
}

export function insertDefualtEnginesData(list, stats, allocations, customSave, engineRegulationState, year) {
  const engines = [
    {
      id: 1,
      name: 'Ferrari',
      stats: [
        { partStat: 6, value: 500, unitValue: 75, designId: 1 },
        { partStat: 10, value: 750, unitValue: 95, designId: 1 },
        { partStat: 11, value: 250, unitValue: 80, designId: 1 },
        { partStat: 12, value: 500, unitValue: 77.5, designId: 1 },
        { partStat: 14, value: 400, unitValue: 68, designId: 1 },
        { partStat: 15, value: 350, unitValue: 57, designId: 2 },
        { partStat: 15, value: 0, unitValue: 50, designId: 3 }
      ]
    },
    {
      id: 4,
      name: 'Red Bull',
      stats: [
        { partStat: 6, value: 300, unitValue: 65, designId: 4 },
        { partStat: 10, value: 1000, unitValue: 100, designId: 4 },
        { partStat: 11, value: 0, unitValue: 85, designId: 4 },
        { partStat: 12, value: 0, unitValue: 70, designId: 4 },
        { partStat: 14, value: 0, unitValue: 60, designId: 4 },
        { partStat: 15, value: 0, unitValue: 50, designId: 5 },
        { partStat: 15, value: 600, unitValue: 62, designId: 6 }
      ]
    },
    {
      id: 7,
      name: 'Mercedes',
      stats: [
        { partStat: 6, value: 0, unitValue: 50, designId: 7 },
        { partStat: 10, value: 500, unitValue: 90, designId: 7 },
        { partStat: 11, value: 1000, unitValue: 65, designId: 7 },
        { partStat: 12, value: 850, unitValue: 82.75, designId: 7 },
        { partStat: 14, value: 1000, unitValue: 80, designId: 7 },
        { partStat: 15, value: 1000, unitValue: 70, designId: 8 },
        { partStat: 15, value: 1000, unitValue: 70, designId: 9 }
      ]
    },
    {
      id: 10,
      name: 'Renault',
      stats: [
        { partStat: 6, value: 1000, unitValue: 100, designId: 10 },
        { partStat: 10, value: 0, unitValue: 80, designId: 10 },
        { partStat: 11, value: 500, unitValue: 75, designId: 10 },
        { partStat: 12, value: 1000, unitValue: 85, designId: 10 },
        { partStat: 14, value: 650, unitValue: 73, designId: 10 },
        { partStat: 15, value: 500, unitValue: 75, designId: 11 },
        { partStat: 15, value: 1000, unitValue: 100, designId: 12 }
      ]
    }
  ];

  const teams = {
    alphatauri: {
      23: "alphatauri",
      24: "visarb"
    },
    alfa: {
      23: "alfa",
      24: "stake"
    },
    alpine: {
      23: "alpine",
      24: "alpine"
    }
  }

  if (customSave) {
    for (let key in teams) {
      const newTeam = teams[key][year];
      queryDB(`INSERT OR REPLACE INTO Custom_Save_Config (key, value) VALUES (?, ?)`, [key, newTeam], 'run');
    }
  }


  if (list && stats) {
    engines.forEach(engine => {
      queryDB(`
        INSERT OR REPLACE INTO Custom_Engines_List (engineId, Name)
        VALUES (?, ?)
      `, [engine.id, engine.name], 'run');

      engine.stats.forEach(stat => {
        queryDB(`
          INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
          VALUES (?, ?, ?, ?, ?)
        `, [engine.id, stat.designId, stat.partStat, stat.value, stat.unitValue], 'run');
      });
    });
  }

  if (allocations) {
    const maxYear = queryDB(`SELECT MAX(SeasonID) FROM Parts_TeamHistory`, [], 'singleValue');
    const actualEngineAllocations = queryDB(`
      SELECT th.TeamID, em.EngineDesignID
      FROM Parts_TeamHistory th
      JOIN Parts_Enum_EngineManufacturers em
        ON th.EngineManufacturer = em.Value
      WHERE SeasonID = ?`,
      [maxYear], 'allRows');


    actualEngineAllocations.forEach(engine => {
      queryDB(`
        INSERT OR REPLACE INTO Custom_Engine_Allocations (teamId, engineId)
        VALUES (?, ?)
      `, [engine[0], engine[1]], 'run');
    });
  }
  if (engineRegulationState) {
    queryDB(`
      INSERT OR IGNORE INTO Custom_Engine_Regulation_State (id, lastSeasonApplied)
      VALUES (1, -1);
    `, [], 'run');
  }


}

export function updateCustomEngines(engineData) {
  for (let engineId in engineData) {
    const nameCapitalized = engineData[engineId].name.charAt(0).toUpperCase() + engineData[engineId].name.slice(1);
    queryDB(`INSERT OR REPLACE INTO Custom_Engines_List (engineId, Name) VALUES (?, ?)`, [engineId, nameCapitalized], 'run');
    for (let stat in engineData[engineId].stats) {
      const untiValue = engineData[engineId].stats[stat];
      const value = engine_unitValueToValue[stat](untiValue);
      if (parseInt(stat) !== 18 && parseInt(stat) !== 19) {
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (?, ?, ?, ?, ?)`, [engineId, engineId, stat, value, untiValue], 'run');
      }
      else if (parseInt(stat) === 18) {
        let designId = parseInt(engineId) + 1;
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (?, ?, ?, ?, ?)`, [engineId, designId, 15, value, untiValue], 'run');
      }
      else if (parseInt(stat) === 19) {
        let designId = parseInt(engineId) + 2;
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (?, ?, ?, ?, ?)`, [engineId, designId, 15, value, untiValue], 'run');
      }
    }
    updateTeamsSuppliedByEngine(engineId, engineData[engineId].stats);

  }
}

export function editEngines(engineData) {
  for (let engineId in engineData) {
    for (let stat in engineData[engineId]) {
      const untiValue = engineData[engineId][stat];
      const value = engine_unitValueToValue[stat](untiValue);
      if (parseInt(stat) !== 18 && parseInt(stat) !== 19) {
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (?, ?, ?, ?, ?)`, [engineId, engineId, stat, value, untiValue], 'run');
      }
      else if (parseInt(stat) === 18) {
        let designId = parseInt(engineId) + 1;
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (?, ?, ?, ?, ?)`, [engineId, designId, 15, value, untiValue], 'run');
      }
      else if (parseInt(stat) === 19) {
        let designId = parseInt(engineId) + 2;
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (?, ?, ?, ?, ?)`, [engineId, designId, 15, value, untiValue], 'run');
      }
    }
    updateTeamsSuppliedByEngine(engineId, engineData[engineId]);

  }
}

export function check2025ModCompatibility(year_version) {
  const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
  const currentDay = daySeason[0];
  const currentSeason = daySeason[1];

  const minDay2024 = queryDB(`SELECT MIN(Day) FROM Races WHERE SeasonID = 2024`, [], 'singleValue');
  const firstRaceState2024 = queryDB(`SELECT State FROM Races WHERE Day = ? AND SeasonID = 2024`, [minDay2024], 'singleValue');

  const maxDay2024 = queryDB(`SELECT MAX(Day) FROM Races WHERE SeasonID = 2024`, [], 'singleValue');
  const lastRaceState2024 = queryDB(`SELECT State FROM Races WHERE Day = ? AND SeasonID = 2024`, [maxDay2024], 'singleValue');

  const minDay2025 = queryDB(`SELECT MIN(Day) FROM Races WHERE SeasonID = 2025`, [], 'singleValue');
  const firstRaceState2025 = queryDB(`SELECT State FROM Races WHERE Day = ? AND SeasonID = 2025`, [minDay2025], 'singleValue');


  if (year_version !== "24") {
    return "NotCompatible";
  }

  const edited = queryDB(`SELECT * FROM Custom_2025_SeasonMod WHERE value = 1`, [], 'allRows');
  if (edited.length > 0) {
    return "AlreadyEdited";
  }

  if (firstRaceState2024 === 0 && currentSeason === 2024) {
    return "Start2024";
  }

  if (lastRaceState2024 === 2 && currentSeason === 2024) {
    // return "End2024";
    return "NotCompatible";
  }

  if (currentSeason === 2025 && firstRaceState2025 === 0) {
    // return "Direct2025";
    return "NotCompatible";
  }

  return "NotCompatible";
}


export function updateTeamsSuppliedByEngine(engineId, stats) {
  const teamsSupplied = queryDB(`SELECT teamID FROM Custom_Engine_Allocations WHERE engineId = ?`, [engineId], 'allRows');
  teamsSupplied.forEach(team => {
    const teamEngineId = queryDB(`SELECT DesignID FROM Parts_Designs WHERE TeamID = ? AND PartType = 0`, [team[0]], 'singleValue');
    const teamERSId = queryDB(`SELECT DesignID FROM Parts_Designs WHERE TeamID = ? AND PartType = 1`, [team[0]], 'singleValue');
    const teamGearboxId = queryDB(`SELECT DesignID FROM Parts_Designs WHERE TeamID = ? AND PartType = 2`, [team[0]], 'singleValue');
    for (let stat in stats) {
      if (parseInt(stat) < 18) {
        const untiValue = stats[stat];
        const value = engine_unitValueToValue[stat](untiValue);
        queryDB(`UPDATE Parts_Designs_StatValues SET Value = ?, UnitValue = ? WHERE DesignID = ? AND PartStat = ?`, [value, untiValue, teamEngineId, stat], 'run');
      }

    }
    const valueERS = engine_unitValueToValue[18](stats[18]);
    const unitValueERS = stats[18];
    const valueGearbox = engine_unitValueToValue[19](stats[19]);
    const unitValueGearbox = stats[19];
    queryDB(`UPDATE Parts_Designs_StatValues SET Value = ?, UnitValue = ? WHERE DesignID = ? AND PartStat = 15`, [valueERS, unitValueERS, teamERSId], 'run');
    queryDB(`UPDATE Parts_Designs_StatValues SET Value = ?, UnitValue = ? WHERE DesignID = ? AND PartStat = 15`, [valueGearbox, unitValueGearbox, teamGearboxId], 'run');
  });


}

export function updateCustomConfig(data) {
  const alfaRomeo = data.alfa;
  const alphaTauri = data.alphatauri;
  const alpine = data.alpine;
  const primaryColor = data.primaryColor;
  const secondaryColor = data.secondaryColor;
  const difficulty = data.difficulty
  const playerTeam = data.playerTeam

  queryDB(`
    INSERT OR REPLACE INTO Custom_Save_Config (key, value)
    VALUES ('alfa', ?)
  `, [alfaRomeo], 'run');

  queryDB(`
    INSERT OR REPLACE INTO Custom_Save_Config (key, value)
    VALUES ('alphatauri', ?)
  `, [alphaTauri], 'run');

  queryDB(`
    INSERT OR REPLACE INTO Custom_Save_Config (key, value)
    VALUES ('alpine', ?)
  `, [alpine], 'run');

  queryDB(`
    INSERT OR REPLACE INTO Custom_Save_Config (key, value)
    VALUES ('primaryColor', ?)
  `, [primaryColor], 'run');

  queryDB(`
    INSERT OR REPLACE INTO Custom_Save_Config (key, value)
    VALUES ('secondaryColor', ?)
  `, [secondaryColor], 'run');

  //delete the difficulty key from Custom_Save_Config every time
  queryDB(`DELETE FROM Custom_Save_Config WHERE key = 'difficulty'`, [], 'run');


  if (parseInt(playerTeam) !== -1) {
    updateTeam(playerTeam)
  }

  manageDifficultyTriggers(data.triggerList)
  manageRefurbishTrigger(data.refurbish)
  const globals = getGlobals()
  if (globals.yearIteration === "24") {
    editFreezeMentality(data.frozenMentality)
  }



}

function updateTeam(teamID) {
  const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
  const currentDay = daySeason[0];
  const metadata = getMetadata()

  const metaProperty = metadata.gvasMeta.Properties.Properties
    .filter(p => p.Name === "MetaData")[0];

  queryDB(`UPDATE Player SET TeamID = ?`, [teamID], 'run');
  queryDB(`UPDATE Staff_NarrativeData SET TeamID = ? WHERE GenSource = 0`, [teamID], 'run');
  queryDB(`UPDATE Player_History SET EndDay = ? WHERE EndDay IS NULL`, [currentDay - 1], 'run');
  queryDB(`DELETE FROM Player_History WHERE EndDay < StartDay`, [], 'run');
  queryDB(`INSERT INTO Player_History VALUES (?, ?, NULL)`, [teamID, currentDay], 'run');
}


export function fetchCustomConfig() {
  const rows = queryDB(`SELECT key, value FROM Custom_Save_Config`, [], 'allRows') || [];
  const config = {
    teams: {},
    primaryColor: null,
    secondaryColor: null
  };

  rows.forEach(row => {
    const key = row[0];
    const value = row[1];
    if (key === 'alphatauri' || key === 'alpine' || key === 'alfa') {
      config.teams[key] = value;
    } else if (key === 'primaryColor') {
      config.primaryColor = value;
    } else if (key === 'secondaryColor') {
      config.secondaryColor = value;
    }
    else if (key === 'difficulty') {
      config.difficulty = value;
    }
  });

  const triggers = fetchExistingTriggers()
  const playerTeam = fetchPlayerTeam()
  config.playerTeam = playerTeam
  config.triggerList = triggers.triggerList
  config.refurbish = triggers.refurbish
  config.frozenMentality = triggers.frozenMentality

  return config;
}

function fetchPlayerTeam() {
  const playerTeam = queryDB(`
      SELECT TeamID
      FROM Player
    `, [], 'singleValue') || 0;

  return playerTeam;
}

export function fetch2025ModData() {
  let tableExists = queryDB(`SELECT name FROM sqlite_master WHERE type='table' AND name='Custom_2025_SeasonMod'`, [], "singleRow");
  if (!tableExists) {
    queryDB(`CREATE TABLE Custom_2025_SeasonMod (key TEXT PRIMARY KEY, value TEXT)`, [], 'run');
    //insert change-regulations with value 0
    queryDB(`INSERT INTO Custom_2025_SeasonMod (key, value) VALUES ('time-travel', '0'), ('extra-drivers', '0'),
        ('change-line-ups', '0'), ('change-stats', '0'), ('change-calendar', '0'), ('change-regulations', '0'), ('change-cfd', '0'), ('change-performance', '0')`, [], 'run');
  }

  const rows = queryDB(`SELECT key, value FROM Custom_2025_SeasonMod`, [], 'allRows') || [];
  const config = {};

  rows.forEach(row => {
    const key = row[0];
    const value = row[1];
    config[key] = value;
  });

  return config;

}

function createEngineMigrationTrigger() {
  const sql = `
  DROP TRIGGER IF EXISTS trg_sync_engine_stats_on_first_full_season_day;

  CREATE TRIGGER trg_sync_engine_stats_on_first_full_season_day
  AFTER UPDATE OF Day ON Player_State
  WHEN
    NEW.CurrentSeason = OLD.CurrentSeason
    AND NEW.CurrentSeason >
        (SELECT lastSeasonApplied FROM Custom_Engine_Regulation_State WHERE id = 1)
  BEGIN
    --------------------------------------------------------------------
    -- Marca la season como ya aplicada (LO PRIMERO)
    --------------------------------------------------------------------
    UPDATE Custom_Engine_Regulation_State
    SET lastSeasonApplied = NEW.CurrentSeason
    WHERE id = 1;
    --------------------------------------------------------------------
    -- 1) MOTOR (PartType = 0): copia todas las stats PartStat tal cual
    --------------------------------------------------------------------
    UPDATE Parts_Designs_StatValues
    SET
      Value = (
        SELECT ces.Value
        FROM Parts_Designs pd
        JOIN Custom_Engine_Allocations cea ON cea.TeamID = pd.TeamID
        JOIN Custom_Engines_Stats ces
          ON ces.EngineID = cea.EngineID
        AND ces.DesignID = cea.EngineID               -- motor base
        AND ces.PartStat = Parts_Designs_StatValues.PartStat
        WHERE pd.DesignID = Parts_Designs_StatValues.DesignID
          AND pd.PartType = 0
        LIMIT 1
      ),
      UnitValue = (
        SELECT ces.UnitValue
        FROM Parts_Designs pd
        JOIN Custom_Engine_Allocations cea ON cea.TeamID = pd.TeamID
        JOIN Custom_Engines_Stats ces
          ON ces.EngineID = cea.EngineID
        AND ces.DesignID = cea.EngineID
        AND ces.PartStat = Parts_Designs_StatValues.PartStat
        WHERE pd.DesignID = Parts_Designs_StatValues.DesignID
          AND pd.PartType = 0
        LIMIT 1
      )
    WHERE EXISTS (
      SELECT 1
      FROM Parts_Designs pd
      JOIN Custom_Engine_Allocations cea ON cea.TeamID = pd.TeamID
      JOIN Custom_Engines_Stats ces
        ON ces.EngineID = cea.EngineID
      AND ces.DesignID = cea.EngineID
      AND ces.PartStat = Parts_Designs_StatValues.PartStat
      WHERE pd.DesignID = Parts_Designs_StatValues.DesignID
        AND pd.PartType = 0
    );

    --------------------------------------------------------------------
    -- 2) CAJA DE CAMBIOS (PartType = 1): copia stats desde designId=engineId+2
    --------------------------------------------------------------------
    UPDATE Parts_Designs_StatValues
    SET
      Value = (
        SELECT ces.Value
        FROM Parts_Designs pd
        JOIN Custom_Engine_Allocations cea ON cea.TeamID = pd.TeamID
        JOIN Custom_Engines_Stats ces
          ON ces.EngineID = cea.EngineID
        AND ces.DesignID = cea.EngineID + 2           -- gearbox
        AND ces.PartStat = Parts_Designs_StatValues.PartStat
        WHERE pd.DesignID = Parts_Designs_StatValues.DesignID
          AND pd.PartType = 1
        LIMIT 1
      ),
      UnitValue = (
        SELECT ces.UnitValue
        FROM Parts_Designs pd
        JOIN Custom_Engine_Allocations cea ON cea.TeamID = pd.TeamID
        JOIN Custom_Engines_Stats ces
          ON ces.EngineID = cea.EngineID
        AND ces.DesignID = cea.EngineID + 2
        AND ces.PartStat = Parts_Designs_StatValues.PartStat
        WHERE pd.DesignID = Parts_Designs_StatValues.DesignID
          AND pd.PartType = 1
        LIMIT 1
      )
    WHERE EXISTS (
      SELECT 1
      FROM Parts_Designs pd
      JOIN Custom_Engine_Allocations cea ON cea.TeamID = pd.TeamID
      JOIN Custom_Engines_Stats ces
        ON ces.EngineID = cea.EngineID
      AND ces.DesignID = cea.EngineID + 2
      AND ces.PartStat = Parts_Designs_StatValues.PartStat
      WHERE pd.DesignID = Parts_Designs_StatValues.DesignID
        AND pd.PartType = 1
    );

    --------------------------------------------------------------------
    -- 3) ERS (PartType = 2): copia stats desde designId=engineId+1
    --------------------------------------------------------------------
    UPDATE Parts_Designs_StatValues
    SET
      Value = (
        SELECT ces.Value
        FROM Parts_Designs pd
        JOIN Custom_Engine_Allocations cea ON cea.TeamID = pd.TeamID
        JOIN Custom_Engines_Stats ces
          ON ces.EngineID = cea.EngineID
        AND ces.DesignID = cea.EngineID + 1           -- ERS
        AND ces.PartStat = Parts_Designs_StatValues.PartStat
        WHERE pd.DesignID = Parts_Designs_StatValues.DesignID
          AND pd.PartType = 2
        LIMIT 1
      ),
      UnitValue = (
        SELECT ces.UnitValue
        FROM Parts_Designs pd
        JOIN Custom_Engine_Allocations cea ON cea.TeamID = pd.TeamID
        JOIN Custom_Engines_Stats ces
          ON ces.EngineID = cea.EngineID
        AND ces.DesignID = cea.EngineID + 1
        AND ces.PartStat = Parts_Designs_StatValues.PartStat
        WHERE pd.DesignID = Parts_Designs_StatValues.DesignID
          AND pd.PartType = 2
        LIMIT 1
      )
    WHERE EXISTS (
      SELECT 1
      FROM Parts_Designs pd
      JOIN Custom_Engine_Allocations cea ON cea.TeamID = pd.TeamID
      JOIN Custom_Engines_Stats ces
        ON ces.EngineID = cea.EngineID
      AND ces.DesignID = cea.EngineID + 1
      AND ces.PartStat = Parts_Designs_StatValues.PartStat
      WHERE pd.DesignID = Parts_Designs_StatValues.DesignID
        AND pd.PartType = 2
    );

  END;
  `
  queryDB(sql, [], 'exec');
  console.log("INSERTING TRIGGER FOR ENGINE STATS SYNC ON SEASON CHANGE");
}
