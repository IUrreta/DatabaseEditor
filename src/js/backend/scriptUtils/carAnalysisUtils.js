import * as carConstants from './carConstants.js';
import { queryDB } from '../dbManager.js';



/**
 * Devuelve las mejores piezas para cada equipo.
 * @param {boolean} customTeam - si es true, incluye el equipo 32 además de 1..10
 */
export function getBestParts(customTeam = false) {
    const teams = {};
    // Creamos la lista de equipos
    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32) // 1..10 y 32
        : [...Array(10).keys()].map(i => i + 1);          // 1..10

    for (const teamId of teamList) {
        teams[teamId] = getPartsFromTeam(teamId);
    }
    return teams;
}

/**
 * Obtiene TODAS las piezas (varias designs) de un equipo
 * (Como en Python: get_all_parts_from_team)
 */
export function getAllPartsFromTeam(teamId) {
    // Obtenemos Day y Season
    const [day, currentSeason] = queryDB(
        "SELECT Day, CurrentSeason FROM Player_State",
        "singleRow"
    ) || [0, 0];

    // Query para extraer las designs del PartType con DayCompleted > 0
    const query = `
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
          d.PartType = ?
          AND d.TeamID = ?
          AND d.ValidFrom = ?
          AND d.DayCompleted > 0
      `;

    // En Python se usaba placeholders "?", en JS podemos hacer un template
    // pero si necesitas SQL parametrizado, deberías adaptarlo. Por simplicidad:
    // haremos un template string con la parte variable:
    // d.PartType = {j}, d.TeamID = {teamId}, d.ValidFrom = {currentSeason}
    // y repetimos para cada PartType.

    const partsDict = {};

    // Ej. en Python, PartType iba de 3..8
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

        // Para cada design, agregamos info extra: equipped_1, equipped_2, n_parts
        designs = designs.map(designRow => {
            // designRow => [ DesignID, DayCreated, DayCompleted, TrackID ]
            const [designID, dayCreated, dayCompleted, trackID] = designRow;

            // Vemos si está equipado en loadout 1
            const equipped1 = queryDB(`
            SELECT DesignID
            FROM Parts_CarLoadout
            WHERE TeamID = ${teamId} 
              AND PartType = ${j} 
              AND LoadoutID = 1
          `, "singleValue");
            let eq1 = (equipped1 === designID) ? 1 : 0;

            // Equipado en loadout 2?
            const equipped2 = queryDB(`
            SELECT DesignID
            FROM Parts_CarLoadout
            WHERE TeamID = ${teamId} 
              AND PartType = ${j} 
              AND LoadoutID = 2
          `, "singleValue");
            let eq2 = (equipped2 === designID) ? 1 : 0;

            // Número de partes (items) construidas
            const nParts = queryDB(`
            SELECT COUNT(*)
            FROM Parts_Items
            WHERE DesignID = ${designID}
              AND BuildWork = ${carConstants.standardBuildworkPerPart[j]}
          `, "singleValue") || 0;

            // Devolvemos un nuevo array con toda la info
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

        // Asignamos a partsDict[ parts[j] ] = designs
        // Asumiendo que 'parts[j]' existe. Ajusta si es distinto
        partsDict[carConstants.parts[j]] = designs;
    }

    return partsDict;
}

/**
 * Obtiene las piezas "mejores" (MAX(DesignID)) para un equipo y su season actual
 * (Similar a get_parts_from_team en el Python original)
 */
export function getPartsFromTeam(teamId) {
    // Day, Season
    const [day, season] = queryDB(
        "SELECT Day, CurrentSeason FROM Player_State",
        "singleRow"
    ) || [0, 0];

    const designs = {};
    // En Python, j va de 3..8 => motor = 0
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
 * Obtiene las mejores piezas hasta un día concreto (versión con day param)
 * (Similar a get_best_parts_until en el Python original)
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
 * Devuelve un diccionario con los valores de stats (PartStat -> Value)
 * de cada parte (partType).
 * (get_car_stats en el Python original)
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

export function updateTyreDegStats(designDictTeamReceiver, designDictTeamGiver, teamReceiver, teamGiver) {
    console.log(designDictTeamReceiver);
    console.log(designDictTeamGiver);
    console.log(`Team Receiver: ${teamReceiver}, Team Giver: ${teamGiver}`);
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

                  tmp[stat] = Math.round(newVal * 1000) / 1000; // redondeo a 3 decimales
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

function applyScaledBoostToStatValue(originalValue, statID, boost) {
    // 1) Identificar el rango correspondiente a este stat
    const [minVal, maxVal] = carConstants.statsMinMax[statID] || [0, 100]; // fallback [0,100] si no está en el diccionario
    
    // Evitar división por cero en caso de minVal == maxVal
    const rangeSize = maxVal - minVal;
    if (rangeSize <= 0) {
      return originalValue; 
    }
  
    // 2) Normalizar (0 a 1)
    let normalized = (originalValue - minVal) / rangeSize;
  
    // 3) Multiplicar por el boost
    normalized *= boost;
  
    // 4) Clamp a [0,1]
    if (normalized > 1) normalized = 1;
    if (normalized < 0) normalized = 0;
  
    // 5) Des-normalizar
    const newValue = minVal + normalized * rangeSize;
    return newValue;
  }

/**
 * Devuelve el UnitValue de cada stat de un dict de diseños
 * (En Python: get_unitvalue_from_parts)
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
 * UnitValue de un solo diseño
 * (get_unitvalue_from_one_part en Python)
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
 * Simple helper: convierte un porcentaje a valor físico según min/max
 * (convert_percentage_to_value en Python)
 */
export function convertPercentageToValue(attribute, percentage, minMax) {
    // minMax[attribute] = [min_value, max_value]
    const [minValue, maxValue] = minMax[attribute];
    return minValue + (maxValue - minValue) * (percentage / 100.0);
}

/**
 * Pasa todos los atributos a rango human-readable
 * (make_attributes_readable en Python)
 */
export function makeAttributesReadable(attributes) {
    for (const attribute in attributes) {
        attributes[attribute] = convertPercentageToValue(
            attribute,
            attributes[attribute],
            carConstants.attributesMinMax
        );
        // redondea a 3 dec
        attributes[attribute] = Math.round(attributes[attribute] * 1000) / 1000;
        attributes[attribute] = `${attributes[attribute]} ${carConstants.attributesUnits[attribute]}`;
    }
    return attributes;
}

/**
 * Calcula la performance global sumando (valorStat * contribución)
 * (calculate_overall_performance en Python)
 */
export function calculateOverallPerformance(attributes) {
    let ovr = 0;
    for (const attr in attributes) {
        ovr += attributes[attr] * carConstants.attributesContributions2[attr];
    }
    return Math.round(ovr * 100) / 100;
}

/**
 * Devuelve un diccionario con las contribuciones
 * (get_contributors_dict en Python)
 */
export function getContributorsDict() {
    // Lógica similar a Python
    const contributorsValues = {};
    const totalValues = {};

    for (const attribute in carConstants.carAttributes) {
        totalValues[attribute] = 0;
        const referenceDict = carConstants[`${carConstants.carAttributes[attribute]}_contributors`];
        // O donde sea que esté definido
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
 * Suma los factores de cada stat de cada parte
 * (get_part_stats_dict en Python)
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
 * Calcula los atributos finales sumando (contribución * partStats[stat]) / 10
 * (calculate_car_attributes en Python)
 */
export function calculateCarAttributes(contributors, partsStats) {
    const attributesDict = {};
    // Ajuste: partsStats[16] = (20000 - partsStats[15]) / 20  (como en el .py)
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
 * Obtiene días de carreras
 * (get_races_days en Python)
 */
export function getRacesDays() {
    const [day, season] = queryDB(`
        SELECT Day, CurrentSeason 
        FROM Player_State
      `, 'singleRow') || [0, 0];

    // state=2 => completadas, state=0 => no comenzadas
    const races = queryDB(`
        SELECT RaceID, Day, TrackID
        FROM Races
        WHERE SeasonID = ${season}
          AND State = 2
      `, 'allRows');

    // first_race_state_0 => la primera no iniciada
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
 * Devuelve la performance de todos los equipos en un día dado (o actual)
 * (get_performance_all_teams en Python)
 */
export function getPerformanceAllTeams(day = null, previous = null, customTeam = false) {
    const teams = {};
    const contributors = getContributorsDict();

    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32)
        : [...Array(10).keys()].map(i => i + 1);

    let parts;
    if (day == null) {
        // Usamos getBestParts
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
 * Devuelve la performance de todos los coches (car1 y car2) de cada equipo
 * (get_performance_all_cars en Python)
 */
export function getPerformanceAllCars(customTeam = false) {
    const cars = {};
    const contributors = getContributorsDict();

    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32)
        : [...Array(10).keys()].map(i => i + 1);

    // Este método en Python usaba "get_fitted_designs(custom_team=custom_team)"
    const carsParts = getFittedDesigns(customTeam);

    for (const teamId of Object.keys(carsParts)) {
        cars[teamId] = {};
        for (const carId of Object.keys(carsParts[teamId])) {
            const dict = getCarStats(carsParts[teamId][carId]);
            // Falta ver si hay partes sin design
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
 * Devuelve los atributos de todos los coches
 * (get_attributes_all_cars en Python)
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
            // (En Python, se dejaba la opción de "make_attributes_readable")
            // attributes = makeAttributesReadable(attributes);
            cars[teamId][carId] = attributes;
        }
    }
    return cars;
}

/**
 * Devuelve el número del driver que conduce un coche concreto
 * (get_driver_number_with_car en Python)
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
 * Obtiene los diseños equipados en cada coche (loadout 1 y 2) de cada equipo
 * (get_fitted_designs en Python)
 */
export function getFittedDesigns(customTeam = false) {
    const teams = {};
    const teamList = customTeam
        ? [...Array(10).keys()].map(i => i + 1).concat(32)
        : [...Array(10).keys()].map(i => i + 1);

    for (const t of teamList) {
        teams[t] = {};
        // loadout => 1 o 2
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

// Asumiendo que tu clase CarAnalysisUtils ya tiene otros métodos traducidos
// Añadimos/completamos con estos métodos:

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
    // Obtenemos las mejores piezas hasta 'day'
    const bestParts = getBestPartsUntil(day, customTeam);

    // Para cada equipo en bestParts
    for (const team of Object.keys(bestParts)) {
        fitLatestDesignsOneTeam(team, bestParts[team]);
    }

    // conn.commit() (en SQL.js no es necesario típicamente)
}

export function fitLatestDesignsOneTeam(teamId, parts) {
    // Recorremos loadout = 1 y 2
    for (let loadout = 1; loadout <= 2; loadout++) {
        // Para cada 'part' en el objeto parts
        for (const partKey of Object.keys(parts)) {
            const part = Number(partKey);
            if (part !== 0) {
                // En Python, parts[part] = [[designId], ...], asumiendo la estructura
                const design = parts[part][0][0]; // -> designID
                // fitted_design actual
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
                    // Buscamos items disponibles
                    const partsAvailable = queryDB(`
                        SELECT ItemID
                        FROM Parts_Items
                        WHERE DesignID = ${design}
                            AND AssociatedCar IS NULL
                        `, "allRows");

                    if (!partsAvailable.length) {
                        // no hay items disponibles => creamos uno nuevo
                        const item = createNewItem(design, part);
                        addPartToLoadout(design, part, teamId, loadout, item);
                    } else {
                        const item = partsAvailable[0][0]; // primer item
                        addPartToLoadout(design, part, teamId, loadout, item);
                    }
                } else {
                    // design ya está equipado en este loadout
                    // Miramos si loadout 1 y 2 comparten item
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
                        // Ambos loadouts tienen el mismo item => creamos uno nuevo
                        const item = createNewItem(design, part);
                        addPartToLoadout(design, part, teamId, loadout, item);
                    }
                }
            }
        }
    }

    // commit
    // (en SQL.js no es necesario, pero podrías hacer db.run("BEGIN/COMMIT") si fuera el caso)
}

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
                fittedDesign1 = [fittedDesign1[0], itemId]; // si necesitas retenerlo
            }

            // Si la design1 actual es distinta...
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

        // Ahora loadout 2
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

// En Python: create_new_item(design_id, part)
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

        // Para loadout 1 y 2
        if (i <= 2) {
            const loadoutId = i;
            addPartToLoadout(newDesignId, part, teamId, loadoutId, maxItem);
        }
    }
}

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

// overwrite_performance_team(...)
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
            const design = teamParts[part][0][0]; // design actual
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

            // si newDesign == -1 => insertamos el peso standard
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

                // Tras insertar stats, cambiamos expertise
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
        currentValue = 1; // si no hay valor
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

// get_performance_all_teams_season(...) => ya lo tienes, o lo traduces igual

export function getPerformanceAllTeamsSeason(customTeam = false) {
    const races = getRacesDays();
    const firstDay = getFirstDaySeason();
    // Insertamos al principio (0, firstDay, 0)
    races.unshift([0, firstDay, 0]); // similar a insert(0, first_tuple)

    const racesPerformances = [];
    let previous = null;
    for (const raceDay of races) {
        // raceDay => [RaceID, Day, TrackID], en python pilla el day en [1]
        const day = raceDay[1];
        const performances = getPerformanceAllTeams(day, previous, customTeam);
        racesPerformances.push(performances);
        previous = performances;
    }

    const allRaces = getAllRaces();
    return [racesPerformances, allRaces];
}

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

export function getMaxDesign() {
    const val = queryDB(`
        SELECT MAX(DesignID)
        FROM Parts_Designs
        `, 'singleValue');
    return val;
}



