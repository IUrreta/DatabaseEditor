import { queryDB } from "../dbManager";

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
      WHERE StaffID = ${driverID}
    `, 'singleRow');

    if (isStats) {
      queryDB(`
        UPDATE Staff_performanceStats
        SET Val = CASE StatID
          WHEN 2  THEN ${statsParams[0]}
          WHEN 3  THEN ${statsParams[1]}
          WHEN 4  THEN ${statsParams[2]}
          WHEN 5  THEN ${statsParams[3]}
          WHEN 6  THEN ${statsParams[4]}
          WHEN 7  THEN ${statsParams[5]}
          WHEN 8  THEN ${statsParams[6]}
          WHEN 9  THEN ${statsParams[7]}
          WHEN 10 THEN ${statsParams[8]}
          ELSE Val
        END
        WHERE StaffID = ${driverID}
      `);
    } else {
      const statsArray = statsParams.slice(2, 11);
      statsArray.forEach((newStat, i) => {
        const statID = driverStats[i];
        queryDB(`
          INSERT INTO Staff_performanceStats (StaffID, StatID, Val, Max)
          VALUES (${driverID}, ${statID}, ${newStat}, 100)
        `);
      });
    }
    queryDB(`
      UPDATE Staff_DriverData
      SET Improvability = ${statsParams[9]}, Aggression = ${statsParams[10]}
      WHERE StaffID = ${driverID}
    `);
    queryDB(`
      UPDATE Staff_GameData
      SET RetirementAge = ${retirement}
      WHERE StaffID = ${driverID}
    `);

    changeDriverNumber(driverID, driverNum);
    
    queryDB(`
      UPDATE Staff_DriverData
      SET WantsChampionDriverNumber = ${wants1}
      WHERE StaffID = ${driverID}
    `);
  }
  else if (type === "1") {
    queryDB(`
      UPDATE Staff_performanceStats
      SET Val = CASE StatID
        WHEN 0  THEN ${statsParams[0]}
        WHEN 1  THEN ${statsParams[1]}
        WHEN 14 THEN ${statsParams[2]}
        WHEN 15 THEN ${statsParams[3]}
        WHEN 16 THEN ${statsParams[4]}
        WHEN 17 THEN ${statsParams[5]}
        ELSE Val
      END
      WHERE StaffID = ${driverID}
    `);
    queryDB(`
      UPDATE Staff_GameData
      SET RetirementAge = ${retirement}
      WHERE StaffID = ${driverID}
    `);
  }
  else if (type === "2") {
    queryDB(`
      UPDATE Staff_performanceStats
      SET Val = CASE StatID
        WHEN 13 THEN ${statsParams[0]}
        WHEN 25 THEN ${statsParams[1]}
        WHEN 43 THEN ${statsParams[2]}
        ELSE Val
      END
      WHERE StaffID = ${driverID}
    `);
    queryDB(`
      UPDATE Staff_GameData
      SET RetirementAge = ${retirement}
      WHERE StaffID = ${driverID}
    `);
  }
  else if (type === "3") {
    queryDB(`
      UPDATE Staff_performanceStats
      SET Val = CASE StatID
        WHEN 19 THEN ${statsParams[0]}
        WHEN 20 THEN ${statsParams[1]}
        WHEN 26 THEN ${statsParams[2]}
        WHEN 27 THEN ${statsParams[3]}
        WHEN 28 THEN ${statsParams[4]}
        WHEN 29 THEN ${statsParams[5]}
        WHEN 30 THEN ${statsParams[6]}
        WHEN 31 THEN ${statsParams[7]}
        ELSE Val
      END
      WHERE StaffID = ${driverID}
    `);
    queryDB(`
      UPDATE Staff_GameData
      SET RetirementAge = ${retirement}
      WHERE StaffID = ${driverID}
    `);
  }
  else if (type === "4") {
    queryDB(`
      UPDATE Staff_performanceStats
      SET Val = CASE StatID
        WHEN 11 THEN ${statsParams[0]}
        WHEN 22 THEN ${statsParams[1]}
        WHEN 23 THEN ${statsParams[2]}
        WHEN 24 THEN ${statsParams[3]}
        ELSE Val
      END
      WHERE StaffID = ${driverID}
    `);
    queryDB(`
      UPDATE Staff_GameData
      SET RetirementAge = ${retirement}
      WHERE StaffID = ${driverID}
    `);
  }
}

export function changeDriverNumber(driverID, newNumber) {
  const oldNum = queryDB(`
    SELECT Number
    FROM Staff_DriverNumbers
    WHERE CurrentHolder = ${driverID}
  `, 'singleValue');
  if (oldNum) {
    queryDB(`
      UPDATE Staff_DriverNumbers
      SET CurrentHolder = NULL
      WHERE Number = ${oldNum}
    `);
  }
  const oldHolderOfNum = queryDB(`
    SELECT CurrentHolder
    FROM Staff_DriverNumbers
    WHERE Number = ${newNumber}
  `, 'singleValue');
  if (oldHolderOfNum) {
    const emptyNumbers = queryDB(`
      SELECT Number FROM Staff_DriverNumbers 
      WHERE CurrentHolder IS NULL
    `, 'allRows');
    if (emptyNumbers.length) {
      const randomNum = emptyNumbers[Math.floor(Math.random() * emptyNumbers.length)][0];

      queryDB(`
        UPDATE Staff_DriverNumbers SET CurrentHolder = ${oldHolderOfNum} WHERE Number = ${randomNum}
      `);
    }
  }
  queryDB(`
    UPDATE Staff_DriverNumbers
    SET CurrentHolder = ${driverID}
    WHERE Number = ${newNumber}
  `);
}

export function editName(driverID, newName) {
  const parts = newName.split(" ");
  const newFirstName = parts[0];
  const newLastName = parts.slice(1).join(" ");
  const stringLiteralFirstName = `[STRING_LITERAL:Value=|${newFirstName}|]`;
  const stringLiteralLastName = `[STRING_LITERAL:Value=|${newLastName}|]`;
  queryDB(`
    UPDATE Staff_BasicData
    SET FirstName = '${stringLiteralFirstName}',
        LastName = '${stringLiteralLastName}'
    WHERE StaffID = ${driverID}
  `);
}

export function editCode(driverID, newCode) {
  const stringLiteralCode = `[STRING_LITERAL:Value=|${newCode}|]`;
  queryDB(`
    UPDATE Staff_DriverData
    SET DriverCode = '${stringLiteralCode}'
    WHERE StaffID = ${driverID}
  `);
}

// Helpers de fechas
export function excelToDate(excelDate) {
  const baseDate = new Date(1899, 11, 30);
  const ms = excelDate * 86400000;
  return new Date(baseDate.getTime() + ms);
}

export function dateToExcel(date) {
  const baseDate = new Date(1899, 11, 30);
  const diff = date.getTime() - baseDate.getTime();
  return Math.floor(diff / 86400000);
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
    WHERE StaffID = ${driverID}
  `, 'singleValue');
  const { newDate, newExcelDate } = changeYearsInExcelDate(driverBirthdate, parseInt(ageGap, 10));
  const y = newDate.getFullYear();
  const m = newDate.getMonth() + 1;
  const d = newDate.getDate();
  queryDB(`
    UPDATE Staff_BasicData
    SET DOB = ${newExcelDate},
        DOB_ISO = '${y}-${m}-${d}'
    WHERE StaffID = ${driverID}
  `);
}

export function editMentality(inputStr) {
  const [driverID, ...rest] = inputStr.split(" ");
  let sum = 0;
  rest.forEach((value, area) => {
    queryDB(`
      UPDATE Staff_Mentality_AreaOpinions
      SET Opinion = ${value}
      WHERE StaffID = ${driverID}
        AND Category = ${area}
    `);
    const statuses = mentalityAreas[area];
    const events = mentalityEvents[area];
    sum += parseInt(value, 10);
    statuses.forEach(status => {
      queryDB(`
        UPDATE Staff_Mentality_Statuses
        SET Opinion = ${value},
            Value = ${mentalityOpinions[value]}
        WHERE StaffID = ${driverID}
          AND Status = ${status}
      `);
    });
    events.forEach(ev => {
      queryDB(`
        UPDATE Staff_Mentality_Events
        SET Opinion = ${value},
            Value = ${mentalityOpinions[value]}
        WHERE StaffID = ${driverID}
          AND Event = ${ev}
      `);
    });
  });
  const average = Math.floor(sum / 3);
  queryDB(`
    UPDATE Staff_State
    SET Mentality = ${mentalityOverall[average]},
        MentalityOpinion = ${average}
    WHERE StaffID = ${driverID}
  `);
}

export function editRetirement(driverID, value) {
  queryDB(`
    UPDATE Staff_GameData
    SET Retired = ${value}
    WHERE StaffID = ${driverID}
  `);
}

export function editSuperlicense(driverID, value) {
  queryDB(`
    UPDATE Staff_DriverData
    SET HasSuperLicense = ${value},
        HasRacedEnoughToJoinF1 = ${value}
    WHERE StaffID = ${driverID}
  `);
}

export function editMarketability(driverID, value) {
  queryDB(`
    UPDATE Staff_DriverData
    SET Marketability = ${value}
    WHERE StaffID = ${driverID}
  `);
}

export function editFreezeMentality(state) {
  if (state === 0) {
    queryDB(`DROP TRIGGER IF EXISTS update_Opinion_After_Insert;`);
    queryDB(`DROP TRIGGER IF EXISTS update_Opinion_After_Update;`);
    queryDB(`DROP TRIGGER IF EXISTS clear_Staff_Mentality_Statuses;`);
    queryDB(`DROP TRIGGER IF EXISTS clear_Staff_Mentality_AreaOpinions;`);
    queryDB(`DROP TRIGGER IF EXISTS clear_Staff_Mentality_Events;`);
    queryDB(`DROP TRIGGER IF EXISTS reset_Staff_State;`);
  } else {
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS update_Opinion_After_Insert
      AFTER INSERT ON Staff_Mentality_AreaOpinions
      BEGIN
        UPDATE Staff_Mentality_AreaOpinions
        SET Opinion = 2
        WHERE Opinion != 2;
      END;
    `);
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS update_Opinion_After_Update
      AFTER UPDATE OF Opinion ON Staff_Mentality_AreaOpinions
      BEGIN
        UPDATE Staff_Mentality_AreaOpinions
        SET Opinion = 2
        WHERE Opinion != 2;
      END;
    `);
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS clear_Staff_Mentality_Statuses
      AFTER INSERT ON Staff_Mentality_Statuses
      BEGIN
        DELETE FROM Staff_Mentality_Statuses;
      END;
    `);
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS clear_Staff_Mentality_Events
      AFTER INSERT ON Staff_Mentality_Events
      BEGIN
        DELETE FROM Staff_Mentality_Events;
      END;
    `);
    queryDB(`
      CREATE TRIGGER IF NOT EXISTS reset_Staff_State
      AFTER UPDATE ON Staff_State
      BEGIN
        UPDATE Staff_State
        SET Mentality = 50, MentalityOpinion = 2;
      END;
    `);
  }
}
