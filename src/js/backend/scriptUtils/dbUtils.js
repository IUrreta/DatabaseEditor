import { countries_abreviations } from "./countries.js";
import { engine_unitValueToValue } from "./carConstants.js";
import { manageDifficultyTriggers, manageRefurbishTrigger, editFreezeMentality, fetchExistingTriggers } from "./triggerUtils.js";
import { getMetadata, queryDB } from "../dbManager.js";
import { getGlobals } from "../commandGlobals.js";
import { default_dict } from "../../frontend/config.js";
import { _standingsCache, rebuildStandingsUntil, rebuildStandingsUntilCached } from "./newsUtils.js";


/**
 * Converts an ARGB color integer to a hexadecimal string.
 * @param {number} argb - The ARGB color value.
 * @returns {string} The hexadecimal color string (e.g., "#RRGGBB").
 */
export function argbToHex(argb) {
  const rgb = argb & 0xFFFFFF; // Ignore alpha channel
  return `#${rgb.toString(16).padStart(6, '0').toUpperCase()}`;
}

/**
 * Retrieves the current date and season from the Player_State table.
 * @returns {Array} An array containing [Day, CurrentSeason].
 */
export function getDate() {
  const daySeason = queryDB(`
        SELECT Day, CurrentSeason
        FROM Player_State
    `, 'singleRow');

  return daySeason
}

/**
 * Checks the year of the save file and retrieves team colors if applicable.
 * @returns {Array} An array containing [year ("23" or "24"), TeamName, primaryColor, secondaryColor].
 */
export function checkYearSave() {
  // Check if Countries_RaceRecord table exists
  const row = queryDB(`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' AND name='Countries_RaceRecord'
    `, 'singleRow');

  if (!row) {
    // Table does not exist -> assume "23"
    return ["23", null, null, null];
  }

  // If exists, find TeamNameLocKey for TeamID=32
  const nameValue = queryDB(`
      SELECT TeamNameLocKey 
      FROM Teams 
      WHERE TeamID = 32
    `, 'singleValue');

  if (!nameValue) {
    // No value -> return "24" with no extra data
    return ["24", null, null, null];
  }

  // Extract name
  const match = nameValue.match(/\[STRING_LITERAL:Value=\|(.*?)\|\]/);
  let name = null, primaryColor = null, secondaryColor = null;

  if (match) {
    name = match[1];

    // Find colors
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

/**
 * Fetches the nationality of a driver.
 * @param {number} driverID - The ID of the driver.
 * @param {string} gameYear - The game year ("23" or "24").
 * @returns {string} The driver's nationality abbreviation.
 */
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

/**
 * Fetches the team ID for a driver's future contract.
 * @param {number} driverID - The ID of the driver.
 * @returns {number} The team ID or -1 if no future contract exists.
 */
export function fetchForFutureContract(driverID) {
  const teamID = queryDB(`
      SELECT TeamID 
      FROM Staff_Contracts 
      WHERE StaffID = ${driverID} 
        AND ContractType = 3
    `, 'singleValue');

  return teamID ?? -1;
}

/**
 * Fetches data for all engines, including stats and allocations.
 * @returns {Array} An array containing [enginesList, engineAllocations].
 */
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

    // Get stats values
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


    // Get ERS value
    const ersResult = queryDB(`
            SELECT UnitValue 
            FROM Custom_Engines_Stats 
            WHERE designId = ${newErsIds[i]} AND partStat = 15
        `, 'singleValue');
    if (ersResult !== null) {
      resultDict[18] = ersResult;
    }

    // Get gearbox value
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

    // Add engine info to list
    enginesList.push([newEngineIds[i], resultDict, engineName]);
  }

  const engineAllocations = queryDB(`
      SELECT * FROM Custom_Engine_Allocations
    `, 'allRows');

  return [enginesList, engineAllocations];
}


/**
 * Fetches mentality data for a staff member.
 * @param {number} staffID - The ID of the staff member.
 * @returns {Array} An array containing [morale (Array of arrays), globalMentality].
 */
export function fetchMentality(staffID) {
  // Get all rows (morale is an array of arrays [[opinion],[opinion], ...])
  const morale = queryDB(`
      SELECT Opinion
      FROM Staff_Mentality_AreaOpinions
      WHERE StaffID = ${staffID}
    `, 'allRows');

  // Get a single value
  const globalMentality = queryDB(`
      SELECT Mentality
      FROM Staff_State
      WHERE StaffID = ${staffID}
    `, 'singleValue');

  return [morale, globalMentality];
}

/**
 * Checks if a staff member drives for team 32 and updates their data if so.
 * @param {Array} staffData - The staff data array.
 * @returns {Array} The updated staff data array.
 */
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

/**
 * Removes trailing numbers from a string.
 * @param {string} str - The string to process.
 * @returns {string} The string without trailing numbers.
 */
export function removeNumber(str) {
  if (str && /\d$/.test(str)) {
    return str.slice(0, -1);
  }
  return str;
}

/**
 * Formats names and fetches statistics for drivers or staff.
 * @param {Array} nameData - Array containing name and basic info.
 * @param {string} type - The type of personnel ("driver", "staff1", etc.).
 * @returns {Array} An array containing formatted name, ID, team info, and stats.
 */
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

  // for drivers with minContractType != 0 (e.g. reserves)
  if (type === "driver" && nameData[5] !== 0) {
    teamId = 0;
    positionInTeam = 0;
  }

  let baseResult;
  if (type === "driver") {
    // [name, staffID, teamID, posInTeam, retired]
    baseResult = [formattedName, nameData[2], teamId, positionInTeam, nameData[6]];
  } else {
    // normal staff
    baseResult = [formattedName, nameData[2], teamId, positionInTeam];
  }

  // Search stats
  if (type === "driver") {
    const statsRows = queryDB(`
        SELECT Val
        FROM Staff_PerformanceStats
        WHERE StaffID = ${nameData[2]}
          AND StatID BETWEEN 2 AND 10
      `, 'allRows');

    let stats = statsRows;
    if (!stats || !stats.length) {
      // default 50 if no stats
      stats = Array(9).fill([50]);
    }

    const extraRow = queryDB(`
        SELECT Improvability, Aggression
        FROM Staff_DriverData
        WHERE StaffID = ${nameData[2]}
      `, 'singleRow');

    // Concatenate: baseResult + stats + extraRow
    // stats is array of arrays: [[val],[val],...]
    // map to keep stats[i][0]
    return baseResult.concat(
      stats.map(s => s[0]),
      extraRow ?? []
    );
  }

  // normal staff
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

  // If not matching cases, return baseResult
  return baseResult;
}

/**
 * Fetches retirement age and current age for a driver.
 * @param {number} driverID - The ID of the driver.
 * @returns {Array} An array containing [retirementAge, age].
 */
export function fetchDriverRetirement(driverID) {
  const playerRow = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');

  let day = 0, currentSeason = 0;
  if (playerRow) {
    [day, currentSeason] = playerRow;
  } else {
    console.warn("No data found in Player_State.");
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

/**
 * Fetches the driver code.
 * @param {number} driverID - The ID of the driver.
 * @returns {string} The driver code (e.g., "HAM").
 */
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

/**
 * Fetches the current season year.
 * @returns {number} The current season year.
 */
export function fetchYear() {
  const row = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');

  if (!row) {
    console.warn("No data found in Player_State.");
    return 0;
  }
  // Return CurrentSeason (row[1])
  return row[1];
}

/**
 * Fetches driver number details.
 * @param {number} driverID - The ID of the driver.
 * @returns {Array} An array containing [currentNumber, wantsChampion].
 */
export function fetchDriverNumberDetails(driverID) {
  let currentNumber = queryDB(`
      SELECT Number
      FROM Staff_DriverNumbers
      WHERE CurrentHolder = ${driverID}
    `, 'singleValue');

  if (currentNumber == null) {
    // If no number, check free ones
    const available = queryDB(`
        SELECT Number
        FROM Staff_DriverNumbers
        WHERE CurrentHolder IS NULL
      `, 'allRows');

    if (!available.length) {
      currentNumber = 0;
    } else {
      // Pick random
      const randomIdx = Math.floor(Math.random() * available.length);
      currentNumber = available[randomIdx][0];
    }
  }

  // Wants champion number?
  const wantsChampion = queryDB(`
      SELECT WantsChampionDriverNumber
      FROM Staff_DriverData
      WHERE StaffID = ${driverID}
    `, 'singleValue');

  return [currentNumber, wantsChampion];
}

/**
 * Fetches the race formula/category for a driver based on their team.
 * @param {number} driverID - The ID of the driver.
 * @returns {number} The category ID (1=F1, 2=F2, 3=F3, 4=Other).
 */
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

  // Default 4 if not exists
  return category ?? 4;
}

/**
 * Fetches driver marketability.
 * @param {number} driverID - The ID of the driver.
 * @returns {number} Marketability value.
 */
export function fetchMarketability(driverID) {
  return queryDB(`
      SELECT Marketability
      FROM Staff_DriverData
      WHERE StaffID = ${driverID}
    `, 'singleValue');
}

/**
 * Fetches superlicense status.
 * @param {number} driverID - The ID of the driver.
 * @returns {number} 1 if has superlicense, 0 otherwise.
 */
export function fetchSuperlicense(driverID) {
  return queryDB(`
      SELECT HasSuperLicense
      FROM Staff_DriverData
      WHERE StaffID = ${driverID}
    `, 'singleValue');
}

/**
 * Fetches all drivers for the given game year.
 * @param {string} gameYear - The game year ("23" or "24").
 * @returns {Array} An array of driver objects containing comprehensive driver data.
 */
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
    // If driver[7] > 1 => more than one contract
    if (driver[7] > 1) {
      driver = checkDrivesForTeam32(driver);
    }

    const driverID = driver[2];

    // Ignore placeholders
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

    // result is array, convert to object
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

    // Specific data for 2024
    if (gameYear === "24") {
      const [morale, gMentality] = fetchMentality(driverID);
      data.global_mentality = gMentality ?? null;

      // morale is array of arrays. Example: [ [op1], [op2], [op3] ]
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

/**
 * Fetches staff members for the given game year.
 * @param {string} gameYear - The game year ("23" or "24").
 * @returns {Array} An array of staff objects.
 */
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

/**
 * Fetches drivers participating in a specific season.
 * @param {number} year - The season year.
 * @returns {Array} List of formatted driver tuples [FormattedName, DriverID, TeamID].
 */
export function fetchDriversPerYear(year) {
  // Build SQL query
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

  // Get all rows
  const drivers = queryDB(sql, 'allRows') || [];

  // Format each row
  const formattedTuples = drivers.map(row => formatNamesSimple(row));

  return formattedTuples;
}

/**
 * Formats driver names simply.
 * @param {Array} name - Array containing [FirstName, LastName, DriverID, TeamID].
 * @returns {Array} Array containing [FormattedName, DriverID, TeamID].
 */
export function formatNamesSimple(name) {
  let nombre = "";
  let apellido = "";

  // If not "STRING_LITERAL", match "StaffName_Forename_(Male|Female)_(...)".
  if (!name[0].includes("STRING_LITERAL")) {
    const nombrePattern = /StaffName_Forename_(Male|Female)_(\w+)/;
    const match = name[0].match(nombrePattern);
    if (match) {
      // Assuming removeNumber helper exists
      nombre = removeNumber(match[2]);
    } else {
      nombre = "";
    }
  } else {
    // Otherwise, match part between "| ... |"
    const pattern = /\|([^|]+)\|/;
    const match = name[0].match(pattern);
    if (match) {
      nombre = match[1];
    } else {
      nombre = "";
    }
  }

  // Same logic for last name
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

  // Build full name
  const nameFormatted = `${nombre} ${apellido}`.trim();

  // TeamID (index 3). If null/undefined, set to 0
  const teamId = name[3] != null ? name[3] : 0;

  // Return structure: [FormattedName, DriverID, TeamID]
  return [nameFormatted, name[2], teamId];
}

/**
 * Gets all race IDs for a season.
 * @param {number} season - The season year.
 * @returns {Array<number>} Array of race IDs.
 */
function getSeasonRaceIds(season) {
  return (queryDB(`
    SELECT RaceID
    FROM Races
    WHERE SeasonID = ${season}
    ORDER BY RaceID ASC
  `, 'allRows') || []).map(r => Number(r[0]));
}

/**
 * Builds the team rank context for each race in a season.
 * @param {Array} seasonResults - The season results.
 * @param {Array} raceIds - List of race IDs.
 * @param {number} season - The season year.
 * @returns {Map} Map of raceID to team rank map.
 */
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

/**
 * Legacy build context function.
 * @param {Array} seasonResults - The season results.
 * @param {Array} raceIds - List of race IDs.
 * @param {number} season - The season year.
 * @returns {Map} Map of raceID to team rank map.
 */
export function buildPerRaceTeamRankContext_OLD(seasonResults, raceIds, season) {
  // raceId -> Map(teamId -> rank 1..10)
  const perRace = new Map();

  for (const raceId of raceIds) {
    // rebuild standings "until" that race
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

/**
 * Applies Driver of the Day flags to season results.
 * @param {Array} seasonResults - The season results array.
 * @param {Map} dodMap - Map of race ID to driver ID (winner).
 * @returns {Array} Enriched season results.
 */
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

/**
 * Gets a map of Driver of the Day winners for a season.
 * @param {number} season - The season year.
 * @returns {Map} Map of race ID to driver ID.
 */
export function getDotDWinnersMap(season) {
  const rows = queryDB(`
    SELECT RaceID, DriverID
    FROM Custom_DriverOfTheDay_Ranking
    WHERE Season = ${season} AND Rank = 1
  `, 'allRows') || [];

  const m = new Map();
  for (const [raceId, driverId] of rows) {
    m.set(Number(raceId), Number(driverId));
  }
  return m;
}

/**
 * Computes Driver of the Day for the entire season.
 * @param {Array} seasonResults - The season results.
 * @param {number} season - The season year.
 * @returns {Array} Season results enriched with DoD data.
 */
function computeSeasonDriverOfTheDay(seasonResults, season) {
  ensureCustomDoDRankingTable();

  // A) context per race
  const raceIds = getSeasonRaceIds(season).map(Number);
  const perRaceTeamRank = buildPerRaceTeamRankContext(seasonResults, raceIds, season);

  // B) winners already cached (Rank=1)
  const winnersMap = getDotDWinnersMap(season); // Map<raceId, driverId>

  // C) missing races
  const missing = raceIds.filter(rid => !winnersMap.has(rid));
  if (missing.length > 0) {
    // Fetch only needed
    const rows = queryDB(`
      SELECT RaceID, DriverID, TeamID, StartingPos, FinishingPos, DNF, Time, Laps
      FROM Races_Results
      WHERE Season = ${season}
        AND RaceID IN (${missing.join(',')})
    `, 'allRows') || [];

    // Group by race
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

    // Compute leaderboard and save top-3
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

  // D) apply flags
  const dodMap = winnersMap; // Map<raceId, driverId>
  const enriched = applyDoDFlagsToSeasonResults(seasonResults, dodMap);
  enriched._driverOfTheDayMap = dodMap;
  return enriched;
}

/**
 * Fetches comprehensive season results for all drivers.
 * @param {number} yearSelected - The year to fetch.
 * @param {boolean} [isCurrentYear=true] - Whether it is the current year.
 * @param {boolean} [fetchDriverOfTheDay=false] - Whether to fetch DoD data.
 * @returns {Array} Array of season results for each driver.
 */
export function fetchSeasonResults(
  yearSelected,
  isCurrentYear = true,
  fetchDriverOfTheDay = false
) {
  const drivers = queryDB(`
      SELECT DriverID
      FROM Races_DriverStandings
      WHERE RaceFormula = 1
        AND SeasonID = ${yearSelected}
    `, 'allRows') || [];

  const seasonResults = [];
  for (const row of drivers) {
    const driverID = row[0];
    const driverRes = fetchOneDriverSeasonResults([driverID], [yearSelected], isCurrentYear);
    if (driverRes) seasonResults.push(driverRes);
  }

  if (!fetchDriverOfTheDay) {
    return seasonResults;
  }

  const resultsWithDoD = computeSeasonDriverOfTheDay(seasonResults, yearSelected);


  return resultsWithDoD;
}

/**
 * Fetches qualifying results for the season.
 * @param {number} yearSelected - The year to fetch.
 * @returns {Array} Array of qualifying results.
 */
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

/**
 * Fetches team standings for the season.
 * @param {number} year - The season year.
 * @returns {Array} Array of team standings.
 */
export function fetchTeamsStandings(year) {
  return queryDB(`
      SELECT TeamID, Position
      FROM Races_TeamStandings
      WHERE SeasonID = ${year}
        AND RaceFormula = 1
    `, 'allRows') || [];
}

/**
 * Fetches points regulations and scheme.
 * @returns {Object} Object containing points scheme details.
 */
export function fetchPointsRegulations() {
  const pointScheme = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 7`, 'singleValue');
  const twoBiggestPoints = queryDB(`SELECT Points FROM Regulations_NonTechnical_PointSchemes WHERE (PointScheme = ${pointScheme}) AND (RacePos = 1 OR RacePos = 2); `, 'allRows');
  const isLastraceDouble = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 8`, 'singleValue');
  const fastestLapBonusPoint = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 9`, 'singleValue');
  const poleBonusPoint = queryDB(`SELECT CurrentValue FROM Regulations_Enum_Changes WHERE ChangeID = 10`, 'singleValue');
  const positionAndPointsRows = queryDB(`SELECT RacePos, Points FROM Regulations_NonTechnical_PointSchemes WHERE PointScheme = ${pointScheme}`, 'allRows');
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

/**
 * Fetches season results for a specific team.
 * @param {number} team - Team ID.
 * @param {number} year - Season year.
 * @returns {Array} Array of driver results for that team.
 */
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

/**
 * Fetches season results for a specific driver.
 * @param {number} driver - Driver ID.
 * @param {number} year - Season year.
 * @param {boolean} [isCurrentYear=true] - Whether it's the current year.
 * @returns {Object|null} Driver season results object or null.
 */
export function fetchOneDriverSeasonResults(driver, year, isCurrentYear = true) {
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
      sprintResults,
      isCurrentYear
    );
  }

  return null;
}


/**
 * Computes Driver of the Day from result rows (wrapper).
 * @param {Array} rows - Race result rows.
 * @param {number} raceId - Race ID.
 * @param {Object} opts - Options.
 * @returns {number|null} Driver ID of the winner.
 */
export function computeDriverOfTheDayFromRows(rows, raceId, opts = {}) {
  // const lb = computeDriverOfTheDayLeaderboardFromRows(rows, raceId, opts); //debug
  // console.table(lb.slice(0, 10));
  // return lb[0]?.driverId || null;
  const dodId = computeDriverOfTheDayFromRows_fast(rows, raceId, opts);
  return dodId;
}

/**
 * Fast computation of Driver of the Day from rows.
 * @param {Array} rows - Race result rows.
 * @param {number} raceId - Race ID.
 * @param {Object} opts - Options including team rank context.
 * @returns {number|null} Driver ID of the winner.
 */
export function computeDriverOfTheDayFromRows_fast(rows, raceId, opts = {}) {
  if (!rows || !rows.length) return null;

  // --- internal constants ---
  const TEAM_WEIGHT = 0.4;
  const TEAM_BONUS_CAP = 4;
  const RANDOM_INTENSITY = 0.8; // ±0.4
  const dominancePerGap = 1;   // +1 point per gap block
  const dominanceBlock = 4;   // every 4s -> 1 point
  const dominanceMax = 10;

  // team ranking
  const teamRankByTeamId = (opts.teamRankByTeamId instanceof Map) ? opts.teamRankByTeamId : new Map();

  // winner dominance bonus (P1 vs P2 in same lap)
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

  // fixed posScore
  const posScore = (finishingPos) => {
    if (finishingPos === 1) return 4;
    if (finishingPos === 2) return 2;
    if (finishingPos === 3) return 1;
    if (finishingPos > 13) return -10;
    if (finishingPos > 10) return -7;
    if (finishingPos > 8) return -2;
    return 0;
  };

  // valid grid for expectedPos per team
  const validRows = rows.filter(r => Number(r[7]) !== 1 && Number(r[5]) > 0 && Number(r[4]) > 0 && Number(r[4]) !== 99);
  const gridSize = validRows.length;
  const gridFactor = gridSize > 0 ? (gridSize / 20) : 1;

  const teamBonus = (teamRank, finishingPos) => {
    if (!Number.isFinite(teamRank) || !Number.isFinite(finishingPos)) return 0;
    const expectedPos = (2 * teamRank - 0.5) * gridFactor; // 2 cars per team
    const delta = expectedPos - finishingPos; // + if performing better than expected
    let bonus = delta * TEAM_WEIGHT;
    if (bonus > TEAM_BONUS_CAP) bonus = TEAM_BONUS_CAP;
    if (bonus < -TEAM_BONUS_CAP) bonus = -TEAM_BONUS_CAP;
    return bonus;
  };

  // winner in single pass (no arrays nor sort)
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

    // tie-break by best finishing position
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

/**
 * Computes Driver of the Day leaderboard from rows.
 * @param {Array} rows - Race result rows.
 * @param {number} raceId - Race ID.
 * @param {Object} opts - Options.
 * @returns {Array} Leaderboard array sorted by score.
 */
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
    if (finishingPos > 8)  return -2;
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
      if (bonus >  TEAM_BONUS_CAP) bonus =  TEAM_BONUS_CAP;
      if (bonus < -TEAM_BONUS_CAP) bonus = -TEAM_BONUS_CAP;
    }
    return bonus;
  };

  const rand = seededRandom(raceId);
  const RANDOM_INTENSITY = 0.8;

  const rowsScored = [];
  for (const row of rows) {
    const driverId    = Number(row[2]);
    const teamId      = Number(row[3]);
    const finishingPos= Number(row[4]);
    const startingPos = Number(row[5]);
    const dnf         = Number(row[7]) === 1;

    if (dnf || startingPos <= 0 || finishingPos <= 0 || finishingPos === 99) continue;

    const gain = startingPos - finishingPos;
    const ps   = posScore(finishingPos);
    const tr   = Number(teamRankByTeamId.get(teamId));
    const tb   = Number.isFinite(tr) ? teamBonus(tr, finishingPos) : 0;

    const dominanceBonus = (finishingPos === 1) ? p1GapBonus : 0;
    const poleBonus      = (startingPos === 1) ? 1.0 : 0.0;

    const randomOffset   = (rand() - 0.5) * RANDOM_INTENSITY;
    const scoreRaw       = gain + ps + tb + dominanceBonus + randomOffset + poleBonus;

    const name = getNameByIdAndFormat(driverId);
    rowsScored.push({
      driverId,
      name: name[0],
      scoreRaw,             // <-- keep raw for debug
      finishPos: finishingPos,
      startPos:  startingPos,
      teamId,
      components: { gain, posScore: ps, teamBonus: tb, dominanceBonus, poleBonus, randomOffset }
    });
  }

  // Softmax -> percentages summing to 100
  const shares = softmaxToPercent(rowsScored.map(r => r.scoreRaw), /*temperature*/ 1.0);
  for (let i = 0; i < rowsScored.length; i++) {
    rowsScored[i].share = Math.round(shares[i] * 10) / 10; // e.g., 1 decimal
  }

  // Sort: higher share (equivalent to higher scoreRaw)
  rowsScored.sort((a, b) =>
    (b.share - a.share) || (a.finishPos - b.finishPos)
  );

  return rowsScored;
}

/**
 * Converts array of values to percentages using Softmax.
 * @param {Array<number>} values - Input values.
 * @param {number} temperature - Softmax temperature.
 * @returns {Array<number>} Percentages.
 */
function softmaxToPercent(values, temperature = 1.0) {
  // numerical stability
  const maxV = Math.max(...values);
  const exps = values.map(v => Math.exp((v - maxV) / temperature));
  const sum  = exps.reduce((a,b)=>a+b, 0);
  return exps.map(x => (x / sum) * 100);
}

/**
 * Inserts or updates the Driver of the Day ranking in the database.
 * @param {number} season - Season year.
 * @param {number} raceId - Race ID.
 * @param {Array} leaderboard - Ranked driver list.
 * @param {number} [topN=3] - Number of top drivers to store.
 */
export function upsertDoDRanking(season, raceId, leaderboard, topN = 3) {
  const top = leaderboard.slice(0, topN);
  for (let i = 0; i < top.length; i++) {
    const { driverId, share, name, teamId } = top[i]; // using share (%)
    const rank = i + 1;
    queryDB(`
      INSERT INTO Custom_DriverOfTheDay_Ranking (Season, RaceID, Rank, DriverID, Name, TeamID, Score)
      VALUES (${season}, ${raceId}, ${rank}, ${driverId}, '${name}', ${teamId}, ${Number(share)})
      ON CONFLICT(Season, RaceID, Rank) DO UPDATE
      SET DriverID = excluded.DriverID, Score = excluded.Score
    `, 'allRows');
  }
}

/**
 * Gets the top N Driver of the Day rankings for a race.
 * @param {number} season - Season year.
 * @param {number} raceId - Race ID.
 * @param {number} [topN=3] - Number of results to return.
 * @returns {Array} List of ranking objects.
 */
export function getDoDTopNForRace(season, raceId, topN = 3) {
  const rows = queryDB(`
    SELECT DriverID, Rank, Name, Score, TeamID
    FROM Custom_DriverOfTheDay_Ranking
    WHERE Season = ${season} AND RaceID = ${raceId}
    ORDER BY Rank ASC
    LIMIT ${topN}
  `, 'allRows') || [];

  return rows.map(([driverId, rank, name, share, teamId]) => ({
    driverId: Number(driverId),
    rank: Number(rank),
    name,
    share: Number(share),
    teamId: Number(teamId)
  }));
}

/**
 * Ensures the Custom_DriverOfTheDay_Ranking table exists.
 */
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
  `, 'allRows');

}

/**
 * Creates a seeded random number generator.
 * @param {number} seed - Seed value.
 * @returns {Function} Random number generator function.
 */
function seededRandom(seed) {
  // xmur3 + mulberry32 style
  let t = (seed + 0x6D2B79F5) | 0;
  return function () {
    t ^= t << 13; t ^= t >>> 17; t ^= t << 5;
    return ((t < 0 ? ~t + 1 : t) % 4294967296) / 4294967296;
  };
}

/**
 * Gets and formats a driver name by ID.
 * @param {number} driverID - Driver ID.
 * @returns {Array} Formatted name array.
 */
function getNameByIdAndFormat(driverID) {
  const driverNameRow = queryDB(`
      SELECT FirstName, LastName, StaffID
      FROM Staff_BasicData
      WHERE StaffID = ${driverID}
    `, 'singleRow');

  const name = formatNamesSimple(driverNameRow);
  return name;
}


/**
 * Fetches qualifying results for a single driver.
 * @param {number} driver - Driver ID.
 * @param {number} year - Season year.
 * @returns {Object|null} Driver qualifying results object or null.
 */
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
      [],
      true
    );
  }

  return null;
}


/**
 * Fetches IDs of races completed so far in the season.
 * @param {number} year - Season year.
 * @returns {Array} List of completed race IDs.
 */
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

/**
 * Fetches IDs of races completed before a specific day.
 * @param {number} year - Season year.
 * @param {number} day - The day threshold.
 * @returns {Array} List of race IDs.
 */
export function fetchEventsDoneBefore(year, day) {
  const daySeasonRow = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');

  if (!daySeasonRow) {
    return [];
  }

  const seasonIdsRows = queryDB(`
      SELECT RaceID
      FROM Races
      WHERE SeasonID = ${year}
        AND Day < ${day}
    `, 'allRows') || [];


  const eventsIds = seasonIdsRows.map(row => row[0]);

  return eventsIds;
}

/**
 * Fetches all race events for a season.
 * @param {number} year - Season year.
 * @returns {Array} List of race event arrays [RaceID, TrackID, WeekendType].
 */
export function fetchEventsFrom(year) {
  const seasonEventsRows = queryDB(`
      SELECT RaceID, TrackID, WeekendType
      FROM Races
      WHERE SeasonID = ${year}
    `, 'allRows') || [];

  return seasonEventsRows; // Already an array of arrays [RaceID, TrackID]
}



/**
 * Formats season results for a driver.
 * @param {Array} results - Raw results from DB.
 * @param {Array} driverName - Driver name data.
 * @param {number} teamID - Team ID.
 * @param {number} driver - Driver ID.
 * @param {number} year - Season year.
 * @param {Array} sprints - Sprint results.
 * @param {boolean} [isCurrentYear=true] - Whether it's the current year.
 * @returns {Object} Formatted driver results object.
 */
export function formatSeasonResults(
  results,
  driverName,
  teamID,
  driver,
  year,
  sprints,
  isCurrentYear = true
) {
  const driverID = driver;
  const season = year;

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
  const nameFormatted = `${nombre} ${apellido}`.trim();

  // ---- driver races ----
  const racesParticipated =
    queryDB(`
      SELECT RaceID
      FROM Races_Results
      WHERE DriverID = ${driverID}
        AND Season = ${season}
    `, "allRows") || [];

  const raceObjects = [];
  const formattedBasics = results.map(r => ({
    finishingPos: r[2],
    points: r[3]
  }));

  for (let i = 0; i < racesParticipated.length; i++) {
    const raceID = racesParticipated[i][0];

    // Get full race results to calculate gaps/startingPos in one query
    const raceResults =
      queryDB(`
        SELECT DriverID, FinishingPos, Points, Time, StartingPos, DNF
        FROM Races_Results
        WHERE Season = ${season}
          AND RaceID = ${raceID}
      `, "allRows") || [];

    // driver specific info
    const myRow = raceResults.find(r => Number(r[0]) === Number(driverID));
    const myDNF = myRow ? (Number(myRow[5]) === 1) : 0;
    const myStartingPos = myRow ? (myRow[4] ?? 99) : 99;

    // fastest lap
    const driverWithFastestLap = queryDB(`
        SELECT DriverID
        FROM Races_Results
        WHERE FastestLap > 0
          AND RaceID = ${raceID}
          AND Season = ${season}
        ORDER BY FastestLap
        LIMIT 1
      `, "singleValue");

    // base object
    const base = {
      raceId: raceID,
      finishingPos: formattedBasics[i]?.finishingPos ?? 99,
      points: myDNF ? -1 : formattedBasics[i]?.points ?? 0,
      dnf: myDNF,
      fastestLap: parseInt(driverWithFastestLap) === parseInt(driverID),
      qualifyingPos: 99,
      gapToWinner: null,
      gapToPole: null,
      // NEW FIELDS:
      startingPos: myStartingPos,
      gapAhead: null,
      gapBehind: null,
      // sprint/team
      sprintPoints: 0,
      sprintPos: null,
      teamId: 0,
      driverOfTheDay: false
    };

    if (base.dnf) {
      base.finishingPos = -1;
      base.points = -1;
    }

    // Quali / grid
    let QRes;
    if (isCurrentYear) {
      const QStage =
        queryDB(`
          SELECT MAX(QualifyingStage)
          FROM Races_QualifyingResults
          WHERE RaceFormula = 1
            AND RaceID = ${raceID}
            AND SeasonID = ${season}
            AND DriverID = ${driverID}
        `, "singleValue") || 0;

      QRes =
        queryDB(`
          SELECT FinishingPos
          FROM Races_QualifyingResults
          WHERE RaceFormula = 1
            AND RaceID = ${raceID}
            AND SeasonID = ${season}
            AND DriverID = ${driverID}
            AND QualifyingStage = ${QStage}
        `, "singleValue") || 99;
    } else {
      QRes =
        queryDB(`
          SELECT StartingPos
          FROM Races_Results
          WHERE RaceID = ${raceID}
            AND DriverID = ${driverID}
        `, "singleValue") || 99;
    }
    base.qualifyingPos = QRes;

    // General gaps
    base.gapToWinner = calculateTimeDifference(driverID, raceID);
    base.gapToPole = calculateTimeToPole(driverID, raceID);

    // --- NEW: calculate gapAhead / gapBehind with all classified ---
    if (!base.dnf && raceResults.length > 0) {
      // classified with interpretable time
      const classified = raceResults
        .filter(r => Number(r[1]) > 0) // FinishingPos > 0
        .sort((a, b) => Number(a[1]) - Number(b[1])); // by position

      const idx = classified.findIndex(r => Number(r[0]) === Number(driverID));
      if (idx !== -1) {
        const myTime = toSeconds(classified[idx][3]); // Time
        // ahead
        if (idx > 0) {
          const aheadTime = toSeconds(classified[idx - 1][3]);
          if (myTime != null && aheadTime != null) {
            base.gapAhead = formatGap(myTime - aheadTime);
          }
        }
        // behind
        if (idx < classified.length - 1) {
          const behindTime = toSeconds(classified[idx + 1][3]);
          if (myTime != null && behindTime != null) {
            base.gapBehind = formatGap(behindTime - myTime);
          }
        }
      }
    }

    // gaps ready
    // team per race
    const teamInRace =
      queryDB(`
        SELECT TeamID
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND DriverID = ${driverID}
      `, "singleValue") || 0;

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

  // latest team / championship pos
  const latestTeamId =
    raceObjects.length ? raceObjects[raceObjects.length - 1].teamId : teamID;

  const championshipPosition =
    queryDB(`
      SELECT Position
      FROM Races_Driverstandings
      WHERE RaceFormula = 1
        AND SeasonID = ${season}
        AND DriverID = ${driverID}
    `, "singleValue") || 0;

  const payload = {
    driverName: nameFormatted,
    latestTeamId,
    driverId: driverID[0] || driverID,
    championshipPosition,
    races: raceObjects
  };

  return payload;
}



/**
 * Calculates the time difference to the pole position.
 * @param {number} driverID - Driver ID.
 * @param {number} raceID - Race ID.
 * @returns {string} Formatted gap time (e.g., "+0.15s") or "NR".
 */
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

/**
 * Calculates the time difference to the winner.
 * @param {number} driverID - Driver ID.
 * @param {number} raceID - Race ID.
 * @returns {string} Formatted gap time (e.g., "+10.5s" or "+1 L").
 */
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





/**
 * Fetches the race calendar.
 * @returns {Array} List of race objects.
 */
export function fetchCalendar() {
  // Get [ Day, CurrentSeason ] from Player_State
  const daySeason = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');

  if (!daySeason) {
    console.warn("No data found in Player_State.");
    return [];
  }

  const [day, currentSeason] = daySeason;

  // Get calendar
  const calendar = queryDB(`
      SELECT TrackID, WeatherStatePractice, WeatherStateQualifying, WeatherStateRace, WeekendType, State
      FROM Races
      WHERE SeasonID = ${currentSeason}
    `, 'allRows');

  return calendar;
}

/**
 * Fetches all driver numbers currently in use.
 * @returns {Array<number>} List of driver numbers.
 */
export function fetchDriverNumbers() {
  const numbers = queryDB(`SELECT DISTINCT Number
       FROM Staff_DriverNumbers dn 
        `, 'allRows');

  return numbers.map(n => n[0]);
}

/**
 * Fetches contract details for a driver.
 * @param {number} id - Driver ID.
 * @returns {Array} Array containing [currentContract, futureContract, currentSeason].
 */
export function fetchDriverContract(id) {
  // Get current contract
  const currentContract = queryDB(`
        SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos, TeamID
        FROM Staff_Contracts
        WHERE ContractType = 0 AND StaffID = ${id}
    `, 'singleRow');

  // Get future contract
  const futureContract = queryDB(`
        SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos, PosInTeam, TeamID
        FROM Staff_Contracts
        WHERE ContractType = 3 AND StaffID = ${id}
    `, 'singleRow');

  // Get current day and season
  const daySeason = queryDB(`
        SELECT Day, CurrentSeason
        FROM Player_State
    `, 'singleRow');

  // Return results
  return [currentContract, futureContract, daySeason ? daySeason[1] : null];
}

/**
 * Checks and initializes custom tables for engines and config.
 * @param {string} year - Current game year.
 */
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

/**
 * Fixes the Custom_Engines_Stats table by ensuring it has a primary key.
 * Used for migrating older DB versions.
 */
export function fixCustomEnginesStatsTable() {
  // Check if table has PRIMARY KEY
  const hasPrimaryKey = queryDB(`
    PRAGMA table_info(Custom_Engines_Stats);
  `);

  let primaryKeyExists = hasPrimaryKey.some(
    (column) => column.pk > 0 // Checks if any column is part of primary key
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


  }
}

/**
 * Inserts default engine data into custom tables.
 * @param {boolean} list - Whether to insert into list table.
 * @param {boolean} stats - Whether to insert into stats table.
 * @param {boolean} allocations - Whether to insert allocations.
 * @param {boolean} customSave - Whether to insert custom save config.
 * @param {string} year - The current year ("23" or "24").
 */
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

/**
 * Updates custom engines data in the DB.
 * @param {Object} engineData - Dictionary of engine data to update.
 */
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

/**
 * Edits custom engines based on input data.
 * @param {Object} engineData - Dictionary of engine data.
 */
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

/**
 * Checks compatibility for the 2025 mod.
 * @param {string} year_version - The current game year version.
 * @returns {string} Compatibility status string.
 */
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


/**
 * Updates stats for all teams supplied by a specific engine.
 * @param {number} engineId - The engine ID.
 * @param {Object} stats - The new engine stats.
 */
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

/**
 * Updates the custom configuration settings.
 * @param {Object} data - Configuration data to update.
 */
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

/**
 * Updates the player's team in the database.
 * @param {number} teamID - The new team ID for the player.
 */
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


/**
 * Fetches the custom configuration from the database.
 * @returns {Object} Custom configuration object.
 */
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

/**
 * Fetches the player's current team ID.
 * @returns {number} Player's team ID.
 */
function fetchPlayerTeam() {
  const playerTeam = queryDB(`
      SELECT TeamID
      FROM Player
    `, 'singleValue') || 0;

  return playerTeam;
}

/**
 * Fetches data for the 2025 season mod.
 * @returns {Object} Mod configuration dictionary.
 */
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
