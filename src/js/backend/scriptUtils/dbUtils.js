import { countries_abreviations } from "./countries.js";
import { engine_unitValueToValue } from "./carConstants.js";
import { manageDifficultyTriggers, manageRefurbishTrigger, editFreezeMentality, fetchExistingTriggers } from "./triggerUtils.js";
import { getMetadata, queryDB } from "../dbManager.js";
import { getGlobals } from "../commandGlobals.js";
import { default_dict } from "../../frontend/config.js";


/**
 * Convierte un color ARGB a hexadecimal.
 */
export function argbToHex(argb) {
  const rgb = argb & 0xFFFFFF; // Ignora el canal alfa
  return `#${rgb.toString(16).padStart(6, '0').toUpperCase()}`;
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
    `, 'singleRow');

  if (!row) {
    // No existe la tabla -> asumo que es "23"
    return ["23", null, null, null];
  }

  // Si existe, entonces busco TeamNameLocKey del TeamID=32
  const nameValue = queryDB(`
      SELECT TeamNameLocKey 
      FROM Teams 
      WHERE TeamID = 32
    `, 'singleValue');

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
      `, 'singleRow');

    const secondaryColorRow = queryDB(`
        SELECT Colour
        FROM Teams_Colours
        WHERE TeamID = 32 AND ColourID = 1
      `, 'singleRow');

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
        WHERE StaffID = ${driverID}
      `, 'singleValue');
    if (!countryID) return "";

    const countryName = queryDB(`
        SELECT Name 
        FROM Countries 
        WHERE CountryID = ${countryID}
      `, 'singleValue');
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
        WHERE StaffID = ${driverID}
      `, 'singleValue');
    if (!nationality) return "";

    const natName = nationality.replace(/(?<!^)([A-Z])/g, " $1");
    return countries_abreviations[natName] || "";
  }

  return "";
}

export function fetchForFutureContract(driverID) {
  const teamID = queryDB(`
      SELECT TeamID 
      FROM Staff_Contracts 
      WHERE StaffID = ${driverID} 
        AND ContractType = 3
    `, 'singleValue');

  return teamID ?? -1;
}

export function fetchEngines() {
  const statsIds = [6, 10, 11, 12, 14, 15];
  const enginesList = [];


  let newEngineIds = queryDB(`
      SELECT engineID FROM Custom_Engines_List`, 'allRows');

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
                WHERE designId = ${newEngineIds[i]} AND partStat = ${stat}
            `, 'singleRow');
      if (statResult) {
        resultDict[statResult[0]] = statResult[1];
      }
    }


    // Obtener valor de ERS
    const ersResult = queryDB(`
            SELECT UnitValue 
            FROM Custom_Engines_Stats 
            WHERE designId = ${newErsIds[i]} AND partStat = 15
        `, 'singleValue');
    if (ersResult !== null) {
      resultDict[18] = ersResult;
    }

    // Obtener valor de gearbox
    const gearboxResult = queryDB(`
            SELECT UnitValue 
            FROM Custom_Engines_Stats 
            WHERE designId = ${newGearboxesIds[i]} AND partStat = 15
        `, 'singleValue');
    if (gearboxResult !== null) {
      resultDict[19] = gearboxResult;
    }

    const engineName = queryDB(`
          SELECT name 
          FROM Custom_Engines_List
          WHERE engineID = ${newEngineIds[i]}
      `, 'singleValue');

    // Añadir la información del motor a la lista
    enginesList.push([newEngineIds[i], resultDict, engineName]);
  }

  const engineAllocations = queryDB(`
      SELECT * FROM Custom_Engine_Allocations
    `, 'allRows');

  return [enginesList, engineAllocations];
}


export function fetchMentality(staffID) {
  // Obtengo todas las filas (morale es un array de arrays [[opinion],[opinion], ...])
  const morale = queryDB(`
      SELECT Opinion
      FROM Staff_Mentality_AreaOpinions
      WHERE StaffID = ${staffID}
    `, 'allRows');

  // Obtengo un solo valor
  const globalMentality = queryDB(`
      SELECT Mentality
      FROM Staff_State
      WHERE StaffID = ${staffID}
    `, 'singleValue');

  return [morale, globalMentality];
}

export function checkDrivesForTeam32(staffData) {
  // staffData = [ firstName, lastName, staffID, teamID, posInTeam, minContractType, retired, countContracts ]

  const contractRow = queryDB(`
      SELECT TeamID, PosInTeam
      FROM Staff_Contracts
      WHERE StaffID = ${staffData[2]} 
        AND ContractType = 0 
        AND TeamID = 32
    `, 'singleRow');

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
        WHERE StaffID = ${nameData[2]}
          AND StatID BETWEEN 2 AND 10
      `, 'allRows');

    let stats = statsRows;
    if (!stats || !stats.length) {
      // si no hay stats, por defecto 50
      stats = Array(9).fill([50]);
    }

    const extraRow = queryDB(`
        SELECT Improvability, Aggression
        FROM Staff_DriverData
        WHERE StaffID = ${nameData[2]}
      `, 'singleRow');

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
        WHERE StaffID = ${nameData[2]}
          AND StatID IN (${statIDs.join(",")})
      `, 'allRows');

    return baseResult.concat(statsRows.map(s => s[0]));
  }

  // Si no entra en esos casos, simplemente devolvemos baseResult
  return baseResult;
}

export function fetchDriverRetirement(driverID) {
  const playerRow = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');

  let day = 0, currentSeason = 0;
  if (playerRow) {
    [day, currentSeason] = playerRow;
  } else {
    console.warn("No se encontraron datos en Player_State.");
  }

  const retirementAge = queryDB(`
      SELECT RetirementAge
      FROM Staff_GameData
      WHERE StaffID = ${driverID}
    `, 'singleValue');

  const dob = queryDB(`
      SELECT DOB
      FROM Staff_BasicData
      WHERE StaffID = ${driverID}
    `, 'singleValue');

  const age = (dob != null) ? Math.floor((day - dob) / 365.25) : 0;
  return [retirementAge, age];
}

export function fetchDriverCode(driverID) {
  let code = queryDB(`
      SELECT DriverCode
      FROM Staff_DriverData
      WHERE StaffID = ${driverID}
    `, 'singleValue');

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
    `, 'singleRow');

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
      WHERE CurrentHolder = ${driverID}
    `, 'singleValue');

  if (currentNumber == null) {
    // Si no tiene número, ver si hay libres
    const available = queryDB(`
        SELECT Number
        FROM Staff_DriverNumbers
        WHERE CurrentHolder IS NULL
      `, 'allRows');

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
      WHERE StaffID = ${driverID}
    `, 'singleValue');

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
      WHERE ContractType = 0 AND StaffID = ${driverID}
    `, 'singleValue');

  // Por defecto 4 si no existe
  return category ?? 4;
}

export function fetchMarketability(driverID) {
  return queryDB(`
      SELECT Marketability
      FROM Staff_DriverData
      WHERE StaffID = ${driverID}
    `, 'singleValue');
}

export function fetchSuperlicense(driverID) {
  return queryDB(`
      SELECT HasSuperLicense
      FROM Staff_DriverData
      WHERE StaffID = ${driverID}
    `, 'singleValue');
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
    `, 'allRows');

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
    `, 'allRows');

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
      WHERE Season = ${year}
      GROUP BY 
        bas.FirstName, 
        bas.LastName, 
        bas.StaffID, 
        res.TeamID
      ORDER BY res.TeamID
    `;

  // Obtenemos todas las filas (array de objetos o tuplas)
  const drivers = queryDB(sql, 'allRows') || [];

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

export function fetchSeasonResults(yearSelected) {
  const drivers = queryDB(`
      SELECT DriverID
      FROM Races_DriverStandings
      WHERE RaceFormula = 1
        AND SeasonID = ${yearSelected}
    `, 'allRows') || [];

  const seasonResults = [];
  drivers.forEach((row) => {
    const driverID = row[0];
    const driverRes = fetchOneDriverSeasonResults([driverID], [yearSelected]);
    if (driverRes) {
      seasonResults.push(driverRes);
    }
  });
  return seasonResults;
}

export function fetchQualiResults(yearSelected) {
  const drivers = queryDB(`
      SELECT DriverID
      FROM Races_DriverStandings
      WHERE RaceFormula = 1
        AND SeasonID = ${yearSelected}
    `, 'allRows') || [];

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

export function fetchTeamsStandings(year) {
  return queryDB(`
      SELECT TeamID, Position
      FROM Races_TeamStandings
      WHERE SeasonID = ${year}
        AND RaceFormula = 1
    `, 'allRows') || [];
}

export function fetchPointsRegulations() {
  const pointScheme = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 7`, 'singleValue');
  const twoBiggestPoints = queryDB(`SELECT Points FROM Regulations_NonTechnical_PointSchemes WHERE (PointScheme = ${pointScheme}) AND (RacePos = 1 OR RacePos = 2); `, 'allRows');
  const isLastraceDouble = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 8`, 'singleValue');
  const fastestLapBonusPoint = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 9`, 'singleValue');
  const poleBonusPoint = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 10`, 'singleValue');
  const res = {
    pointScheme: pointScheme,
    twoBiggestPoints: twoBiggestPoints,
    isLastraceDouble: isLastraceDouble,
    fastestLapBonusPoint: fastestLapBonusPoint,
    poleBonusPoint: poleBonusPoint
  }

  return res;
}

export function fetchOneTeamSeasonResults(team, year) {
  const teamID = team;
  const season = year;
  const drivers = queryDB(` SELECT DISTINCT DriverID
       FROM Races_Results
       WHERE Season = ${season}
       AND TeamID = ${teamID} `,
    'allRows') || [];

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

export function fetchOneDriverSeasonResults(driver, year) {
  const driverID = driver;
  const season = year;

  const results = queryDB(`
      SELECT DriverID, TeamID, FinishingPos, Points
      FROM Races_Results
      WHERE Season = ${season}
        AND DriverID = ${driverID}
    `, 'allRows') || [];

  if (results.length > 0) {
    const sprintResults = queryDB(`
        SELECT RaceID, FinishingPos, ChampionshipPoints
        FROM Races_SprintResults
        WHERE SeasonID = ${season}
          AND DriverID = ${driverID}
      `, 'allRows') || [];


    const teamID = results[0][1];

    const driverNameRow = queryDB(`
        SELECT FirstName, LastName
        FROM Staff_BasicData
        WHERE StaffID = ${driverID}
      `, 'singleRow');

    return formatSeasonResults(
      results,
      driverNameRow,
      teamID,
      driver,
      year,
      sprintResults
    );
  }

  return null;
}

export function fetchOneDriverQualiResults(driver, year) {
  const driverID = driver;
  const season = year;

  const results = queryDB(`
      SELECT DriverID, TeamID, StartingPos, Points
      FROM Races_Results
      WHERE Season = ${season}
        AND DriverID = ${driverID}
    `, 'allRows') || [];


  if (results.length > 0) {
    const teamID = results[0][1];

    const driverNameRow = queryDB(`
        SELECT FirstName, LastName
        FROM Staff_BasicData
        WHERE StaffID = ${driverID}
      `, 'singleRow');

    return formatSeasonResults(
      results,
      driverNameRow,
      teamID,
      driver,
      year,
      []
    );
  }

  return null;
}


export function fetchEventsDoneFrom(year) {
  const daySeasonRow = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');

  if (!daySeasonRow) {
    return [];
  }
  const [currentDay, currentSeason] = daySeasonRow;

  const seasonIdsRows = queryDB(`
      SELECT RaceID
      FROM Races
      WHERE SeasonID = ${year}
        AND Day < ${currentDay}
    `, 'allRows') || [];


  const eventsIds = seasonIdsRows.map(row => row[0]);

  return eventsIds;
}

export function fetchEventsFrom(year) {
  const seasonEventsRows = queryDB(`
      SELECT RaceID, TrackID, WeekendType
      FROM Races
      WHERE SeasonID = ${year}
    `, 'allRows') || [];

  return seasonEventsRows; // Ya es un array de arrays con [RaceID, TrackID]
}



export function formatSeasonResults(results, driverName, teamID, driver, year, sprints) {
  const driverID = driver;
  const season = year;

  let nombre = "";
  let apellido = "";


  const firstName = driverName ? driverName[0] : "";
  const lastName = driverName ? driverName[1] : "";

  if (!firstName.includes("STRING_LITERAL")) {
    const nombrePattern = /StaffName_Forename_(Male|Female)_(\w+)/;
    const match = firstName.match(nombrePattern);
    if (match) {
      nombre = removeNumber(match[2]);  // asumiendo que tienes un removeNumber
    } else {
      nombre = "";
    }
  } else {
    const pattern = /\|([^|]+)\|/;
    const match = firstName.match(pattern);
    nombre = match ? match[1] : "";
  }

  if (!lastName.includes("STRING_LITERAL")) {
    const apellidoPattern = /StaffName_Surname_(\w+)/;
    const match = lastName.match(apellidoPattern);
    if (match) {
      apellido = removeNumber(match[1]);
    } else {
      apellido = "";
    }
  } else {
    const pattern = /\|([^|]+)\|/;
    const match = lastName.match(pattern);
    apellido = match ? match[1] : "";
  }

  const nameFormatted = `${nombre} ${apellido}`.trim();

  const racesParticipated = queryDB(`
      SELECT RaceID
      FROM Races_Results
      WHERE DriverID = ${driverID}
        AND Season = ${season}
    `, 'allRows') || [];


  let formatredResults = results.map(r => [r[2], r[3]]);


  for (let i = 0; i < racesParticipated.length; i++) {
    const raceID = racesParticipated[i][0];

    const driverWithFastestLap = queryDB(`
        SELECT DriverID
        FROM Races_Results
        WHERE FastestLap > 0
          AND RaceID = ${raceID}
          AND Season = ${season}
        ORDER BY FastestLap
        LIMIT 1
      `, 'singleValue');

    // 2.2) Checamos si fue DNF
    const dnfd = queryDB(`
        SELECT DNF
        FROM Races_Results
        WHERE DriverID = ${driverID}
          AND Season = ${season}
          AND RaceID = ${raceID}
      `, 'singleValue') || 0;

    // Inyectamos RaceID al inicio de la tupla
    // Python: formatred_results[i] = (raceID,) + formatred_results[i]
    formatredResults[i] = [raceID, ...formatredResults[i]];

    // Si DNF = 1 => set FinishingPos y Points a -1
    if (dnfd === 1) {
      const arr = [...formatredResults[i]];
      arr[1] = -1; // FinishingPos
      arr[2] = -1; // Points
      formatredResults[i] = arr;
    }

    if (parseInt(driverWithFastestLap) === parseInt(driverID)) {
      formatredResults[i].push(1);
    } else {
      formatredResults[i].push(0);
    }

    // 2.3) Quali Stage & FinishingPos
    const QStage = queryDB(`
        SELECT MAX(QualifyingStage)
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID = ${driverID}
      `, 'singleValue') || 0;

    const QRes = queryDB(`
        SELECT FinishingPos
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID = ${driverID}
          AND QualifyingStage = ${QStage}
      `, 'singleValue') || 99;

    // 2.4) Cálculo de diferencias de tiempo (carrera y pole)
    const timeDifference = calculateTimeDifference(driverID, raceID);
    const poleDifference = calculateTimeToPole(driverID, raceID);

    // Añadimos QRes, timeDifference y poleDifference
    formatredResults[i].push(QRes);
    formatredResults[i].push(timeDifference);
    formatredResults[i].push(poleDifference);
  }

  // -------- 3) Añadir datos de sprint al formatredResults --------
  // En Python: 
  // for tupla1 in sprints:
  //   for i, tupla2 in enumerate(formatred_results):
  //     if tupla1[0] == tupla2[0]:
  //       formatred_results[i] = tupla2 + (tupla1[2], tupla1[1])
  //
  // tupla1[0] => RaceID
  // tupla1[1] => FinishingPos
  // tupla1[2] => ChampionshipPoints

  for (const sprintRow of sprints) {
    // sprintRow: [RaceID, FinishingPos, ChampionshipPoints]
    const [sprintRaceID, sprintPos, sprintPoints] = sprintRow;
    // Buscamos coincidencia en formatredResults
    for (let i = 0; i < formatredResults.length; i++) {
      if (formatredResults[i][0] === sprintRaceID) {
        // Agregamos ChampionshipPoints y FinishingPos al final
        // (Ojo: en Python lo agregas en orden (tupla1[2], tupla1[1]) => (ChampPoints, FinishingPos)
        formatredResults[i] = [...formatredResults[i], sprintPoints, sprintPos];
        break;
      }
    }
  }

  // -------- 4) Añadir TeamID a cada carrera --------
  // En Python se hace un for i in range(len(...)):
  //   team_in_race = ...
  //   formatred_results[i] += (team_in_race)
  //   latest_team = ...
  let latestTeam = null;
  for (let i = 0; i < formatredResults.length; i++) {
    const raceID = formatredResults[i][0];
    const teamInRace = queryDB(`
        SELECT TeamID
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND DriverID = ${driverID}
      `, 'singleValue') || 0;

    formatredResults[i].push(teamInRace);
    latestTeam = teamInRace;
  }

  // -------- 5) Agregar la posición final en el campeonato al inicio --------
  const position = queryDB(`
      SELECT Position
      FROM Races_Driverstandings
      WHERE RaceFormula = 1
        AND SeasonID = ${season}
        AND DriverID = ${driverID}
    `, 'singleValue') || 0;


  formatredResults.unshift(position);
  formatredResults.unshift(latestTeam);
  formatredResults.unshift(nameFormatted);

  // Devolvemos el array final
  return formatredResults;
}

export function calculateTimeToPole(driverID, raceID) {
  const QStage = queryDB(`
      SELECT MAX(QualifyingStage)
      FROM Races_QualifyingResults
      WHERE RaceFormula = 1
        AND RaceID = ${raceID}
        AND DriverID = ${driverID}
    `, 'singleValue') || 0;

  const poleTime = queryDB(`
      SELECT MIN(FastestLap)
      FROM Races_QualifyingResults
      WHERE RaceFormula = 1
        AND RaceID = ${raceID}
        AND QualifyingStage = 3
        AND FastestLap IS NOT 0
    `, 'singleValue') || 9999;

  const driverTime = queryDB(`
      SELECT FastestLap
      FROM Races_QualifyingResults
      WHERE RaceFormula = 1
        AND RaceID = ${raceID}
        AND QualifyingStage = ${QStage}
        AND DriverID = ${driverID}
    `, 'singleValue') || 9999;

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
      WHERE RaceID = ${raceID}
    `, 'singleValue') || 0;

  const driverLaps = queryDB(`
      SELECT Laps
      FROM Races_Results
      WHERE RaceID = ${raceID}
        AND DriverID = ${driverID}
    `, 'singleValue') || 0;

  if (driverLaps < totalLaps) {
    return `+${totalLaps - driverLaps} L`;
  } else {
    const winnerID = queryDB(`
        SELECT DriverID
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND FinishingPos = 1
      `, 'singleValue');

    const winnerTime = queryDB(`
        SELECT Time
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND DriverID = ${winnerID}
      `, 'singleValue') || 0;

    const driverTime = queryDB(`
        SELECT Time
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND DriverID = ${driverID}
      `, 'singleValue') || 0;

    const timeDiff = Number((driverTime - winnerTime).toFixed(1));
    return `+${timeDiff}s`;
  }
}





export function fetchCalendar() {
  // Saco [ Day, CurrentSeason ] de Player_State
  const daySeason = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');

  if (!daySeason) {
    console.warn("No data found in Player_State.");
    return [];
  }

  const [day, currentSeason] = daySeason;

  // Saco el calendario
  const calendar = queryDB(`
      SELECT TrackID, WeatherStatePractice, WeatherStateQualifying, WeatherStateRace, WeekendType, State
      FROM Races
      WHERE SeasonID = ${currentSeason}
    `, 'allRows');

  return calendar;
}

export function fetchDriverNumbers() {
  const numbers = queryDB(`SELECT DISTINCT Number
       FROM Staff_DriverNumbers dn 
        `, 'allRows');

  return numbers.map(n => n[0]);
}

export function fetchDriverContract(id) {
  // Obtener el contrato actual
  const currentContract = queryDB(`
        SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos, TeamID
        FROM Staff_Contracts
        WHERE ContractType = 0 AND StaffID = ${id}
    `, 'singleRow');

  // Obtener el contrato futuro
  const futureContract = queryDB(`
        SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos, PosInTeam, TeamID
        FROM Staff_Contracts
        WHERE ContractType = 3 AND StaffID = ${id}
    `, 'singleRow');

  // Obtener el día y la temporada actual
  const daySeason = queryDB(`
        SELECT Day, CurrentSeason
        FROM Player_State
    `, 'singleRow');

  // Retornar los resultados
  return [currentContract, futureContract, daySeason ? daySeason[1] : null];
}

export function checkCustomTables(year) {
  let createdEnginesList = false;
  let createdEnginesStats = false;
  let createdEnginesAllocations = false;
  let createdCustomSaveConfig = false;

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
    }
  ];

  tablesToCheck.forEach((table) => {
    const tableExists = queryDB(`
        SELECT name
        FROM sqlite_master
        WHERE type='table'
          AND name='${table.name}'
      `, 'singleValue');


    if (!tableExists) {
      queryDB(table.createSQL);


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
    }
  });

  fixCustomEnginesStatsTable();

  insertDefualtEnginesData(createdEnginesList, createdEnginesStats, createdEnginesAllocations, createdCustomSaveConfig, year);

}

export function fixCustomEnginesStatsTable() {
  // Verificar si la tabla tiene la PRIMARY KEY
  const hasPrimaryKey = queryDB(`
    PRAGMA table_info(Custom_Engines_Stats);
  `);

  let primaryKeyExists = hasPrimaryKey.some(
    (column) => column.pk > 0 // Comprueba si alguna columna está marcada como parte de la clave primaria
  );

  if (!primaryKeyExists) {
    console.log("La tabla Custom_Engines_Stats no tiene PRIMARY KEY. Se corregirá...");

    queryDB(`
      CREATE TABLE Custom_Engines_Stats_TEMP (
        engineId INTEGER,
        designId INTEGER,
        partStat INTEGER,
        unitValue REAL,
        Value REAL,
        PRIMARY KEY (engineId, designId, partStat)
      );
    `);

    queryDB(`
      INSERT INTO Custom_Engines_Stats_TEMP (engineId, designId, partStat, unitValue, Value)
      SELECT engineId, designId, partStat, unitValue, Value
      FROM Custom_Engines_Stats
      WHERE rowid IN (
        SELECT MAX(rowid) 
        FROM Custom_Engines_Stats
        GROUP BY engineId, designId, partStat
      );
    `);

    queryDB(`DROP TABLE Custom_Engines_Stats;`);

    queryDB(`ALTER TABLE Custom_Engines_Stats_TEMP RENAME TO Custom_Engines_Stats;`);

    console.log("Fixed Custom_Engines_Stats table.");

  }
}

export function insertDefualtEnginesData(list, stats, allocations, customSave, year) {
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
      queryDB(`INSERT OR REPLACE INTO Custom_Save_Config (key, value) VALUES ('${key}', '${newTeam}')`);
    }
  }


  if (list && stats) {
    engines.forEach(engine => {
      queryDB(`
        INSERT OR REPLACE INTO Custom_Engines_List (engineId, Name)
        VALUES (${engine.id}, '${engine.name}')
      `);

      engine.stats.forEach(stat => {
        queryDB(`
          INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
          VALUES (${engine.id}, ${stat.designId}, ${stat.partStat}, ${stat.value}, ${stat.unitValue})
        `);
      });
    });
  }

  if (allocations) {
    const maxYear = queryDB(`SELECT MAX(SeasonID) FROM Parts_TeamHistory`, 'singleValue');
    const actualEngineAllocations = queryDB(`
      SELECT th.TeamID, em.EngineDesignID
      FROM Parts_TeamHistory th
      JOIN Parts_Enum_EngineManufacturers em
        ON th.EngineManufacturer = em.Value
      WHERE SeasonID = ${maxYear}`,
      'allRows');


    actualEngineAllocations.forEach(engine => {
      queryDB(`
        INSERT OR REPLACE INTO Custom_Engine_Allocations (teamId, engineId)
        VALUES (${engine[0]}, ${engine[1]})
      `);
    });
  }


}

export function updateCustomEngines(engineData) {
  for (let engineId in engineData) {
    const nameCapitalized = engineData[engineId].name.charAt(0).toUpperCase() + engineData[engineId].name.slice(1);
    queryDB(`INSERT OR REPLACE INTO Custom_Engines_List (engineId, Name) VALUES (${engineId}, '${nameCapitalized}')`);
    for (let stat in engineData[engineId].stats) {
      const untiValue = engineData[engineId].stats[stat];
      const value = engine_unitValueToValue[stat](untiValue);
      if (parseInt(stat) !== 18 && parseInt(stat) !== 19) {
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (${engineId}, ${engineId}, ${stat}, ${value}, ${untiValue})`);
      }
      else if (parseInt(stat) === 18) {
        let designId = parseInt(engineId) + 1;
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (${engineId}, ${designId}, ${15}, ${value}, ${untiValue})`);
      }
      else if (parseInt(stat) === 19) {
        let designId = parseInt(engineId) + 2;
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (${engineId}, ${designId}, ${15}, ${value}, ${untiValue})`);
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
            VALUES (${engineId}, ${engineId}, ${stat}, ${value}, ${untiValue})`);
      }
      else if (parseInt(stat) === 18) {
        let designId = parseInt(engineId) + 1;
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (${engineId}, ${designId}, ${15}, ${value}, ${untiValue})`);
      }
      else if (parseInt(stat) === 19) {
        let designId = parseInt(engineId) + 2;
        queryDB(`INSERT OR REPLACE INTO Custom_Engines_Stats (engineId, designId, partStat, Value, unitValue)
            VALUES (${engineId}, ${designId}, ${15}, ${value}, ${untiValue})`);
      }
    }
    updateTeamsSuppliedByEngine(engineId, engineData[engineId]);

  }
}

export function check2025ModCompatibility(year_version) {
  const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
  const currentDay = daySeason[0];
  const currentSeason = daySeason[1];

  const minDay2024 = queryDB(`SELECT MIN(Day) FROM Races WHERE SeasonID = 2024`, 'singleValue');
  const firstRaceState2024 = queryDB(`SELECT State FROM Races WHERE Day = ${minDay2024} AND SeasonID = 2024`, 'singleValue');

  const maxDay2024 = queryDB(`SELECT MAX(Day) FROM Races WHERE SeasonID = 2024`, 'singleValue');
  const lastRaceState2024 = queryDB(`SELECT State FROM Races WHERE Day = ${maxDay2024} AND SeasonID = 2024`, 'singleValue');

  const minDay2025 = queryDB(`SELECT MIN(Day) FROM Races WHERE SeasonID = 2025`, 'singleValue');
  const firstRaceState2025 = queryDB(`SELECT State FROM Races WHERE Day = ${minDay2025} AND SeasonID = 2025`, 'singleValue');


  if (year_version !== "24") {
    return "NotCompatible";
  }

  const edited = queryDB(`SELECT * FROM Custom_2025_SeasonMod WHERE value = 1`, 'allRows');
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
  const teamsSupplied = queryDB(`SELECT teamID FROM Custom_Engine_Allocations WHERE engineId = ${engineId}`, 'allRows');
  teamsSupplied.forEach(team => {
    const teamEngineId = queryDB(`SELECT DesignID FROM Parts_Designs WHERE TeamID = ${team} AND PartType = 0`, 'singleValue');
    const teamERSId = queryDB(`SELECT DesignID FROM Parts_Designs WHERE TeamID = ${team} AND PartType = 1`, 'singleValue');
    const teamGearboxId = queryDB(`SELECT DesignID FROM Parts_Designs WHERE TeamID = ${team} AND PartType = 2`, 'singleValue');
    for (let stat in stats) {
      if (parseInt(stat) < 18) {
        const untiValue = stats[stat];
        const value = engine_unitValueToValue[stat](untiValue);
        queryDB(`UPDATE Parts_Designs_StatValues SET Value = ${value}, UnitValue = ${untiValue} WHERE DesignID = ${teamEngineId} AND PartStat = ${stat}`);
      }

    }
    const valueERS = engine_unitValueToValue[18](stats[18]);
    const unitValueERS = stats[18];
    const valueGearbox = engine_unitValueToValue[19](stats[19]);
    const unitValueGearbox = stats[19];
    queryDB(`UPDATE Parts_Designs_StatValues SET Value = ${valueERS}, UnitValue = ${unitValueERS} WHERE DesignID = ${teamERSId} AND PartStat = 15`);
    queryDB(`UPDATE Parts_Designs_StatValues SET Value = ${valueGearbox}, UnitValue = ${unitValueGearbox} WHERE DesignID = ${teamGearboxId} AND PartStat = 15`);
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
    VALUES ('alfa', '${alfaRomeo}')
  `);

  queryDB(`
    INSERT OR REPLACE INTO Custom_Save_Config (key, value)
    VALUES ('alphatauri', '${alphaTauri}')
  `);

  queryDB(`
    INSERT OR REPLACE INTO Custom_Save_Config (key, value)
    VALUES ('alpine', '${alpine}')
  `);

  queryDB(`
    INSERT OR REPLACE INTO Custom_Save_Config (key, value)
    VALUES ('primaryColor', '${primaryColor}')
  `);

  queryDB(`
    INSERT OR REPLACE INTO Custom_Save_Config (key, value)
    VALUES ('secondaryColor', '${secondaryColor}')
  `);

  queryDB(`
    INSERT OR REPLACE INTO Custom_Save_Config (key, value)
    VALUES ('difficulty', '${difficulty}')
  `);

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
  const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
  const currentDay = daySeason[0];
  const metadata = getMetadata()

  const metaProperty = metadata.gvasMeta.Properties.Properties
    .filter(p => p.Name === "MetaData")[0];

  queryDB(`UPDATE Player SET TeamID = ${teamID}`);
  queryDB(`UPDATE Staff_NarrativeData SET TeamID = ${teamID} WHERE GenSource = 0`);
  queryDB(`UPDATE Player_History SET EndDay = ${currentDay - 1} WHERE EndDay IS NULL`);
  queryDB(`DELETE FROM Player_History WHERE EndDay < StartDay`);
  queryDB(`INSERT INTO Player_History VALUES (${teamID}, ${currentDay}, NULL)`);
}


export function fetchCustomConfig() {
  const rows = queryDB(`SELECT key, value FROM Custom_Save_Config`, 'allRows') || [];
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
    `, 'singleValue') || 0;

  return playerTeam;
}

export function fetch2025ModData() {
  let tableExists = queryDB(`SELECT name FROM sqlite_master WHERE type='table' AND name='Custom_2025_SeasonMod'`, "singleRow");
  if (!tableExists) {
    queryDB(`CREATE TABLE Custom_2025_SeasonMod (key TEXT PRIMARY KEY, value TEXT)`);
    //insert change-regulations with value 0
    queryDB(`INSERT INTO Custom_2025_SeasonMod (key, value) VALUES ('time-travel', '0'), ('extra-drivers', '0'),
        ('change-line-ups', '0'), ('change-stats', '0'), ('change-calendar', '0'), ('change-regulations', '0'), ('change-cfd', '0'), ('change-performance', '0')`);
  }

  const rows = queryDB(`SELECT key, value FROM Custom_2025_SeasonMod`, 'allRows') || [];
  const config = {};

  rows.forEach(row => {
    const key = row[0];
    const value = row[1];
    config[key] = value;
  });

  return config;

}