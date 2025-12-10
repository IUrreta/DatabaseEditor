import * as carConstants from './carConstants.js';
import { queryDB } from '../dbManager.js';



/**
 * Returns the best parts for each team.
 * @param {boolean} customTeam - If true, includes team 32 (custom team) in addition to 1..10.
 * @returns {Object} A dictionary where keys are team IDs and values are the parts from `getPartsFromTeam`.
 */
export function getBestParts(customTeam = false) {
    const teams = {};
    // Create team list
    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32) // 1..10 and 32
        : [...Array(10).keys()].map(i => i + 1);          // 1..10

    for (const teamId of teamList) {
        teams[teamId] = getPartsFromTeam(teamId);
    }
    return teams;
}

/**
 * Gets ALL parts (multiple designs) from a team.
 * @param {number} teamId - The ID of the team.
 * @returns {Object} A dictionary where keys are part types (e.g., 'Front Wing') and values are arrays of design details.
 */
export function getAllPartsFromTeam(teamId) {
    // Get Day and Season
    const [day, currentSeason] = queryDB(
        "SELECT Day, CurrentSeason FROM Player_State",
        "singleRow"
    ) || [0, 0];


    const partsDict = {};

    // In Python, PartType went from 3..8
    for (let j = 3; j < 9; j++) {
        const sql = `
          SELECT 
            d.DesignID,
            d.DayCreated,
            d.DayCompleted, 
            (
              SELECT r.TrackID 
              FROM Races r 
              WHERE r.Day >= d.DayCompleted 
              ORDER BY r.Day ASC 
              LIMIT 1
            ) AS TrackID
          FROM Parts_Designs d
          WHERE 
            d.PartType = ${j}
            AND d.TeamID = ${teamId}
            AND d.ValidFrom = ${currentSeason}
            AND d.DayCompleted > 0
        `;
        let designs = queryDB(sql, "allRows");

        // For each design, add extra info: equipped_1, equipped_2, n_parts
        designs = designs.map(designRow => {
            // designRow => [ DesignID, DayCreated, DayCompleted, TrackID ]
            const [designID, dayCreated, dayCompleted, trackID] = designRow;

            // Check if equipped in loadout 1
            const equipped1 = queryDB(`
            SELECT DesignID
            FROM Parts_CarLoadout
            WHERE TeamID = ${teamId} 
              AND PartType = ${j} 
              AND LoadoutID = 1
          `, "singleValue");
            let eq1 = (equipped1 === designID) ? 1 : 0;

            // Check if equipped in loadout 2
            const equipped2 = queryDB(`
            SELECT DesignID
            FROM Parts_CarLoadout
            WHERE TeamID = ${teamId} 
              AND PartType = ${j} 
              AND LoadoutID = 2
          `, "singleValue");
            let eq2 = (equipped2 === designID) ? 1 : 0;

            // Number of parts (items) built
            const nParts = queryDB(`
            SELECT COUNT(*)
            FROM Parts_Items
            WHERE DesignID = ${designID}
              AND BuildWork = ${carConstants.standardBuildworkPerPart[j]}
          `, "singleValue") || 0;

            // Return new array with all info
            return [
                designID,      // 0
                dayCreated,    // 1
                dayCompleted,  // 2
                trackID,       // 3
                eq1,           // 4
                eq2,           // 5
                nParts         // 6
            ];
        });

        // Assign to partsDict[ parts[j] ] = designs
        // Assuming 'parts[j]' exists. Adjust if different
        partsDict[carConstants.parts[j]] = designs;
    }

    return partsDict;
}

/**
 * Gets the "best" parts (MAX(DesignID)) for a team in the current season.
 * @param {number} teamId - The ID of the team.
 * @returns {Object} A dictionary where keys are part types (0 for engine, 3-8 for others) and values are design rows.
 */
export function getPartsFromTeam(teamId) {
    // Day, Season
    const [day, season] = queryDB(
        "SELECT Day, CurrentSeason FROM Player_State",
        "singleRow"
    ) || [0, 0];

    const designs = {};
    // In Python, j goes from 3..8 => engine = 0
    for (let j = 3; j < 9; j++) {
        const row = queryDB(`
          SELECT MAX(DesignID)
          FROM Parts_Designs
          WHERE PartType = ${j}
            AND TeamID = ${teamId}
            AND ValidFrom = ${season}
            AND (DayCompleted > 0 OR DayCreated < 0)
        `, "allRows");
        designs[j] = row;
    }

    // engine:
    const engine = queryDB(`
        SELECT MAX(DesignID)
        FROM Parts_Designs
        WHERE PartType = 0
          AND TeamID = ${teamId}
      `, "allRows");
    designs[0] = engine;

    return designs;
}

/**
 * Gets the best parts created up to a specific day.
 * @param {number} day - The day to check up to.
 * @param {boolean} customTeam - If true, includes the custom team.
 * @returns {Object} A dictionary of teams and their best parts.
 */
export function getBestPartsUntil(day, customTeam = false) {
    // Day, season
    const [dayCur, season] = queryDB(`
        SELECT Day, CurrentSeason 
        FROM Player_State
      `, "singleRow") || [0, 0];

    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32)
        : [...Array(10).keys()].map(i => i + 1);

    const teams = {};
    for (const t of teamList) {
        const designs = {};
        for (let j = 3; j < 9; j++) {
            const row = queryDB(`
            SELECT MAX(DesignID)
            FROM Parts_Designs
            WHERE PartType = ${j}
              AND TeamID = ${t}
              AND ValidFrom = ${season}
              AND ((DayCompleted > 0 AND DayCompleted <= ${day}) OR DayCreated < 0)
          `, "allRows");
            designs[j] = row;
        }
        // engine
        const engine = queryDB(`
          SELECT MAX(DesignID)
          FROM Parts_Designs
          WHERE PartType = 0
            AND TeamID = ${t}
        `, "allRows");
        designs[0] = engine;

        teams[t] = designs;
    }
    return teams;
}

/**
 * Returns a dictionary with stat values (PartStat -> Value) for each part (partType).
 * @param {Object} designDict - A dictionary of parts and their design info.
 * @returns {Object} A dictionary of stat values for each part.
 */
export function getCarStats(designDict) {
    const statsValues = {};
    for (const part in designDict) {

        const designInfo = designDict[part][0];
        const designID = (designInfo && designInfo.length) ? designInfo[0] : null;

        if (designID !== null) {
            const rows = queryDB(`
            SELECT PartStat, Value
            FROM Parts_Designs_StatValues
            WHERE DesignID = ${designID}
          `, "allRows");
            // rows => [ [PartStat, Value], [PartStat, Value], ... ]
            const tmp = {};
            for (const [stat, val] of rows) {
                tmp[stat] = Math.round(val * 1000) / 1000; // round to 3 decimals
            }
            statsValues[part] = tmp;
        } else {
            const zeroStats = {};
            for (const stat of carConstants.defaultPartsStats[part]) {
                zeroStats[stat] = 0;
            }
            statsValues[part] = zeroStats;
        }
    }
    return statsValues;
}

/**
 * Gets tyre degradation stats (stats 2) for parts 4 and 8.
 * @param {Object} designDict - Dictionary of parts designs.
 * @returns {Object} Dictionary with tyre degradation stats.
 */
export function getTyreDegStats(designDict) {
    const statsValues = {};
    //only part 4 and 8
    const tyreDegDict = {4: designDict[4], 8: designDict[8]};
    for (const part in tyreDegDict) {
        const designInfo = tyreDegDict[part][0];
        const designID = (designInfo && designInfo.length) ? designInfo[0] : null;

        if (designID !== null) {
            const rows = queryDB(`
            SELECT PartStat, Value
            FROM Parts_Designs_StatValues
            WHERE DesignID = ${designID}
          `, "allRows");
            // rows => [ [PartStat, Value], [PartStat, Value], ... ]
            const tmp = {};
            for (const [stat, val] of rows) {
                tmp[stat] = Math.round(val * 1000) / 1000; // round to 3 decimals
            }
            statsValues[part] = tmp;
        } else {
            const zeroStats = {};
            for (const stat of carConstants.defaultPartsStats[part]) {
                zeroStats[stat] = 0;
            }
            statsValues[part] = zeroStats;
        }
    }
    return statsValues;
}

/**
 * Updates tyre degradation stats for a receiver team based on a giver team's design.
 * @param {Object} designDictTeamReceiver - Design dictionary for the receiving team.
 * @param {Object} designDictTeamGiver - Design dictionary for the giving team.
 * @param {number} teamReceiver - ID of the receiving team.
 * @param {number} teamGiver - ID of the giving team.
 */
export function updateTyreDegStats(designDictTeamReceiver, designDictTeamGiver, teamReceiver, teamGiver) {
    //only part 4 and 8
    const reducedDesignDictTeamReceiver = {4: designDictTeamReceiver[4][0][0], 8: designDictTeamReceiver[8][0][0]};
    for (const part in reducedDesignDictTeamReceiver){
        let designID = reducedDesignDictTeamReceiver[part];
        let newTyreDegStat = designDictTeamGiver[part][2];
        queryDB(`
            UPDATE Parts_Designs_StatValues
            SET Value = ${newTyreDegStat}
            WHERE DesignID = ${designID} AND PartStat = 2
        `);

        queryDB(`UPDATE Parts_TeamExpertise
            SET Expertise = ${newTyreDegStat}
            WHERE TeamID = ${teamReceiver}
                AND PartType = ${part}
                AND PartStat = 2
        `);
    }
}

/**
 * Applies a boost to car stats based on a normalized range.
 * @param {Object} designDict - Dictionary of parts designs.
 * @param {number} boost - Boost multiplier (0 to 1 range basically).
 * @param {number} team - Team ID.
 * @returns {Object} Updated stats dictionary.
 */
export function applyBoostToCarStats(designDict, boost, team) {
    const statsValues = {};
    for (const part in designDict) {

        const designInfo = designDict[part][0];
        const designID = (designInfo && designInfo.length) ? designInfo[0] : null;

        if (designID !== null) {
            const rows = queryDB(`
            SELECT PartStat, Value, UnitValue
            FROM Parts_Designs_StatValues
            WHERE DesignID = ${designID}
          `, "allRows");
            const tmp = {};
            for (const [stat, val, unitVal] of rows) {
                if (stat !== 15) {
                  let newUnitVal = applyScaledBoostToStatValue(unitVal, stat, boost);
                  let newVal = carConstants.unitValueToValue[stat](newUnitVal);
        
                //   console.log(
                //     `Old UnitValue: ${unitVal}, New UnitValue: ${newUnitVal} | ` +
                //     `Old Value: ${val}, New Value: ${newVal} | Part: ${part} | Stat: ${stat} | Team: ${team}`
                //   );

                  queryDB(
                    `UPDATE Parts_Designs_StatValues
                     SET UnitValue = ${newUnitVal}, Value = ${newVal}
                     WHERE DesignID = ${designID} AND PartStat = ${stat}`
                  );

                  queryDB(`
                    UPDATE Parts_TeamExpertise
                    SET Expertise = ${newVal}
                    WHERE TeamID = ${team}
                        AND PartType = ${part}
                        AND PartStat = ${stat}
                    `);

                  tmp[stat] = Math.round(newVal * 1000) / 1000; // round to 3 decimals
                }
              }
            statsValues[part] = tmp;
        } else {
            const zeroStats = {};
            for (const stat of carConstants.defaultPartsStats[part]) {
                zeroStats[stat] = 0;
            }
            statsValues[part] = zeroStats;
        }
    }
    return statsValues;
}

/**
 * Calculates a new stat value based on a boost factor within min/max bounds.
 * @param {number} originalValue - The original stat value.
 * @param {number} statID - The ID of the stat type.
 * @param {number} boost - The boost factor.
 * @returns {number} The new calculated value.
 */
function applyScaledBoostToStatValue(originalValue, statID, boost) {
    // 1) Identify the range for this stat
    const [minVal, maxVal] = carConstants.statsMinMax[statID] || [0, 100]; // fallback [0,100] if not in dictionary
    
    // Avoid division by zero
    const rangeSize = maxVal - minVal;
    if (rangeSize <= 0) {
      return originalValue; 
    }
  
    // 2) Normalize (0 to 1)
    let normalized = (originalValue - minVal) / rangeSize;
  
    // 3) Multiply by boost
    normalized *= boost;
  
    // 4) Clamp to [0,1]
    if (normalized > 1) normalized = 1;
    if (normalized < 0) normalized = 0;
  
    // 5) De-normalize
    const newValue = minVal + normalized * rangeSize;
    return newValue;
  }

/**
 * Returns the UnitValue of each stat from a design dictionary.
 * @param {Object} designDict - Dictionary of designs.
 * @returns {Object} Dictionary of stats with their UnitValues.
 */
export function getUnitValueFromParts(designDict) {
    const statsValues = {};
    for (const part in designDict) {
        const designID = designDict[part][0][0];
        const rows = queryDB(`
          SELECT PartStat, UnitValue
          FROM Parts_Designs_StatValues
          WHERE DesignID = ${designID}
        `, 'allRows');

        const tmp = {};
        for (const [stat, unitVal] of rows) {
            tmp[stat] = unitVal;
        }
        statsValues[carConstants.parts[part]] = tmp;
    }
    return statsValues;
}

/**
 * Returns UnitValues for a single design.
 * @param {number} designId - The ID of the design.
 * @returns {Object} A dictionary containing the part type and its stat UnitValues.
 */
export function getUnitValueFromOnePart(designId) {

    const partType = queryDB(`
            SELECT PartType
            FROM Parts_Designs
            WHERE DesignID = ${designId}
        `, 'singleValue');


    const rows = queryDB(`
            SELECT PartStat, UnitValue
            FROM Parts_Designs_StatValues
            WHERE DesignID = ${designId}
        `, 'allRows');


    const statsValues = {};
    for (const [stat, uv] of rows) {
        statsValues[stat] = uv;
    }
    const partValues = {};
    partValues[carConstants.parts[partType]] = statsValues;
    return partValues;
}

/**
 * Helper: converts a percentage to a physical value based on min/max ranges.
 * @param {string} attribute - The attribute name.
 * @param {number} percentage - The percentage value.
 * @param {Object} minMax - Dictionary defining min/max values for attributes.
 * @returns {number} The physical value.
 */
export function convertPercentageToValue(attribute, percentage, minMax) {
    // minMax[attribute] = [min_value, max_value]
    const [minValue, maxValue] = minMax[attribute];
    return minValue + (maxValue - minValue) * (percentage / 100.0);
}

/**
 * Converts all attributes to a human-readable format.
 * @param {Object} attributes - Dictionary of attributes.
 * @returns {Object} Dictionary of human-readable attributes.
 */
export function makeAttributesReadable(attributes) {
    for (const attribute in attributes) {
        attributes[attribute] = convertPercentageToValue(
            attribute,
            attributes[attribute],
            carConstants.attributesMinMax
        );
        // round to 3 decimals
        attributes[attribute] = Math.round(attributes[attribute] * 1000) / 1000;
        attributes[attribute] = `${attributes[attribute]} ${carConstants.attributesUnits[attribute]}`;
    }
    return attributes;
}

/**
 * Calculates global performance by summing (statValue * contribution).
 * @param {Object} attributes - Dictionary of car attributes.
 * @returns {number} Overall performance score rounded to 2 decimals.
 */
export function calculateOverallPerformance(attributes) {
    let ovr = 0;
    for (const attr in attributes) {
        ovr += attributes[attr] * carConstants.attributesContributions2[attr];
    }
    return Math.round(ovr * 100) / 100;
}

/**
 * Returns a dictionary with attribute contributions.
 * @returns {Object} Dictionary of attribute contributions per stat.
 */
export function getContributorsDict() {
    const contributorsValues = {};
    const totalValues = {};

    for (const attribute in carConstants.carAttributes) {
        totalValues[attribute] = 0;
        const referenceDict = carConstants[`${carConstants.carAttributes[attribute]}_contributors`];
        // Or wherever defined
        for (const stat in referenceDict) {
            totalValues[attribute] += referenceDict[stat];
        }
    }

    for (const attribute in carConstants.carAttributes) {
        const referenceDict = carConstants[`${carConstants.carAttributes[attribute]}_contributors`];
        contributorsValues[attribute] = {};
        for (const stat in referenceDict) {
            contributorsValues[attribute][stat] =
                Math.round((referenceDict[stat] / totalValues[attribute]) * 1000) / 1000;
        }
    }

    return contributorsValues;
}

/**
 * Sums the factors of each stat for each part.
 * @param {Object} carDict - Dictionary of car parts stats.
 * @returns {Object} Dictionary of summed stats.
 */
export function getPartStatsDict(carDict) {
    const partStats = {};
    for (const part in carDict) {
        for (const stat in carDict[part]) {
            const factor = carConstants[`${carConstants.stats[stat]}_factors`][part];
            if (!partStats[stat]) {
                partStats[stat] = 0;
            }
            partStats[stat] += carDict[part][stat] * factor;
        }
    }
    return partStats;
}

/**
 * Calculates final car attributes based on contributors and parts stats.
 * @param {Object} contributors - Dictionary of contributors.
 * @param {Object} partsStats - Dictionary of aggregated part stats.
 * @returns {Object} Dictionary of calculated car attributes.
 */
export function calculateCarAttributes(contributors, partsStats) {
    const attributesDict = {};
    // Adjustment: partsStats[16] = (20000 - partsStats[15]) / 20  (as in .py)
    partsStats[16] = (20000 - partsStats[15]) / 20;

    for (const attribute in contributors) {
        attributesDict[carConstants.carAttributes[attribute]] = 0;
        for (const stat in contributors[attribute]) {
            attributesDict[carConstants.carAttributes[attribute]] +=
                (contributors[attribute][stat] * partsStats[stat]) / 10;
        }
    }
    return attributesDict;
}

/**
 * Gets days on which races occur (completed or next upcoming).
 * @returns {Array} Array of race objects (RaceID, Day, TrackID).
 */
export function getRacesDays() {
    const [day, season] = queryDB(`
        SELECT Day, CurrentSeason 
        FROM Player_State
      `, 'singleRow') || [0, 0];

    // state=2 => completed, state=0 => not started
    const races = queryDB(`
        SELECT RaceID, Day, TrackID
        FROM Races
        WHERE SeasonID = ${season}
          AND State = 2
      `, 'allRows');

    // first_race_state_0 => the first one not started
    const firstRaceState0 = queryDB(`
        SELECT RaceID, Day, TrackID
        FROM Races
        WHERE SeasonID = ${season}
          AND State = 0
        ORDER BY Day ASC
        LIMIT 1
      `, 'singleRow');

    if (firstRaceState0) {
        races.push(firstRaceState0);
    }
    return races;
}

/**
 * Gets all races for the current season.
 * @returns {Array} Array of all race objects.
 */
export function getAllRaces() {
    const [day, season] = queryDB(`
        SELECT Day, CurrentSeason
        FROM Player_State
      `, 'singleRow') || [0, 0];

    const rows = queryDB(`
        SELECT RaceID, Day, TrackID
        FROM Races
        WHERE SeasonID = ${season}
      `, 'allRows');
    return rows;
}

/**
 * Returns performance of all teams on a given day (or current).
 * @param {number|null} day - The day to check performance for.
 * @param {Object|null} previous - Previous performance data (unused logic here).
 * @param {boolean} customTeam - If true, includes custom team.
 * @returns {Object} Dictionary of team performances.
 */
export function getPerformanceAllTeams(day = null, previous = null, customTeam = false) {
    const teams = {};
    const contributors = getContributorsDict();

    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32)
        : [...Array(10).keys()].map(i => i + 1);

    let parts;
    if (day == null) {
        // Use getBestParts
        parts = getBestParts(customTeam);
    } else {
        parts = getBestPartsUntil(day, customTeam);
    }

    for (const teamId of teamList) {
        const dict = getCarStats(parts[teamId]);
        const partStats = getPartStatsDict(dict);
        const attributes = calculateCarAttributes(contributors, partStats);
        const ovr = calculateOverallPerformance(attributes);
        teams[teamId] = ovr;
    }
    return teams;
}

/**
 * Returns performance of all cars (car1 and car2) for each team.
 * @param {boolean} customTeam - If true, includes custom team.
 * @returns {Object} Dictionary of cars performance.
 */
export function getPerformanceAllCars(customTeam = false) {
    const cars = {};
    const contributors = getContributorsDict();

    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32)
        : [...Array(10).keys()].map(i => i + 1);

    const carsParts = getFittedDesigns(customTeam);

    for (const teamId of Object.keys(carsParts)) {
        cars[teamId] = {};
        for (const carId of Object.keys(carsParts[teamId])) {
            const dict = getCarStats(carsParts[teamId][carId]);
            // Check for parts without design
            const missingParts = [];
            for (const part in carsParts[teamId][carId]) {
                if (carsParts[teamId][carId][part][0][0] == null) {
                    missingParts.push(part);
                }
            }

            const partStats = getPartStatsDict(dict);
            const attributes = calculateCarAttributes(contributors, partStats);
            const ovr = calculateOverallPerformance(attributes);

            const driverNumber = getDriverNumberWithCar(teamId, carId);
            cars[teamId][carId] = [ovr, driverNumber, missingParts];
        }
    }

    return cars;
}

/**
 * Returns attributes of all cars.
 * @param {boolean} customTeam - If true, includes custom team.
 * @returns {Object} Dictionary of car attributes.
 */
export function getAttributesAllCars(customTeam = false) {
    const cars = {};
    const contributors = getContributorsDict();

    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32)
        : [...Array(10).keys()].map(i => i + 1);

    const carsParts = getFittedDesigns(customTeam);

    for (const teamId of Object.keys(carsParts)) {
        cars[teamId] = {};
        for (const carId of Object.keys(carsParts[teamId])) {
            const dict = getCarStats(carsParts[teamId][carId]);
            const partStats = getPartStatsDict(dict);
            const attributes = calculateCarAttributes(contributors, partStats);
            // (In Python, there was an option for "make_attributes_readable")
            // attributes = makeAttributesReadable(attributes);
            cars[teamId][carId] = attributes;
        }
    }
    return cars;
}

/**
 * Returns the number of the driver driving a specific car.
 * @param {number} teamId - The team ID.
 * @param {number} carId - The car ID (position in team).
 * @returns {number|null} The driver's number or null.
 */
export function getDriverNumberWithCar(teamId, carId) {
    const row = queryDB(`
        SELECT con.StaffID
        FROM Staff_Contracts con
        JOIN Staff_GameData gam ON con.StaffID = gam.StaffID
        WHERE con.TeamID = ${teamId}
          AND gam.StaffType = 0
          AND con.ContractType = 0
          AND con.PosInTeam = ${carId}
      `, 'singleRow');
    if (!row) {
        return null;
    }
    const driverId = row[0];

    const number = queryDB(`
        SELECT Number
        FROM Staff_DriverNumbers
        WHERE CurrentHolder = ${driverId}
      `, 'singleValue');
    return number ?? null;
}

/**
 * Gets the designs fitted on each car (loadout 1 and 2) for each team.
 * @param {boolean} customTeam - If true, includes custom team.
 * @returns {Object} Dictionary of fitted designs.
 */
export function getFittedDesigns(customTeam = false) {
    const teams = {};
    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32)
        : [...Array(10).keys()].map(i => i + 1);

    for (const t of teamList) {
        teams[t] = {};
        // loadout => 1 or 2
        for (let loadout = 1; loadout <= 2; loadout++) {
            const designs = {};
            for (let part = 3; part < 9; part++) {
                const row = queryDB(`
                    SELECT DesignID
                    FROM Parts_CarLoadout
                    WHERE TeamID = ${t}
                        AND PartType = ${part}
                        AND LoadoutID = ${loadout}
                    `, 'allRows');
                designs[part] = row;
            }
            // engine
            const engine = queryDB(`
                    SELECT MAX(DesignID)
                    FROM Parts_Designs
                    WHERE PartType = 0
                    AND TeamID = ${t}
                `, 'allRows');
            designs[0] = engine;

            teams[t][loadout] = designs;
        }
    }
    return teams;
}

/**
 * Fits the latest designs for all teams on the grid.
 * @param {boolean} customTeam - If true, includes custom team.
 */
export function fitLatestDesignsAllGrid(customTeam = false) {
    // SELECT Day, CurrentSeason FROM Player_State
    const row = queryDB(`
        SELECT Day, CurrentSeason 
        FROM Player_State
        `, "singleRow");

    if (!row) {
        console.warn("No Player_State data found.");
        return;
    }

    const [day, season] = row;
    // Get best parts until 'day'
    const bestParts = getBestPartsUntil(day, customTeam);

    // For each team in bestParts
    for (const team of Object.keys(bestParts)) {
        fitLatestDesignsOneTeam(team, bestParts[team]);
    }

    // conn.commit() (typically not needed in SQL.js)
}

/**
 * Fits the latest designs for a single team.
 * @param {number} teamId - The team ID.
 * @param {Object} parts - Dictionary of parts for the team.
 */
export function fitLatestDesignsOneTeam(teamId, parts) {
    // Loop through loadout 1 and 2
    for (let loadout = 1; loadout <= 2; loadout++) {
        // For each 'part' in parts object
        for (const partKey of Object.keys(parts)) {
            const part = Number(partKey);
            if (part !== 0) {
                // In Python, parts[part] = [[designId], ...], assuming structure
                const design = parts[part][0][0]; // -> designID
                // current fitted_design
                const fittedRow = queryDB(`
                        SELECT DesignID 
                        FROM Parts_CarLoadout
                        WHERE TeamID = ${teamId}
                        AND PartType = ${part}
                        AND LoadoutID = ${loadout}
                    `, "singleRow");

                if (!fittedRow) {
                    console.warn(`No fittedRow found for TeamID=${teamId}, part=${part}, loadout=${loadout}`);
                    continue;
                }
                const fittedDesign = fittedRow[0];

                if (design !== fittedDesign) {
                    // Check available items
                    const partsAvailable = queryDB(`
                        SELECT ItemID
                        FROM Parts_Items
                        WHERE DesignID = ${design}
                            AND AssociatedCar IS NULL
                        `, "allRows");

                    if (!partsAvailable.length) {
                        // no items available => create new one
                        const item = createNewItem(design, part);
                        addPartToLoadout(design, part, teamId, loadout, item);
                    } else {
                        const item = partsAvailable[0][0]; // first item
                        addPartToLoadout(design, part, teamId, loadout, item);
                    }
                } else {
                    // design already equipped in this loadout
                    // Check if loadout 1 and 2 share the same item
                    const otherLoadout = (loadout === 2) ? 1 : 2;

                    const fittedItemOther = queryDB(`
                        SELECT ItemID 
                        FROM Parts_CarLoadout
                        WHERE TeamID = ${teamId}
                            AND PartType = ${part}
                            AND LoadoutID = ${otherLoadout}
                        `, "singleRow");

                    const fittedItem = queryDB(`
                        SELECT ItemID 
                        FROM Parts_CarLoadout
                        WHERE TeamID = ${teamId}
                            AND PartType = ${part}
                            AND LoadoutID = ${loadout}
                        `, "singleRow");

                    if (fittedItemOther && fittedItem
                        && fittedItemOther[0] === fittedItem[0]) {
                        // Both loadouts have the same item => create a new one
                        const item = createNewItem(design, part);
                        addPartToLoadout(design, part, teamId, loadout, item);
                    }
                }
            }
        }
    }

    // commit
}

/**
 * Updates items for a design dictionary, ensuring the count matches.
 * @param {Object} designDict - Dictionary of designs.
 * @param {number} teamId - The team ID.
 */
export function updateItemsForDesignDict(designDict, teamId) {
    for (const designKey of Object.keys(designDict)) {
        const design = Number(designKey);
        const nParts = parseInt(designDict[designKey], 10);

        // SELECT PartType FROM Parts_Designs WHERE DesignID = {design}
        const partType = queryDB(`
        SELECT PartType
        FROM Parts_Designs
        WHERE DesignID = ${design}
      `, "singleValue");

        // SELECT COUNT(*) FROM Parts_Items WHERE DesignID = {design} AND BuildWork = X
        let actualParts = queryDB(`
        SELECT COUNT(*)
        FROM Parts_Items
        WHERE DesignID = ${design}
          AND BuildWork = ${carConstants.standardBuildworkPerPart[partType]}
      `, "singleValue");
        if (actualParts == null) actualParts = 0;

        let diff = nParts - actualParts;
        if (diff > 0) {
            while (diff > 0) {
                createNewItem(design, partType);
                diff--;
            }
        } else if (diff < 0) {
            while (diff < 0) {
                deleteItem(design);
                diff++;
            }
        }
    }

    // commit
}

/**
 * Fits items according to a loadouts dictionary.
 * @param {Object} loadoutsDict - Dictionary of loadout configurations.
 * @param {number} teamId - The team ID.
 */
export function fitLoadoutsDict(loadoutsDict, teamId) {
    for (const partKey of Object.keys(loadoutsDict)) {
        const part = Number(partKey);
        const design1 = loadoutsDict[part][0];
        const design2 = loadoutsDict[part][1];

        // SELECT DesignID, ItemID FROM Parts_CarLoadout ...
        let fittedDesign1 = queryDB(`
                SELECT DesignID, ItemID
                FROM Parts_CarLoadout
                WHERE TeamID = ${teamId}
                AND PartType = ${part}
                AND LoadoutID = 1
            `, "singleRow");

        if (design1 != null) {
            if (fittedDesign1 && fittedDesign1[0] != null && fittedDesign1[1] != null) {
                // "UPDATE Parts_Items SET AssociatedCar = NULL WHERE ItemID = ?"
                const itemId = fittedDesign1[1];
                queryDB(`
                        UPDATE Parts_Items
                        SET AssociatedCar = NULL
                        WHERE ItemID = ${itemId}
                    `);
                // fittedDesign1 = fittedDesign1[0]
                fittedDesign1 = [fittedDesign1[0], itemId]; // if needed to retain
            }

            // If current design1 is different...
            if (!fittedDesign1 || fittedDesign1[0] !== design1) {
                // SELECT ItemID FROM Parts_Items WHERE ...
                const items1 = queryDB(`
                        SELECT ItemID
                        FROM Parts_Items
                        WHERE DesignID = ${design1}
                        AND BuildWork = ${carConstants.standardBuildworkPerPart[part]}
                        AND AssociatedCar IS NULL
                    `, "allRows");

                let item1;
                if (!items1.length) {
                    item1 = createNewItem(design1, part);
                } else {
                    item1 = items1[0][0];
                }

                addPartToLoadout(design1, part, teamId, 1, item1);
            }
        }

        // Now loadout 2
        let fittedDesign2 = queryDB(`
                SELECT DesignID, ItemID
                FROM Parts_CarLoadout
                WHERE TeamID = ${teamId}
                AND PartType = ${part}
                AND LoadoutID = 2
            `, "singleRow");

        if (design2 != null) {
            if (fittedDesign2 && fittedDesign2[0] != null && fittedDesign2[1] != null) {
                const itemId2 = fittedDesign2[1];
                queryDB(`
                        UPDATE Parts_Items
                        SET AssociatedCar = NULL
                        WHERE ItemID = ${itemId2}
                    `);
                fittedDesign2 = [fittedDesign2[0], itemId2];
            }

            if (!fittedDesign2 || fittedDesign2[0] !== design2) {
                const items2 = queryDB(`
                        SELECT ItemID
                        FROM Parts_Items
                        WHERE DesignID = ${design2}
                        AND BuildWork = ${carConstants.standardBuildworkPerPart[part]}
                        AND AssociatedCar IS NULL
                    `, "allRows");

                let item2;
                if (!items2.length) {
                    item2 = createNewItem(design2, part);
                } else {
                    item2 = items2[0][0];
                }

                addPartToLoadout(design2, part, teamId, 2, item2);
            }
        }
    }

    // commit
}

/**
 * Creates a new item in the database.
 * @param {number} designId - The design ID.
 * @param {number} part - The part type ID.
 * @returns {number} The new item ID.
 */
export function createNewItem(designId, part) {
    // SELECT MAX(ItemID) FROM Parts_Items
    let maxItem = queryDB(`
        SELECT MAX(ItemID)
        FROM Parts_Items
        `, "singleValue");

    const newItem = maxItem + 1;

    const numberOfManufactures = queryDB(`
        SELECT ManufactureCount
        FROM Parts_Designs
        WHERE DesignID = ${designId}
        `, "singleValue");

    const newNManufactures = numberOfManufactures + 1;

    queryDB(`
        INSERT INTO Parts_Items
        VALUES (
            ${newItem}, 
            ${designId},
            ${carConstants.standardBuildworkPerPart[part]},
            1,
            ${newNManufactures},
            NULL,
            NULL,
            0,
            NULL
        )
        `);

    queryDB(`
            UPDATE Parts_Designs
            SET ManufactureCount = ${newNManufactures}
            WHERE DesignID = ${designId}
            `);

    return newItem;
}

/**
 * Deletes an item from the database.
 * @param {number} designId - The design ID.
 */
export function deleteItem(designId) {
    // SELECT PartType FROM Parts_Designs WHERE DesignID = {designId}
    const partType = queryDB(`
      SELECT PartType
      FROM Parts_Designs
      WHERE DesignID = ${designId}
    `, "singleValue");

    // SELECT ItemID FROM Parts_Items WHERE DesignID = {designId} AND BuildWork = ...
    const item = queryDB(`
      SELECT ItemID
      FROM Parts_Items
      WHERE DesignID = ${designId}
        AND BuildWork = ${carConstants.standardBuildworkPerPart[partType]}
    `, "singleValue");

    queryDB(`
      DELETE FROM Parts_Items
      WHERE ItemID = ${item}
    `);
}

/**
 * Adds a new design to the database.
 * @param {number} part - Part type ID.
 * @param {number} teamId - Team ID.
 * @param {number} day - Current day.
 * @param {number} season - Current season.
 * @param {number} latestDesignPartFromTeam - ID of the latest design from the team.
 * @param {number} newDesignId - ID for the new design.
 */
export function addNewDesign(part, teamId, day, season, latestDesignPartFromTeam, newDesignId) {
    const maxDesignFromPart = queryDB(`
      SELECT MAX(DesignNumber)
      FROM Parts_Designs
      WHERE PartType = ${part}
        AND TeamID = ${teamId}
    `, "singleValue");

    const newMaxDesign = maxDesignFromPart + 1;

    queryDB(`
        UPDATE Parts_Designs_TeamData
        SET NewDesignsThisSeason = ${newMaxDesign}
        WHERE TeamID = ${teamId}
            AND PartType = ${part}
        `);

    queryDB(`
        INSERT INTO Parts_Designs
        VALUES (
            ${newDesignId}, 
            ${part}, 
            6720, 
            6600, 
            ${day - 1}, 
            ${day}, 
            NULL,
            5,
            1,
            0,
            0,
            1500,
            ${season},
            0,
            0,
            4,
            ${newMaxDesign},
            1,
            ${teamId},
            1
        )
        `);

    queryDB(`
        INSERT INTO Parts_DesignHistoryData
        VALUES (
            ${newDesignId}, 
            0,
            0,
            0,
            0
        )
        `);

    copyFromTable("building", latestDesignPartFromTeam, newDesignId);
    copyFromTable("staff", latestDesignPartFromTeam, newDesignId);
    add4Items(newDesignId, part, teamId);
}

/**
 * Copies data from one table to another for a new design.
 * @param {string} table - The table type ("building" or "staff").
 * @param {number} latestDesignId - The ID of the source design.
 * @param {number} newDesignId - The ID of the new design.
 */
export function copyFromTable(table, latestDesignId, newDesignId) {
    let tableName = "";
    if (table === "building") {
        tableName = "Parts_Designs_BuildingEffects";
    } else if (table === "staff") {
        tableName = "Parts_Designs_StaffEffects";
    }

    const rows = queryDB(`
        SELECT *
        FROM ${tableName}
        WHERE DesignID = ${latestDesignId}
        `, "allRows");

    for (const row of rows) {
        // row => [DesignID, col1, col2, ...]
        queryDB(`
                INSERT INTO ${tableName}
                VALUES (${newDesignId}, ${row[1]}, ${row[2]}, 0)
            `);
    }
}

/**
 * Adds 4 items for a new design.
 * @param {number} newDesignId - The ID of the new design.
 * @param {number} part - The part type ID.
 * @param {number} teamId - The team ID.
 */
export function add4Items(newDesignId, part, teamId) {
    let maxItem = queryDB(`
        SELECT MAX(ItemID)
        FROM Parts_Items
        `, "singleValue");

    for (let i = 1; i <= 4; i++) {
        maxItem += 1;
        queryDB(`
        INSERT INTO Parts_Items
        VALUES (
          ${maxItem},
          ${newDesignId},
          ${carConstants.standardBuildworkPerPart[part]},
          1,
          ${i},
          NULL,
          NULL,
          0,
          NULL
        )
      `);

        // For loadout 1 and 2
        if (i <= 2) {
            const loadoutId = i;
            addPartToLoadout(newDesignId, part, teamId, loadoutId, maxItem);
        }
    }
}

/**
 * Associates a part item to a car loadout.
 * @param {number} designId - The design ID.
 * @param {number} part - The part type ID.
 * @param {number} teamId - The team ID.
 * @param {number} loadoutId - The loadout ID (1 or 2).
 * @param {number} itemId - The item ID.
 */
export function addPartToLoadout(designId, part, teamId, loadoutId, itemId) {
    queryDB(`
            UPDATE Parts_CarLoadout
            SET DesignID = ${designId}, ItemID = ${itemId}
            WHERE TeamID = ${teamId}
                AND PartType = ${part}
                AND LoadoutID = ${loadoutId}
        `);

    queryDB(`
            UPDATE Parts_Items
            SET AssociatedCar = ${loadoutId}, LastEquippedCar = ${loadoutId}
            WHERE ItemID = ${itemId}
        `);
}

/**
 * Overwrites performance for a team, updating parts and stats.
 * @param {number} teamId - The team ID.
 * @param {Object} performance - Dictionary of performance stats to update.
 * @param {boolean} [customTeam=null] - Whether it is a custom team (unused in function body).
 * @param {string} [yearIteration=null] - The game year iteration ("23" or "24").
 * @param {Object} [loadoutDict=null] - Dictionary of loadouts for new designs.
 */
export function overwritePerformanceTeam(teamId, performance, customTeam = null, yearIteration = null, loadoutDict = null) {
    const row = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');

    if (!row) {
        console.warn("Player_State not found");
        return;
    }
    const [day, season] = row;

    const bestParts = getBestPartsUntil(day, customTeam);
    const teamParts = bestParts[Number(teamId)];

    for (const partKey of Object.keys(teamParts)) {
        const part = Number(partKey);
        if (part !== 0) {
            const design = teamParts[part][0][0]; // current design
            const partName = carConstants.parts[part];         // "Suspension", "Wing", etc.
            const newDesign = performance[partName]["designEditing"];
            delete performance[partName]["designEditing"];

            let finalDesign = design;
            if (Number(newDesign) === -1) {
                // new part
                const maxDesign = queryDB(`
                        SELECT MAX(DesignID)
                        FROM Parts_Designs
                    `, 'singleValue');

                const latestDesignPartFromTeam = queryDB(`
                        SELECT MAX(DesignID)
                        FROM Parts_Designs
                        WHERE PartType = ${part}
                        AND TeamID = ${teamId}
                    `, 'singleValue');

                const newDesignId = loadoutDict[String(part)][0];
                addNewDesign(part, Number(teamId), day, season, latestDesignPartFromTeam, newDesignId);
                finalDesign = newDesignId;
            } else {
                finalDesign = Number(newDesign);
            }

            const statsObj = performance[partName];
            for (const statKey of Object.keys(statsObj)) {
                const statNum = parseFloat(statsObj[statKey]);
                let value;
                if (yearIteration === "24" && Number(statKey) >= 7 && Number(statKey) <= 9) {
                    value = carConstants.downforce24UnitValueToValue[statKey](statNum);
                } else {
                    value = carConstants.unitValueToValue[statKey](statNum);
                }

                if (Number(newDesign) !== -1) {
                    // update
                    changeExpertiseBased(part, statKey, value, Number(teamId));
                    queryDB(`
              UPDATE Parts_Designs_StatValues
              SET UnitValue = ${statsObj[statKey]}
              WHERE DesignID = ${finalDesign}
                AND PartStat = ${statKey}
            `);

                    queryDB(`
              UPDATE Parts_Designs_StatValues
              SET Value = ${value}
              WHERE DesignID = ${finalDesign}
                AND PartStat = ${statKey}
            `);
                } else {
                    // insert
                    queryDB(`
              INSERT INTO Parts_Designs_StatValues
              VALUES (
                ${finalDesign}, 
                ${statKey}, 
                ${value}, 
                ${statsObj[statKey]}, 
                0.5, 
                1, 
                0.1
              )
            `);
                }
            }

            // if newDesign == -1 => insert standard weight
            if (Number(newDesign) === -1) {
                queryDB(`
            INSERT INTO Parts_Designs_StatValues
            VALUES (
              ${finalDesign},
              15,
              500,
              ${carConstants.standardWeightPerPart[part]},
              0.5,
              0,
              0
            )
          `);

                // After inserting stats, change expertise
                for (const statKey of Object.keys(statsObj)) {
                    const statNum = parseFloat(statsObj[statKey]);
                    let value;
                    if (yearIteration === "24" && Number(statKey) >= 7 && Number(statKey) <= 9) {
                        value = carConstants.downforce24UnitValueToValue[statKey](statNum);
                    } else {
                        value = carConstants.unitValueToValue[statKey](statNum);
                    }
                    changeExpertiseBased(part, statKey, value, Number(teamId), "new", latestDesignPartFromTeam);
                }
            }
        }
    }

    // commit
}

/**
 * Changes team expertise based on new part values.
 * @param {number} part - Part type ID.
 * @param {number} stat - Stat type ID.
 * @param {number} newValue - New stat value.
 * @param {number} teamId - Team ID.
 * @param {string} [type="existing"] - "existing" or "new".
 * @param {number|null} [oldDesign=null] - ID of the old design (if type is "new").
 */
export function changeExpertiseBased(part, stat, newValue, teamId, type = "existing", oldDesign = null) {
    // SELECT Day, CurrentSeason FROM Player_State
    const row = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');
    if (!row) {
        console.warn("No Player_State found to do expertise changes");
        return;
    }
    const [day, curSeason] = row;

    let currentValue = null;
    if (type === "existing") {
        // SELECT MAX(Value) FROM Parts_Designs_StatValues ...
        currentValue = queryDB(`
        SELECT MAX(Value)
        FROM Parts_Designs_StatValues
        WHERE PartStat = ${stat}
          AND DesignID IN (
            SELECT MAX(DesignID)
            FROM Parts_Designs
            WHERE PartType = ${part}
              AND TeamID = ${teamId}
              AND ValidFrom = ${curSeason}
          )
      `, 'singleValue');
    } else if (type === "new") {
        // SELECT Value FROM Parts_Designs_StatValues ...
        currentValue = queryDB(`
        SELECT Value
        FROM Parts_Designs_StatValues
        WHERE PartStat = ${stat}
          AND DesignID = ${oldDesign}
      `, 'singleValue');
    }

    if (!currentValue) {
        currentValue = 1; // if no value
    }
    if (currentValue === 0) {
        currentValue = 1;
    }

    const currentExpertise = queryDB(`
        SELECT Expertise
        FROM Parts_TeamExpertise
        WHERE TeamID = ${teamId}
          AND PartType = ${part}
          AND PartStat = ${stat}
      `, 'singleValue') || 0;

    // console.log(newValue, currentValue, currentExpertise);

    const newExpertise = (Number(newValue) * Number(currentExpertise)) / Number(currentValue);


    // console.log(`Old expertise: ${currentExpertise}, New expertise: ${newExpertise}`);
    queryDB(`
        UPDATE Parts_TeamExpertise
        SET Expertise = ${newExpertise}
        WHERE TeamID = ${teamId}
            AND PartType = ${part}
            AND PartStat = ${stat}
        `);
}


/**
 * Gets the season performance for all teams.
 * @param {boolean} customTeam - If true, includes custom team.
 * @returns {Array} Array containing performance data array and races array.
 */
export function getPerformanceAllTeamsSeason(customTeam = false) {
    const races = getRacesDays();
    const firstDay = getFirstDaySeason();
    // Insert at beginning (0, firstDay, 0)
    races.unshift([0, firstDay, 0]); // similar to insert(0, first_tuple)

    const racesPerformances = [];
    let previous = null;
    for (const raceDay of races) {
        // raceDay => [RaceID, Day, TrackID], python takes day at [1]
        const day = raceDay[1];
        const performances = getPerformanceAllTeams(day, previous, customTeam);
        racesPerformances.push(performances);
        previous = performances;
    }

    const allRaces = getAllRaces();
    return [racesPerformances, allRaces];
}

/**
 * Gets the first day of the season (based on part creation dates).
 * @returns {number} The first day number.
 */
export function getFirstDaySeason() {
    const query = `
        SELECT Number, COUNT(*) as Occurrences
        FROM (
            SELECT DayCreated as Number FROM Parts_Designs
            UNION ALL
            SELECT DayCompleted as Number FROM Parts_Designs
        ) Combined
        GROUP BY Number
        ORDER BY Occurrences DESC
        LIMIT 1;
        `;
    const row = queryDB(query, 'singleRow');
    if (!row) {
        console.warn("No firstDay found");
        return 0;
    }
    const firstDay = row[0];
    return firstDay;
}

/**
 * Gets the attributes for all teams based on their best parts.
 * @param {boolean} customTeam - If true, includes custom team.
 * @returns {Object} Dictionary of team attributes.
 */
export function getAttributesAllTeams(customTeam = false) {
    const teams = {};
    const contributors = getContributorsDict();
    const bestParts = getBestParts(customTeam);

    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32)
        : [...Array(10).keys()].map(i => i + 1);

    for (const i of teamList) {
        const dict = getCarStats(bestParts[i]);
        const partStats = getPartStatsDict(dict);
        const attributes = calculateCarAttributes(contributors, partStats);
        teams[i] = attributes;
    }
    return teams;
}

/**
 * Gets the maximum design ID currently in the database.
 * @returns {number} The maximum design ID.
 */
export function getMaxDesign() {
    const val = queryDB(`
        SELECT MAX(DesignID)
        FROM Parts_Designs
        `, 'singleValue');
    return val;
}



