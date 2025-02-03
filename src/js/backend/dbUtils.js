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
