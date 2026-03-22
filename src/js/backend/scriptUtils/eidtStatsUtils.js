import { queryDB } from "../dbManager";
import { inverted_countries_abreviations } from "./countries.js";

// Constantes para referencias en la edición de mentalidad
export const driverStats = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export const mentalityAreas = {
  0: [5, 11, 13, 9],
  1: [0, 2, 6, 7, 8, 14],
  2: [1, 3, 4, 12, 10]
};

export const mentalityEvents = {
  0: [1, 7, 10, 13, 15, 19],
  1: [2, 11, 12, 14, 16, 20, 21],
  2: [0, 3, 4, 5, 6, 8, 9, 17, 18]
};

export const mentalityOpinions = {
  0: 10,
  1: 3,
  2: 0,
  3: -4,
  4: -10
};

export const mentalityOverall = {
  0: 95,
  1: 79,
  2: 59,
  3: 24,
  4: 5
};

// Editar estadísticas de un Staff (driver o staff general)
export function editStats(driverID, type, stats, retirement, driverNum, wants1) {
  //creat sttasParasm from stats string to an array
  const statsParams = stats.split(" ");


  if (type === "0") {
    const isStats = queryDB(`
      SELECT *
      FROM Staff_performanceStats
      WHERE StaffID = ?
    `, [driverID], 'singleRow');

    if (isStats) {
      queryDB(`
        UPDATE Staff_performanceStats
        SET Val = CASE StatID
          WHEN 2  THEN ?
          WHEN 3  THEN ?
          WHEN 4  THEN ?
          WHEN 5  THEN ?
          WHEN 6  THEN ?
          WHEN 7  THEN ?
          WHEN 8  THEN ?
          WHEN 9  THEN ?
          WHEN 10 THEN ?
          ELSE Val
        END
        WHERE StaffID = ?
      `, [
        statsParams[0],
        statsParams[1],
        statsParams[2],
        statsParams[3],
        statsParams[4],
        statsParams[5],
        statsParams[6],
        statsParams[7],
        statsParams[8],
        driverID
      ], 'run');
    } else {
      const statsArray = statsParams.slice(2, 11);
      statsArray.forEach((newStat, i) => {
        const statID = driverStats[i];
        queryDB(`
          INSERT INTO Staff_performanceStats (StaffID, StatID, Val, Max)
          VALUES (?, ?, ?, 100)
        `, [driverID, statID, newStat], 'run');
      });
    }
    queryDB(`
      UPDATE Staff_DriverData
      SET Improvability = ?, Aggression = ?
      WHERE StaffID = ?
    `, [statsParams[9], statsParams[10], driverID], 'run');
    queryDB(`
      UPDATE Staff_GameData
      SET RetirementAge = ?
      WHERE StaffID = ?
    `, [retirement, driverID], 'run');

    changeDriverNumber(driverID, driverNum);

    queryDB(`
      UPDATE Staff_DriverData
      SET WantsChampionDriverNumber = ?
      WHERE StaffID = ?
    `, [wants1, driverID], 'run');
  }
  else if (type === "1") {
    queryDB(`
      UPDATE Staff_performanceStats
      SET Val = CASE StatID
        WHEN 0  THEN ?
        WHEN 1  THEN ?
        WHEN 14 THEN ?
        WHEN 15 THEN ?
        WHEN 16 THEN ?
        WHEN 17 THEN ?
        ELSE Val
      END
      WHERE StaffID = ?
    `, [
        statsParams[0],
        statsParams[1],
        statsParams[2],
        statsParams[3],
        statsParams[4],
        statsParams[5],
        driverID
    ], 'run');
    queryDB(`
      UPDATE Staff_GameData
      SET RetirementAge = ?
      WHERE StaffID = ?
    `, [retirement, driverID], 'run');
  }
  else if (type === "2") {
    queryDB(`
      UPDATE Staff_performanceStats
      SET Val = CASE StatID
        WHEN 13 THEN ?
        WHEN 25 THEN ?
        WHEN 43 THEN ?
        ELSE Val
      END
      WHERE StaffID = ?
    `, [
        statsParams[0],
        statsParams[1],
        statsParams[2],
        driverID
    ], 'run');
    queryDB(`
      UPDATE Staff_GameData
      SET RetirementAge = ?
      WHERE StaffID = ?
    `, [retirement, driverID], 'run');
  }
  else if (type === "3") {
    queryDB(`
      UPDATE Staff_performanceStats
      SET Val = CASE StatID
        WHEN 19 THEN ?
        WHEN 20 THEN ?
        WHEN 26 THEN ?
        WHEN 27 THEN ?
        WHEN 28 THEN ?
        WHEN 29 THEN ?
        WHEN 30 THEN ?
        WHEN 31 THEN ?
        ELSE Val
      END
      WHERE StaffID = ?
    `, [
        statsParams[0],
        statsParams[1],
        statsParams[2],
        statsParams[3],
        statsParams[4],
        statsParams[5],
        statsParams[6],
        statsParams[7],
        driverID
    ], 'run');
    queryDB(`
      UPDATE Staff_GameData
      SET RetirementAge = ?
      WHERE StaffID = ?
    `, [retirement, driverID], 'run');
  }
  else if (type === "4") {
    queryDB(`
      UPDATE Staff_performanceStats
      SET Val = CASE StatID
        WHEN 11 THEN ?
        WHEN 22 THEN ?
        WHEN 23 THEN ?
        WHEN 24 THEN ?
        ELSE Val
      END
      WHERE StaffID = ?
    `, [
        statsParams[0],
        statsParams[1],
        statsParams[2],
        statsParams[3],
        driverID
    ], 'run');
    queryDB(`
      UPDATE Staff_GameData
      SET RetirementAge = ?
      WHERE StaffID = ?
    `, [retirement, driverID], 'run');
  }
}

export function changeDriverNumber(driverID, newNumber) {
  const oldNum = queryDB(`
    SELECT Number
    FROM Staff_DriverNumbers
    WHERE CurrentHolder = ?
  `, [driverID], 'singleValue');
  if (oldNum) {
    queryDB(`
      UPDATE Staff_DriverNumbers
      SET CurrentHolder = NULL
      WHERE Number = ?
    `, [oldNum], 'run');
  }
  const oldHolderOfNum = queryDB(`
    SELECT CurrentHolder
    FROM Staff_DriverNumbers
    WHERE Number = ?
  `, [newNumber], 'singleValue');
  if (oldHolderOfNum) {
    const emptyNumbers = queryDB(`
      SELECT Number FROM Staff_DriverNumbers 
      WHERE CurrentHolder IS NULL
    `, [], 'allRows');
    if (emptyNumbers.length) {
      const randomNum = emptyNumbers[Math.floor(Math.random() * emptyNumbers.length)][0];

      queryDB(`
        UPDATE Staff_DriverNumbers SET CurrentHolder = ? WHERE Number = ?
      `, [oldHolderOfNum, randomNum], 'run');
    }
  }
  queryDB(`
    UPDATE Staff_DriverNumbers
    SET CurrentHolder = ?
    WHERE Number = ?
  `, [driverID, newNumber], 'run');
}

export function editName(driverID, newName) {
  const parts = newName.split(" ");
  const newFirstName = parts[0];
  const newLastName = parts.slice(1).join(" ");
  const stringLiteralFirstName = `[STRING_LITERAL:Value=|${newFirstName}|]`;
  const stringLiteralLastName = `[STRING_LITERAL:Value=|${newLastName}|]`;
  queryDB(`
    UPDATE Staff_BasicData
    SET FirstName = ?,
        LastName = ?
    WHERE StaffID = ?
  `, [stringLiteralFirstName, stringLiteralLastName, driverID], 'run');
}

export function editCode(driverID, newCode) {
  const stringLiteralCode = `[STRING_LITERAL:Value=|${newCode}|]`;
  queryDB(`
    UPDATE Staff_DriverData
    SET DriverCode = ?
    WHERE StaffID = ?
  `, [stringLiteralCode, driverID], 'run');
}

function fetchCountryIdFromNationalityCode(codeRaw) {
  const code = String(codeRaw || "").trim().toUpperCase();
  if (!code) return null;

  const nationalityName = inverted_countries_abreviations[code] || "";
  if (!nationalityName) return null;

  const key = nationalityName.replace(/\s+/g, "");
  return queryDB(`
    SELECT CountryID
    FROM Countries
    WHERE Name LIKE ?
    LIMIT 1
  `, [`%[Nationality_${key}]%`], 'singleValue');
}

export function editGeneratedStaffBasicData(driverID, countryId, nationalityCode, faceType, faceIndex, ageType) {
  const resolvedCountryId = fetchCountryIdFromNationalityCode(nationalityCode) ?? countryId;

  if (resolvedCountryId === "" || resolvedCountryId === null || resolvedCountryId === undefined) {
    queryDB(`
    UPDATE Staff_BasicData
    SET FaceType = ?,
        FaceIndex = ?,
        AgeType = ?
    WHERE StaffID = ?
  `, [faceType, faceIndex, ageType, driverID], 'run');
    return;
  }

  queryDB(`
    UPDATE Staff_BasicData
    SET CountryID = ?,
        FaceType = ?,
        FaceIndex = ?,
        AgeType = ?
    WHERE StaffID = ?
  `, [resolvedCountryId, faceType, faceIndex, ageType, driverID], 'run');
}

// Helpers de fechas
export function excelToDate(excelDate) {
  const baseUTC = Date.UTC(1899, 11, 30); // 1899-12-30 UTC
  return new Date(baseUTC + excelDate * 86400000);
}

export function dateToExcel(date) {
  const baseUTC = Date.UTC(1899, 11, 30);
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((utcMidnight - baseUTC) / 86400000);
}

export function excelFromYMD(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  return dateToExcel(d);
}

export function changeYearsInExcelDate(excelDate, years) {
  const oldDate = excelToDate(excelDate);
  let newYear = oldDate.getFullYear() + years;
  let newDate = new Date(oldDate.getTime());
  newDate.setFullYear(newYear);
  if (newDate.getMonth() !== oldDate.getMonth()) {
    newDate = new Date(newYear, 1, 28);
  }
  const newExcelDate = dateToExcel(newDate);
  return { newDate, newExcelDate };
}

export function editAge(driverID, ageGap) {
  const driverBirthdate = queryDB(`
    SELECT DOB
    FROM Staff_BasicData
    WHERE StaffID = ?
  `, [driverID], 'singleValue');
  const { newDate, newExcelDate } = changeYearsInExcelDate(driverBirthdate, parseInt(ageGap, 10));
  const y = newDate.getFullYear();
  const m = newDate.getMonth() + 1;
  const d = newDate.getDate();
  queryDB(`
    UPDATE Staff_BasicData
    SET DOB = ?,
        DOB_ISO = ?
    WHERE StaffID = ?
  `, [newExcelDate, `${y}-${m}-${d}`, driverID], 'run');
}

export function editMentality(driverID, mentalityStr) {
  if (mentalityStr !== -1) {
    const mentalityArray = mentalityStr.split(" ");
    let sum = 0;
    mentalityArray.forEach((value, area) => {
      queryDB(`
      UPDATE Staff_Mentality_AreaOpinions
      SET Opinion = ?
      WHERE StaffID = ?
        AND Category = ?
    `, [value, driverID, area], 'run');
      const statuses = mentalityAreas[area];
      const events = mentalityEvents[area];
      sum += parseInt(value, 10);
      statuses.forEach(status => {
        queryDB(`
        UPDATE Staff_Mentality_Statuses
        SET Opinion = ?,
            Value = ?
        WHERE StaffID = ?
          AND Status = ?
      `, [value, mentalityOpinions[value], driverID, status], 'run');
      });
      events.forEach(ev => {
        queryDB(`
        UPDATE Staff_Mentality_Events
        SET Opinion = ?,
            Value = ?
        WHERE StaffID = ?
          AND Event = ?
      `, [value, mentalityOpinions[value], driverID, ev], 'run');
      });
    });
    const average = Math.floor(sum / 3);
    queryDB(`
    UPDATE Staff_State
    SET Mentality = ?,
        MentalityOpinion = ?
    WHERE StaffID = ?
  `, [mentalityOverall[average], average, driverID], 'run');
  }
}

export function editRetirement(driverID, value) {
  queryDB(`
    UPDATE Staff_GameData
    SET Retired = ?
    WHERE StaffID = ?
  `, [value, driverID], 'run');
}

export function editSuperlicense(driverID, value) {
  queryDB(`
    UPDATE Staff_DriverData
    SET HasSuperLicense = ?,
        HasRacedEnoughToJoinF1 = ?
    WHERE StaffID = ?
  `, [value, value, driverID], 'run');
}

export function editMarketability(driverID, value) {
  queryDB(`
    UPDATE Staff_DriverData
    SET Marketability = ?
    WHERE StaffID = ?
  `, [value, driverID], 'run');
}

export function setAllDriversStatsTo85() {
  queryDB(`
    UPDATE Staff_performanceStats
    SET Val = 85
    WHERE StaffID IN (SELECT StaffID FROM Staff_DriverData)
  `, [], 'run');
}
