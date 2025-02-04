import countries_abreviations from "./countries.js";

export default class DBUtils {
  /**
   * @param {Function} queryDBFn - Función para ejecutar queries (queryDB).
   * @param {Object} metadata - Objeto de metadatos (si lo necesitas).
   */
  constructor(queryDBFn, metadata) {
    this.queryDB = queryDBFn;
    this.metadata = metadata;
  }

  /**
   * Convierte un color ARGB a hexadecimal.
   */
  argbToHex(argb) {
    const rgb = argb & 0xFFFFFF; // Ignora el canal alfa
    return `#${rgb.toString(16).padStart(6, '0').toUpperCase()}`;
  }

  /**
   * Verifica si el archivo de guardado es de un año específico.
   * @returns {Array} [ "23" o "24", TeamName, primaryColor, secondaryColor ]
   */
  checkYearSave() {
    // Ver si existe la tabla Countries_RaceRecord
    const row = this.queryDB(`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' AND name='Countries_RaceRecord'
    `, 'singleRow');

    if (!row) {
      // No existe la tabla -> asumo que es "23"
      return ["23", null, null, null];
    }

    // Si existe, entonces busco TeamNameLocKey del TeamID=32
    const nameValue = this.queryDB(`
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
      const primaryColorRow = this.queryDB(`
        SELECT Colour
        FROM Teams_Colours
        WHERE TeamID = 32 AND ColourID = 0
      `, 'singleRow');

      const secondaryColorRow = this.queryDB(`
        SELECT Colour
        FROM Teams_Colours
        WHERE TeamID = 32 AND ColourID = 1
      `, 'singleRow');

      if (primaryColorRow) {
        primaryColor = this.argbToHex(primaryColorRow[0]);
      }
      if (secondaryColorRow) {
        secondaryColor = this.argbToHex(secondaryColorRow[0]);
      }
    }

    return ["24", name, primaryColor, secondaryColor];
  }

  fetchNationality(driverID, gameYear) {
    if (gameYear === "24") {
      const countryID = this.queryDB(`
        SELECT CountryID 
        FROM Staff_BasicData 
        WHERE StaffID = ${driverID}
      `, 'singleValue');
      if (!countryID) return "";

      const countryName = this.queryDB(`
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
      const nationality = this.queryDB(`
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

  fetchForFutureContract(driverID) {
    const teamID = this.queryDB(`
      SELECT TeamID 
      FROM Staff_Contracts 
      WHERE StaffID = ${driverID} 
        AND ContractType = 3
    `, 'singleValue');

    return teamID ?? -1;
  }

  fetchEngines() {
    const enginesIds = [1, 10, 4, 7];
    const statsIds = [6, 10, 11, 12, 14];
    const ersIds = [2, 11, 5, 8];
    const gearboxesIds = [3, 12, 6, 9];
    const enginesList = [];

    for (let i = 0; i < enginesIds.length; i++) {
      let resultDict = {};

      // Obtener valores de stats
      for (const stat of statsIds) {
        const statResult = this.queryDB(`
                SELECT PartStat, UnitValue 
                FROM Parts_Designs_StatValues 
                WHERE DesignID = ${enginesIds[i]} AND PartStat = ${stat}
            `, 'singleRow');
        if (statResult) {
          resultDict[statResult[0]] = statResult[1];
        }
      }

      // Obtener valor de ERS
      const ersResult = this.queryDB(`
            SELECT UnitValue 
            FROM Parts_Designs_StatValues 
            WHERE DesignID = ${ersIds[i]} AND PartStat = 15
        `, 'singleValue');
      if (ersResult !== null) {
        resultDict[18] = ersResult;
      }

      // Obtener valor de gearbox
      const gearboxResult = this.queryDB(`
            SELECT UnitValue 
            FROM Parts_Designs_StatValues 
            WHERE DesignID = ${gearboxesIds[i]} AND PartStat = 15
        `, 'singleValue');
      if (gearboxResult !== null) {
        resultDict[19] = gearboxResult;
      }

      // Añadir la información del motor a la lista
      enginesList.push([enginesIds[i], resultDict]);
    }

    return enginesList;
  }


  fetchMentality(staffID) {
    // Obtengo todas las filas (morale es un array de arrays [[opinion],[opinion], ...])
    const morale = this.queryDB(`
      SELECT Opinion
      FROM Staff_Mentality_AreaOpinions
      WHERE StaffID = ${staffID}
    `, 'allRows');

    // Obtengo un solo valor
    const globalMentality = this.queryDB(`
      SELECT Mentality
      FROM Staff_State
      WHERE StaffID = ${staffID}
    `, 'singleValue');

    return [morale, globalMentality];
  }

  checkDrivesForTeam32(staffData) {
    // staffData = [ firstName, lastName, staffID, teamID, posInTeam, minContractType, retired, countContracts ]

    const contractRow = this.queryDB(`
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

  removeNumber(str) {
    if (str && /\d$/.test(str)) {
      return str.slice(0, -1);
    }
    return str;
  }

  formatNamesAndFetchStats(nameData, type) {
    // nameData: [ FirstName, LastName, StaffID, teamId, positionInTeam, minContractType, retired, countContracts ]
    let firstName = "";
    let lastName = "";

    // Extract firstName
    if (!nameData[0].includes("STRING_LITERAL")) {
      const m = nameData[0].match(/StaffName_Forename_(?:Male|Female)_(\w+)/);
      firstName = m ? this.removeNumber(m[1]) : "";
    } else {
      const m = nameData[0].match(/\|([^|]+)\|/);
      firstName = m ? m[1] : "";
    }

    // Extract lastName
    if (!nameData[1].includes("STRING_LITERAL")) {
      const m = nameData[1].match(/StaffName_Surname_(\w+)/);
      lastName = m ? this.removeNumber(m[1]) : "";
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
      const statsRows = this.queryDB(`
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

      const extraRow = this.queryDB(`
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
      const statsRows = this.queryDB(`
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

  fetchDriverRetirement(driverID) {
    const playerRow = this.queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');

    let day = 0, currentSeason = 0;
    if (playerRow) {
      [day, currentSeason] = playerRow;
    } else {
      console.warn("No se encontraron datos en Player_State.");
    }

    const retirementAge = this.queryDB(`
      SELECT RetirementAge
      FROM Staff_GameData
      WHERE StaffID = ${driverID}
    `, 'singleValue');

    const dob = this.queryDB(`
      SELECT DOB
      FROM Staff_BasicData
      WHERE StaffID = ${driverID}
    `, 'singleValue');

    const age = (dob != null) ? Math.floor((day - dob) / 365.25) : 0;
    return [retirementAge, age];
  }

  fetchDriverCode(driverID) {
    let code = this.queryDB(`
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

  fetchYear() {
    const row = this.queryDB(`
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

  fetchDriverNumberDetails(driverID) {
    let currentNumber = this.queryDB(`
      SELECT Number
      FROM Staff_DriverNumbers
      WHERE CurrentHolder = ${driverID}
    `, 'singleValue');

    if (currentNumber == null) {
      // Si no tiene número, ver si hay libres
      const available = this.queryDB(`
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
    const wantsChampion = this.queryDB(`
      SELECT WantsChampionDriverNumber
      FROM Staff_DriverData
      WHERE StaffID = ${driverID}
    `, 'singleValue');

    return [currentNumber, wantsChampion];
  }

  fetchRaceFormula(driverID) {
    const category = this.queryDB(`
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

  fetchMarketability(driverID) {
    return this.queryDB(`
      SELECT Marketability
      FROM Staff_DriverData
      WHERE StaffID = ${driverID}
    `, 'singleValue');
  }

  fetchSuperlicense(driverID) {
    return this.queryDB(`
      SELECT HasSuperLicense
      FROM Staff_DriverData
      WHERE StaffID = ${driverID}
    `, 'singleValue');
  }

  fetchDrivers(gameYear) {
    const rows = this.queryDB(`
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
        driver = this.checkDrivesForTeam32(driver);
      }

      const driverID = driver[2];

      // Ignoramos placeholders
      if (driver[0] === "Placeholder") {
        continue;
      }

      // Format + stats
      const result = this.formatNamesAndFetchStats(driver, "driver");

      // Extra info
      const [retirementAge, age] = this.fetchDriverRetirement(driverID);
      let raceFormula = this.fetchRaceFormula(driverID) || 4;
      const [driverNumber, wants1] = this.fetchDriverNumberDetails(driverID);
      const superlicense = this.fetchSuperlicense(driverID);
      const futureTeam = this.fetchForFutureContract(driverID);
      const driverCode = this.fetchDriverCode(driverID);
      const nationality = this.fetchNationality(driverID, gameYear);

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
        const [morale, gMentality] = this.fetchMentality(driverID);
        data.global_mentality = gMentality ?? null;

        // morale es array de arrays. Ejemplo: [ [op1], [op2], [op3] ]
        if (morale.length >= 3) {
          data.mentality0 = morale[0][0];
          data.mentality1 = morale[1][0];
          data.mentality2 = morale[2][0];
        }

        const market = this.fetchMarketability(driverID);
        data.marketability = market ?? 0;
      }

      formattedData.push(data);
    }

    return formattedData;
  }

  fetchStaff(gameYear) {
    const rows = this.queryDB(`
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
      const result = this.formatNamesAndFetchStats(staff, staffType);

      const [retirementAge, age] = this.fetchDriverRetirement(staffID);
      let raceFormula = this.fetchRaceFormula(staffID) || 4;
      const futureTeam = this.fetchForFutureContract(staffID);
      const nationality = this.fetchNationality(staffID, gameYear);

      const data = { ...result };
      data.retirement_age = retirementAge;
      data.age = age;
      data.race_formula = raceFormula;
      data.team_future = futureTeam;
      data.nationality = nationality;

      if (gameYear === "24") {
        const [morale, gMentality] = this.fetchMentality(staffID);
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

  fetchDriversPerYear(year) {
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
    const drivers = this.queryDB(sql, 'allRows') || [];

    // Formateamos cada fila como quieras (equivalente a "format_names_simple")
    const formattedTuples = drivers.map(row => this.formatNamesSimple(row));

    return formattedTuples;
  }

  formatNamesSimple(name) {
    let nombre = "";
    let apellido = "";

    // Si no contiene "STRING_LITERAL", buscamos "StaffName_Forename_(Male|Female)_(...)".
    if (!name[0].includes("STRING_LITERAL")) {
      const nombrePattern = /StaffName_Forename_(Male|Female)_(\w+)/;
      const match = name[0].match(nombrePattern);
      if (match) {
        // Asumiendo que tienes un método removeNumber similar al de Python
        nombre = this.removeNumber(match[2]);
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
        apellido = this.removeNumber(match[1]);
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

  fetchOneTeamSeasonResults(team, year) {
    const teamID = team;
    const season = year;
    const drivers = this.queryDB(` SELECT DISTINCT DriverID
       FROM Races_Results
       WHERE Season = ${season}
       AND TeamID = ${teamID} `,
       'allRows') || [];

    const results = [];
    for (let driver of drivers) {
      const driverID = driver[0];
      const driverResults = this.fetchOneDriverSeasonResults(driverID, season);
      console.log(driverResults);
      if (driverResults) {
        results.push(driverResults);
      }
    }

    return results;
  }

  fetchOneDriverSeasonResults(driver, year) {
    const driverID = driver;
    const season = year;

    const results = this.queryDB(`
      SELECT DriverID, TeamID, FinishingPos, Points
      FROM Races_Results
      WHERE Season = ${season}
        AND DriverID = ${driverID}
    `, 'allRows') || [];

    if (results.length > 0) {
      const sprintResults = this.queryDB(`
        SELECT RaceID, FinishingPos, ChampionshipPoints
        FROM Races_SprintResults
        WHERE SeasonID = ${season}
          AND DriverID = ${driverID}
      `, 'allRows') || [];


      const teamID = results[0][1];

      const driverNameRow = this.queryDB(`
        SELECT FirstName, LastName
        FROM Staff_BasicData
        WHERE StaffID = ${driverID}
      `, 'singleRow');

      return this.formatSeasonResults(
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

  fetchEventsDoneFrom(year) {
    const daySeasonRow = this.queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');
  
    if (!daySeasonRow) {
      return [];
    }
    const [currentDay, currentSeason] = daySeasonRow;
  
    const seasonIdsRows = this.queryDB(`
      SELECT RaceID
      FROM Races
      WHERE SeasonID = ${year}
        AND Day < ${currentDay}
    `, 'allRows') || [];
  

    const eventsIds = seasonIdsRows.map(row => row[0]);
  
    return eventsIds;
  }
  
  fetchEventsFrom(year) {
    const seasonEventsRows = this.queryDB(`
      SELECT TrackID
      FROM Races
      WHERE SeasonID = ${year}
    `, 'allRows') || [];
  
    const seasonIdsRows = this.queryDB(`
      SELECT RaceID
      FROM Races
      WHERE SeasonID = ${year}
    `, 'allRows') || [];
  

    const eventsIds = [];
    for (let i = 0; i < seasonIdsRows.length; i++) {
      const raceID  = seasonIdsRows[i][0];
      const trackID = seasonEventsRows[i][0];
      eventsIds.push([raceID, trackID]);
    }
  
    return eventsIds;
  }
  

  formatSeasonResults(results, driverName, teamID, driver, year, sprints) {
    // Asumiendo que driver y year son arrays (p.ej. driver=[123], year=[2023]):
    const driverID = driver;
    const season = year;
  
    // -------- 1) Formatear nombre --------
    let nombre = "";
    let apellido = "";
  
    // driverName podría ser un array [firstName, lastName] o un objeto {FirstName, LastName}.
    // Aquí asumimos array. Si tu queryDB retorna objetos, ajusta a driverName.FirstName, driverName.LastName.
    const firstName = driverName ? driverName[0] : "";
    const lastName  = driverName ? driverName[1] : "";
  
    // Lógica análoga a Python para "STRING_LITERAL"
    if (!firstName.includes("STRING_LITERAL")) {
      const nombrePattern = /StaffName_Forename_(Male|Female)_(\w+)/;
      const match = firstName.match(nombrePattern);
      if (match) {
        nombre = this.removeNumber(match[2]);  // asumiendo que tienes un removeNumber
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
        apellido = this.removeNumber(match[1]);
      } else {
        apellido = "";
      }
    } else {
      const pattern = /\|([^|]+)\|/;
      const match = lastName.match(pattern);
      apellido = match ? match[1] : "";
    }
  
    const nameFormatted = `${nombre} ${apellido}`.trim();
  
    // -------- 2) Obtener todas las carreras que corrió este piloto en la temporada --------
    const racesParticipated = this.queryDB(`
      SELECT RaceID
      FROM Races_Results
      WHERE DriverID = ${driverID}
        AND Season = ${season}
    `, 'allRows') || [];
  
    // results = array con [DriverID, TeamID, FinishingPos, Points]
    // Queremos convertirlo en algo más detallado. 
    // De Python: formatred_results = [(FinishingPos, Points) for result in results]
    // Pero necesitamos mapear 1:1 con la lista de RaceIDs, así que iremos uno a uno.
    let formatredResults = results.map(r => [r[2], r[3]]); 
    // r[2] => FinishingPos, r[3] => Points.
  
    // Suponiendo que hay la misma cantidad y el mismo orden de carreras 
    // entre "results" y "racesParticipated". 
    // Si no, necesitarías hacer matching por RaceID. 
    // En tu Python original, tomabas RaceIDs en order y reasignabas. 
    // Asegurémonos de usar el RaceID de 'racesParticipated[i]' igual que Python.
  
    for (let i = 0; i < racesParticipated.length; i++) {
      const raceID = racesParticipated[i][0]; // Cada fila es [RaceID]
  
      // 2.1) Buscamos quién hizo la fastest lap
      const driverWithFastestLap = this.queryDB(`
        SELECT DriverID
        FROM Races_Results
        WHERE FastestLap > 0
          AND RaceID = ${raceID}
          AND Season = ${season}
        ORDER BY FastestLap
        LIMIT 1
      `, 'singleValue');
  
      // 2.2) Checamos si fue DNF
      const dnfd = this.queryDB(`
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
  
      // Marcar fastest lap
      if (driverWithFastestLap === driverID) {
        // le append "1"
        formatredResults[i].push(1);
      } else {
        // le append "0"
        formatredResults[i].push(0);
      }
  
      // 2.3) Quali Stage & FinishingPos
      const QStage = this.queryDB(`
        SELECT MAX(QualifyingStage)
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID = ${driverID}
      `, 'singleValue') || 0;
  
      const QRes = this.queryDB(`
        SELECT FinishingPos
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID = ${driverID}
          AND QualifyingStage = ${QStage}
      `, 'singleValue') || 99;
  
      // 2.4) Cálculo de diferencias de tiempo (carrera y pole)
      const timeDifference = this.calculateTimeDifference(driverID, raceID);
      const poleDifference = this.calculateTimeToPole(driverID, raceID);
  
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
      const teamInRace = this.queryDB(`
        SELECT TeamID
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND DriverID = ${driverID}
      `, 'singleValue') || 0;
  
      formatredResults[i].push(teamInRace);
      latestTeam = teamInRace;
    }
  
    // -------- 5) Agregar la posición final en el campeonato al inicio --------
    const position = this.queryDB(`
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
  
  calculateTimeToPole(driverID, raceID) {
    const QStage = this.queryDB(`
      SELECT MAX(QualifyingStage)
      FROM Races_QualifyingResults
      WHERE RaceFormula = 1
        AND RaceID = ${raceID}
        AND DriverID = ${driverID}
    `, 'singleValue') || 0;
  
    const poleTime = this.queryDB(`
      SELECT MIN(FastestLap)
      FROM Races_QualifyingResults
      WHERE RaceFormula = 1
        AND RaceID = ${raceID}
        AND QualifyingStage = 3
        AND FastestLap IS NOT 0
    `, 'singleValue') || 9999;
  
    const driverTime = this.queryDB(`
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
  
  calculateTimeDifference(driverID, raceID) {
    const totalLaps = this.queryDB(`
      SELECT MAX(Laps)
      FROM Races_Results
      WHERE RaceID = ${raceID}
    `, 'singleValue') || 0;
  
    const driverLaps = this.queryDB(`
      SELECT Laps
      FROM Races_Results
      WHERE RaceID = ${raceID}
        AND DriverID = ${driverID}
    `, 'singleValue') || 0;
  
    if (driverLaps < totalLaps) {
      return `+${totalLaps - driverLaps} L`;
    } else {
      const winnerID = this.queryDB(`
        SELECT DriverID
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND FinishingPos = 1
      `, 'singleValue');
  
      const winnerTime = this.queryDB(`
        SELECT Time
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND DriverID = ${winnerID}
      `, 'singleValue') || 0;
  
      const driverTime = this.queryDB(`
        SELECT Time
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND DriverID = ${driverID}
      `, 'singleValue') || 0;
  
      const timeDiff = Number((driverTime - winnerTime).toFixed(1));
      return `+${timeDiff}s`;
    }
  }
  




  fetchCalendar() {
    // Saco [ Day, CurrentSeason ] de Player_State
    const daySeason = this.queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');

    if (!daySeason) {
      console.warn("No data found in Player_State.");
      return [];
    }

    const [day, currentSeason] = daySeason;

    // Saco el calendario
    const calendar = this.queryDB(`
      SELECT TrackID, WeatherStatePractice, WeatherStateQualifying, WeatherStateRace, WeekendType, State
      FROM Races
      WHERE SeasonID = ${currentSeason}
    `, 'allRows');

    return calendar;
  }

  fetchDriverNumbers() {
    const numbers = this.queryDB(`SELECT DISTINCT Number
       FROM Staff_DriverNumbers dn 
       JOIN Staff_Contracts con 
       ON dn.CurrentHolder = con.StaffID 
       WHERE dn.CurrentHolder IS NULL OR con.PosInTeam > 2`, 'allRows');

    return numbers.map(n => n[0]);
  }

  fetchDriverContract(id) {
    // Obtener el contrato actual
    const currentContract = this.queryDB(`
        SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos, TeamID
        FROM Staff_Contracts
        WHERE ContractType = 0 AND StaffID = ${id}
    `, 'singleRow');

    // Obtener el contrato futuro
    const futureContract = this.queryDB(`
        SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos, PosInTeam, TeamID
        FROM Staff_Contracts
        WHERE ContractType = 3 AND StaffID = ${id}
    `, 'singleRow');

    // Obtener el día y la temporada actual
    const daySeason = this.queryDB(`
        SELECT Day, CurrentSeason
        FROM Player_State
    `, 'singleRow');

    // Retornar los resultados
    return [currentContract, futureContract, daySeason ? daySeason[1] : null];
  }
}
