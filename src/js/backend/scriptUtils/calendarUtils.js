import { queryDB } from "../dbManager";

const weatherDict = {
  "0": 1,
  "1": 2,
  "2": 4,
  "3": 8,
  "4": 16,
  "5": 32
};

/**
 * Edits the race calendar, either updating existing races or regenerating it with new data.
 * @param {string} calendarStr - String representation of the calendar (e.g., race codes).
 * @param {string} year_iteration - The current year iteration ("23" or "24").
 * @param {Array<Object>} racesData - Array of race objects containing trackId, state, type, weather info, etc.
 */
export function editCalendar(calendarStr, year_iteration, racesData) {
  const calendar = calendarStr.toLowerCase();
  const yearIteration = year_iteration;

  let maxRaces;
  let weeks;

  if (yearIteration === "24") {
    maxRaces = 24;
    weeks = [11, 8, 15, 36, 24, 20, 22, 25, 26, 9, 28, 29, 34, 37, 13, 42, 41, 43, 48, 17, 33, 19, 46, 47];
  } else if (yearIteration === "23") {
    maxRaces = 23;
    weeks = [12, 8, 16, 21, 20, 23, 25, 26, 10, 28, 29, 34, 36, 37, 42, 41, 43, 46, 17, 33, 19, 45, 39];
  } else {
    maxRaces = 0;
    weeks = [];
  }

  const raceBlanks = maxRaces - racesData.length;

  const daySeason = queryDB(`
    SELECT Day, CurrentSeason
    FROM Player_State
  `, 'singleRow');

  let actualCalendar = queryDB(`
    SELECT TrackID
    FROM Races
    WHERE SeasonID = ${daySeason[1]}
  `, 'allRows') || [];

  actualCalendar = actualCalendar.map(row => row[0]);
  // build newCalendar with trackId from each element from the array racesData
  const newCalendar = racesData.map(race => parseInt(race.trackId));

  if (arraysEqual(actualCalendar, newCalendar)) {
    const ids = queryDB(`
      SELECT RaceID
      FROM Races
      WHERE SeasonID = ${daySeason[1]}
    `, 'allRows') || [];
    const raceIDs = ids.map(row => row[0]);

    for (let i = 0; i < racesData.length; i++) {
      const race = racesData[i];
      const state = race.state;
      const format = race.type;
      const rainR = weatherDict[race.rainRace];
      const rainRBool = (parseFloat(rainR) >= 8) ? 1 : 0;
      const rainQ = weatherDict[race.rainQuali];
      const rainQBool = (parseFloat(rainQ) >= 8) ? 1 : 0;
      const rainP = weatherDict[race.rainPractice];
      const rainPBool = (parseFloat(rainP) >= 8) ? 1 : 0;
      // race_code = race.slice(0, -5); // unused in JS version

      queryDB(`
        UPDATE Races
        SET
          RainPractice = ${rainPBool},
          WeatherStatePractice = ${rainP},
          RainQualifying = ${rainQBool},
          WeatherStateQualifying = ${rainQ},
          RainRace = ${rainRBool},
          WeatherStateRace = ${rainR},
          WeekendType = ${format}
        WHERE RaceID = ${raceIDs[i]}
      `);
    }
  } else {
    const randomBlanks = [];
    for (let i = 0; i < raceBlanks; i++) {
      let n = Math.floor(Math.random() * maxRaces);
      while (randomBlanks.includes(n)) {
        n = Math.floor(Math.random() * maxRaces);
      }
      randomBlanks.push(n);
    }

    for (const el of randomBlanks) {
      weeks[el] = 0;
    }

    weeks = weeks.filter(x => x !== 0);
    weeks.sort((a, b) => a - b);



    let leapYearCount = 2;
    const yearDiff = daySeason[1] - 2023;
    leapYearCount += yearDiff;

    let dayStart = 44927 + (yearDiff * 365) + Math.floor(leapYearCount / 4);
    const dayOfWeek = dayStart % 7;
    const daysUntilSunday = (8 - dayOfWeek) % 7;
    dayStart += daysUntilSunday;

    const lastRaceLastSeason = queryDB(`
      SELECT MAX(RaceID)
      FROM Races
      WHERE SeasonID = ${daySeason[1] - 1}
    `, 'singleValue');

    const firstRaceThisSeason = queryDB(`
      SELECT MIN(RaceID)
      FROM Races
      WHERE SeasonID = ${daySeason[1]}
    `, 'singleValue');

    let raceid;
    if (parseInt(lastRaceLastSeason, 10) === (parseInt(firstRaceThisSeason, 10) - 1)) {
      raceid = lastRaceLastSeason;
    } else {
      raceid = firstRaceThisSeason - 1;
    }

    queryDB(`
      DELETE FROM Races
      WHERE State != 2
        AND SeasonID = ${daySeason[1]}
    `);

    for (let i = 0; i < racesData.length; i++) {
      const race = racesData[i];
      const state = race.state;
      const format = race.type;
      const rainR = weatherDict[race.rainRace];
      const rainRBool = (parseFloat(rainR) >= 8) ? 1 : 0;
      const rainQ = weatherDict[race.rainQuali];
      const rainQBool = (parseFloat(rainQ) >= 8) ? 1 : 0;
      const rainP = weatherDict[race.rainPractice];
      const rainPBool = (parseFloat(rainP) >= 8) ? 1 : 0;
      const raceCode = parseInt(race.trackId);

      const temps = queryDB(`
        SELECT TemperatureMin, TemperatureMax
        FROM Races_Templates
        WHERE TrackID = ${raceCode}
      `, 'singleRow');

      const tempP = randomInt(temps[0], temps[1]);
      const tempQ = randomInt(temps[0], temps[1]);
      const tempR = randomInt(temps[0], temps[1]);

      const day = ((weeks[i] + 1) * 7) + dayStart;
      raceid += 1;

      if (state !== "2") {
        queryDB(`
          INSERT INTO Races
          VALUES (
            ${raceid},
            ${daySeason[1]},
            ${day},
            ${raceCode},
            ${state},
            ${rainPBool},
            ${tempP},
            ${rainP},
            ${rainQBool},
            ${tempQ},
            ${rainQ},
            ${rainRBool},
            ${tempR},
            ${rainR},
            ${format}
          )
        `);
      }
    }
  }
}

// Helpers

/**
 * Checks if two arrays are equal.
 * @param {Array} a - First array.
 * @param {Array} b - Second array.
 * @returns {boolean} True if arrays are equal, false otherwise.
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} Random integer.
 */
function randomInt(min, max) {
  const mn = parseInt(min, 10);
  const mx = parseInt(max, 10);
  return Math.floor(Math.random() * (mx - mn + 1)) + mn;
}
