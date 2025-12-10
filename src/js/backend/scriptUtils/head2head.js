import { queryDB } from "../dbManager";

/**
 * Calculates the mean of an array of numbers.
 * @param {Array<number>} arr - The input array.
 * @returns {number} The mean value.
 */
const mean = (arr) => {
  if (!arr.length) return 0;
  const total = arr.reduce((acc, n) => acc + n, 0);
  return total / arr.length;
};

/**
 * Calculates the median of an array of numbers.
 * @param {Array<number>} arr - The input array.
 * @returns {number} The median value.
 */
const median = (arr) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return (sorted.length % 2 === 1)
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Fetches Head-to-Head statistics between two drivers.
 * @param {number} driver1ID - ID of the first driver.
 * @param {number} driver2ID - ID of the second driver.
 * @param {number} year - The season year.
 * @param {boolean} [isCurrentYear=true] - Whether it is the current year.
 * @returns {Array} An array containing various H2H statistics.
 */
export function fetchHead2Head(driver1ID, driver2ID, year, isCurrentYear = true) {

  // 1) Get all races where both drivers participated
  const racesBoth = queryDB(`
      SELECT RaceID
      FROM Races_Results
      WHERE Season = ${year}
        AND DriverID IN (${driver1ID}, ${driver2ID})
      GROUP BY RaceID
      HAVING COUNT(DISTINCT DriverID) = 2
    `, 'allRows') || [];


  const raceIDs = racesBoth.map(row => row[0]);

  const stats = {
    raceH2H: [0, 0],
    qualiH2H: [0, 0],
    dnfH2H: [0, 0],
    podiumsH2H: [0, 0],
    polesH2H: [0, 0],
    winsH2H: [0, 0],
    sprintWinsH2H: [0, 0],

    pointsH2H: null,
    bestRace: null,
    bestQuali: null,
    raceDiffs: null,
    qualiDiffs: null,
    racePositionsMean: null,
    racePositionsMedian: null,
    qualiPositionsMean: null,
    qualiPositionsMedian: null,

    driver1: {
      bestRace: 21,
      bestQuali: 21,
      avgPace: [],
      avgQPace: [],
      RPositions: [],
      QPositions: []
    },
    driver2: {
      bestRace: 21,
      bestQuali: 21,
      avgPace: [],
      avgQPace: [],
      RPositions: [],
      QPositions: []
    }
  };

  // 3) Iterate through each race where both competed
  for (const raceID of raceIDs) {
    const d1_QStage = queryDB(`
        SELECT MAX(QualifyingStage)
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${year}
          AND DriverID = ${driver1ID}
      `, 'singleValue') || 0;

    const d2_QStage = queryDB(`
        SELECT MAX(QualifyingStage)
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${year}
          AND DriverID = ${driver2ID}
      `, 'singleValue') || 0;

    let d1_QRes, d2_QRes;

    if (isCurrentYear) {
      d1_QRes = queryDB(`
        SELECT FinishingPos
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${year}
          AND DriverID = ${driver1ID}
          AND QualifyingStage = ${d1_QStage}
      `, 'singleValue') || 99;

      d2_QRes = queryDB(`
        SELECT FinishingPos
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${year}
          AND DriverID = ${driver2ID}
          AND QualifyingStage = ${d2_QStage}
      `, 'singleValue') || 99;
    } else {
      d1_QRes = queryDB(`SELECT StartingPos FROM Races_Results WHERE RaceID = ${raceID} AND Season = ${year} AND DriverID = ${driver1ID}`, 'singleValue') || 99;
      d2_QRes = queryDB(`SELECT StartingPos FROM Races_Results WHERE RaceID = ${raceID} AND Season = ${year} AND DriverID = ${driver2ID}`, 'singleValue') || 99;
    }

    // --- 3.3) Who won the qualifying duel
    if (d1_QStage < d2_QStage) {
      stats.qualiH2H[1] += 1;
    } else if (d1_QStage > d2_QStage) {
      stats.qualiH2H[0] += 1;
    } else {
      // same qualifying stage
      if (d1_QRes < d2_QRes) {
        stats.qualiH2H[0] += 1;
      } else if (d1_QRes > d2_QRes) {
        stats.qualiH2H[1] += 1;
      }
    }

    // Save quali positions for final statistics
    stats.driver1.QPositions.push(d1_QRes);
    stats.driver2.QPositions.push(d2_QRes);

    // --- 3.4) Fastest lap comparing the same "minimum" stage
    const minStage = Math.min(d1_QStage, d2_QStage);

    const d1_qLap = queryDB(`
        SELECT FastestLap
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${year}
          AND DriverID = ${driver1ID}
          AND QualifyingStage = ${minStage}
      `, 'singleValue') || 0;

    const d2_qLap = queryDB(`
        SELECT FastestLap
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${year}
          AND DriverID = ${driver2ID}
          AND QualifyingStage = ${minStage}
      `, 'singleValue') || 0;

    if (d1_qLap !== 0 && d2_qLap !== 0) {
      stats.driver1.avgQPace.push(d1_qLap);
      stats.driver2.avgQPace.push(d2_qLap);
    }

    // --- 3.5) Poles: Q3 and position 1
    if (d1_QRes === 1 && (!isCurrentYear || d1_QStage === 3)) {
      stats.polesH2H[0] += 1;
    }
    if (d2_QRes === 1 && (!isCurrentYear || d2_QStage === 3)) {
      stats.polesH2H[1] += 1;
    }

    // Best qualifying
    if (d1_QRes < stats.driver1.bestQuali) {
      stats.driver1.bestQuali = d1_QRes;
    }
    if (d2_QRes < stats.driver2.bestQuali) {
      stats.driver2.bestQuali = d2_QRes;
    }

    // --- 3.6) Race results
    const d1_RRes = queryDB(`
        SELECT FinishingPos
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND Season = ${year}
          AND DriverID = ${driver1ID}
      `, 'singleValue') || 99;

    const d2_RRes = queryDB(`
        SELECT FinishingPos
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND Season = ${year}
          AND DriverID = ${driver2ID}
      `, 'singleValue') || 99;

    // Who finished ahead?
    if (d1_RRes < d2_RRes) {
      stats.raceH2H[0] += 1;
    } else if (d1_RRes > d2_RRes) {
      stats.raceH2H[1] += 1;
    }

    // Wins
    if (d1_RRes === 1) stats.winsH2H[0] += 1;
    if (d2_RRes === 1) stats.winsH2H[1] += 1;

    // Podiums
    if (d1_RRes <= 3) stats.podiumsH2H[0] += 1;
    if (d2_RRes <= 3) stats.podiumsH2H[1] += 1;

    // Best race position
    if (d1_RRes < stats.driver1.bestRace) {
      stats.driver1.bestRace = d1_RRes;
    }
    if (d2_RRes < stats.driver2.bestRace) {
      stats.driver2.bestRace = d2_RRes;
    }

    // Save race position
    stats.driver1.RPositions.push(d1_RRes);
    stats.driver2.RPositions.push(d2_RRes);

    // --- 3.7) DNFs
    const d1_RDNF = queryDB(`
        SELECT DNF
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND Season = ${year}
          AND DriverID = ${driver1ID}
      `, 'singleValue') || 0;

    const d2_RDNF = queryDB(`
        SELECT DNF
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND Season = ${year}
          AND DriverID = ${driver2ID}
      `, 'singleValue') || 0;

    if (d1_RDNF === 1) stats.dnfH2H[0] += 1;
    if (d2_RDNF === 1) stats.dnfH2H[1] += 1;

    // --- 3.8) Race pace (avg pace) if no DNF
    if (d1_RDNF !== 1 && d2_RDNF !== 1) {
      const d1_time = queryDB(`
          SELECT Time
          FROM Races_Results
          WHERE RaceID = ${raceID}
            AND Season = ${year}
            AND DriverID = ${driver1ID}
        `, 'singleValue') || 0;

      const d2_time = queryDB(`
          SELECT Time
          FROM Races_Results
          WHERE RaceID = ${raceID}
            AND Season = ${year}
            AND DriverID = ${driver2ID}
        `, 'singleValue') || 0;

      const d1_laps = queryDB(`
          SELECT Laps
          FROM Races_Results
          WHERE RaceID = ${raceID}
            AND Season = ${year}
            AND DriverID = ${driver1ID}
        `, 'singleValue') || 1;

      const d2_laps = queryDB(`
          SELECT Laps
          FROM Races_Results
          WHERE RaceID = ${raceID}
            AND Season = ${year}
            AND DriverID = ${driver2ID}
        `, 'singleValue') || 1;

      const d1_pace = Number((d1_time / d1_laps).toFixed(3));
      const d2_pace = Number((d2_time / d2_laps).toFixed(3));

      stats.driver1.avgPace.push(d1_pace);
      stats.driver2.avgPace.push(d2_pace);
    }

    // --- 3.9) SPRINT results
    const d1_SRes = queryDB(`
        SELECT FinishingPos
        FROM Races_Sprintresults
        WHERE RaceID = ${raceID}
          AND SeasonID = ${year}
          AND DriverID = ${driver1ID}
      `, 'singleValue');

    const d2_SRes = queryDB(`
        SELECT FinishingPos
        FROM Races_Sprintresults
        WHERE RaceID = ${raceID}
          AND SeasonID = ${year}
          AND DriverID = ${driver2ID}
      `, 'singleValue');

    if (d1_SRes === 1) stats.sprintWinsH2H[0] += 1;
    if (d2_SRes === 1) stats.sprintWinsH2H[1] += 1;
  }

  // 4) Total championship points (not per race)
  const d1_Pts = queryDB(`
      SELECT Points
      FROM Races_DriverStandings
      WHERE RaceFormula = 1
        AND SeasonID = ${year}
        AND DriverID = ${driver1ID}
    `, 'singleValue') || 0;

  const d2_Pts = queryDB(`
      SELECT Points
      FROM Races_DriverStandings
      WHERE RaceFormula = 1
        AND SeasonID = ${year}
        AND DriverID = ${driver2ID}
    `, 'singleValue') || 0;

  stats.pointsH2H = [d1_Pts, d2_Pts];

  const meanRd1 = Number(mean(stats.driver1.RPositions).toFixed(1));
  const meanRd2 = Number(mean(stats.driver2.RPositions).toFixed(1));
  const medianRd1 = median(stats.driver1.RPositions);
  const medianRd2 = median(stats.driver2.RPositions);

  const meanQd1 = Number(mean(stats.driver1.QPositions).toFixed(1));
  const meanQd2 = Number(mean(stats.driver2.QPositions).toFixed(1));
  const medianQd1 = median(stats.driver1.QPositions);
  const medianQd2 = median(stats.driver2.QPositions);

  const rDifferences = stats.driver1.avgPace.map((val, i) => (stats.driver2.avgPace[i] ?? 0) - val);
  const avg_racediff = Number(mean(rDifferences).toFixed(3));

  const qDifferences = stats.driver1.avgQPace.map((val, i) => (stats.driver2.avgQPace[i] ?? 0) - val);
  const avg_qualidiff = Number(mean(qDifferences).toFixed(3));

  // 3) Construct the final array in the same order as Python:
  const resultList = [
    stats.raceH2H,                           // 0) (raceH2H)
    stats.qualiH2H,                          // 1) (qualiH2H)
    stats.pointsH2H,                         // 2) (pointsH2H)
    stats.podiumsH2H,                        // 3) (podiumsH2H)
    [stats.driver1.bestRace, stats.driver2.bestRace],    // 4) (bestRace)
    [stats.driver1.bestQuali, stats.driver2.bestQuali],  // 5) (bestQuali)
    stats.dnfH2H,                            // 6) (dnfH2H)
    stats.winsH2H,                           // 7) (winsH2H)
    stats.polesH2H,                          // 8) (polesH2H)
    stats.sprintWinsH2H,                     // 9) (sprintWinsH2H)
    [-avg_racediff, avg_racediff],           // 10) (-avg_racediff, avg_racediff)
    [-avg_qualidiff, avg_qualidiff],         // 11) (-avg_qualidiff, avg_qualidiff)
    [meanRd1, meanRd2],                      // 12) (meanRd1, meanRd2)
    [medianRd1, medianRd2],                  // 13) (medianRd1, medianRd2)
    [meanQd1, meanQd2],                      // 14) (meanQd1, meanQd2)
    [medianQd1, medianQd2]                   // 15) (medianQd1, medianQd2)
  ];

  // 4) Return this array instead of 'stats'
  return resultList;
}

/**
 * Fetches Head-to-Head statistics between two teams.
 * @param {number} teamID1 - ID of the first team.
 * @param {number} teamID2 - ID of the second team.
 * @param {number} year - The season year.
 * @param {boolean} [isCurrentYear=true] - Whether it is the current year.
 * @returns {Array} An array containing various H2H statistics for teams.
 */
export function fetchHead2HeadTeam(teamID1, teamID2, year, isCurrentYear = true) {
  const t1 = teamID1;
  const t2 = teamID2;
  const season = year;
  console.log("TEAMS: ", teamID1, teamID2, season, isCurrentYear);



  // 1) Get all races where both teams participated
  const racesBoth = queryDB(`
      SELECT RaceID
      FROM Races_Results
      WHERE Season = ${season}
        AND TeamID IN (${t1}, ${t2})
      GROUP BY RaceID
      HAVING COUNT(DISTINCT TeamID) = 2
    `, 'allRows') || [];

  const raceIDs = racesBoth.map(row => row[0]);

  // 2) Initialize counters / arrays
  const raceH2H = [0, 0];
  const qualiH2H = [0, 0];
  const dnfH2H = [0, 0];
  const bestRace = [0, 0];
  const bestQuali = [0, 0];
  const pointsH2H = [0, 0];
  const podiumsH2H = [0, 0];
  const polesH2H = [0, 0];
  const winsH2H = [0, 0];
  const sprintWinsH2H = [0, 0];

  let d1_BestRace = 21;
  let d2_BestRace = 21;
  let d1_BestQauli = 21;
  let d2_BestQauli = 21;

  const d1_avgPace = [];
  const d2_avgPace = [];
  const d1_avgQPace = [];
  const d2_avgQPace = [];

  // 3) Iterate through each race found
  for (const raceID of raceIDs) {

    // 3.1) Get all DriverIDs for each team in Quali
    //      (In Python, stored as tuples and then done "IN (drivers1_str)").
    //      In JS, we build the string manually.

    // Drivers of team1
    const drivers1 = queryDB(`
        SELECT DISTINCT DriverID
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND TeamID = ${t1}
      `, 'allRows') || [];

    // Drivers of team2
    const drivers2 = queryDB(`
        SELECT DISTINCT DriverID
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND TeamID = ${t2}
      `, 'allRows') || [];

    console.log("Drivers1: ", drivers1);
    console.log("Drivers2: ", drivers2);

    // Transform array of arrays/tuples into array of IDs
    const drivers1IDs = drivers1.map(d => d[0]);
    const drivers2IDs = drivers2.map(d => d[0]);

    // If no drivers, we can skip to next race (to avoid queries "IN ()")
    if (!drivers1IDs.length || !drivers2IDs.length) {
      // Team 1 or Team 2 does not participate in this race, skip
      continue;
    }

    const drivers1Str = drivers1IDs.join(',');
    const drivers2Str = drivers2IDs.join(',');

    // 3.2) Highest Qualy Stage for each team
    const d1_QStage = queryDB(`
        SELECT MAX(QualifyingStage)
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID IN (${drivers1Str})
      `, 'singleValue') || 0;

    const d2_QStage = queryDB(`
        SELECT MAX(QualifyingStage)
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID IN (${drivers2Str})
      `, 'singleValue') || 0;

    let d1_QRes, d2_QRes;

    // 3.3) Minimum position in that Qualy stage (equivalent to "SELECT MIN(FinishingPos)")
    if (isCurrentYear) {
      d1_QRes = queryDB(`
        SELECT MIN(FinishingPos)
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID IN (${drivers1Str})
          AND QualifyingStage = ${d1_QStage}
      `, 'singleValue') || 99;

      d2_QRes = queryDB(`
        SELECT MIN(FinishingPos)
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID IN (${drivers2Str})
          AND QualifyingStage = ${d2_QStage}
      `, 'singleValue') || 99;
    } else {
      d1_QRes = queryDB(`SELECT MIN(StartingPos) FROM Races_Results WHERE RaceID = ${raceID} AND Season = ${season} AND DriverID IN (${drivers1Str})`, 'singleValue') || 99;
      d2_QRes = queryDB(`SELECT MIN(StartingPos) FROM Races_Results WHERE RaceID = ${raceID} AND Season = ${season} AND DriverID IN (${drivers2Str})`, 'singleValue') || 99;
    }

    // 3.4) Qualy H2H comparison
    if (d1_QStage < d2_QStage) {
      qualiH2H[1] += 1;
    } else if (d1_QStage > d2_QStage) {
      qualiH2H[0] += 1;
    } else {
      // same qualy stage
      if (d1_QRes < d2_QRes) {
        qualiH2H[0] += 1;
      } else if (d1_QRes > d2_QRes) {
        qualiH2H[1] += 1;
      }
    }

    // 3.5) Fastest lap comparing the same minimum stage
    const minQ = Math.min(d1_QStage, d2_QStage);

    const d1_qLap = queryDB(`
        SELECT FastestLap
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID IN (${drivers1Str})
          AND QualifyingStage = ${minQ}
      `, 'singleValue') || 0;

    const d2_qLap = queryDB(`
        SELECT FastestLap
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID IN (${drivers2Str})
          AND QualifyingStage = ${minQ}
      `, 'singleValue') || 0;

    if (d1_qLap !== 0 && d2_qLap !== 0) {
      d1_avgQPace.push(d1_qLap);
      d2_avgQPace.push(d2_qLap);
    }

    // Poles: if QStage = 3 and "best" position = 1
    if (d1_QRes === 1 && (!isCurrentYear || d1_QStage === 3)) {
      polesH2H[0] += 1;
    }
    if (d2_QRes === 1 && (!isCurrentYear || d2_QStage === 3)) {
      polesH2H[1] += 1;
    }

    // Best Quali
    if (d1_QRes < d1_BestQauli) {
      d1_BestQauli = d1_QRes;
    }
    if (d2_QRes < d2_BestQauli) {
      d2_BestQauli = d2_QRes;
    }

    // 3.6) Race results (use MIN(FinishingPos))
    const d1_RRes = queryDB(`
        SELECT MIN(FinishingPos)
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND Season = ${season}
          AND DriverID IN (${drivers1Str})
      `, 'singleValue') || 99;

    const d2_RRes = queryDB(`
        SELECT MIN(FinishingPos)
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND Season = ${season}
          AND DriverID IN (${drivers2Str})
      `, 'singleValue') || 99;

    // Wins
    if (d1_RRes === 1) winsH2H[0] += 1;
    if (d2_RRes === 1) winsH2H[1] += 1;

    // Race H2H
    if (d1_RRes < d2_RRes) {
      raceH2H[0] += 1;
    } else if (d1_RRes > d2_RRes) {
      raceH2H[1] += 1;
    }

    // Podiums
    if (d1_RRes <= 3) podiumsH2H[0] += 1;
    if (d2_RRes <= 3) podiumsH2H[1] += 1;

    // Best Race
    if (d1_RRes < d1_BestRace) {
      d1_BestRace = d1_RRes;
    }
    if (d2_RRes < d2_BestRace) {
      d2_BestRace = d2_RRes;
    }

    // 3.7) DNF => sum
    const d1_RDNF = queryDB(`
        SELECT SUM(DNF)
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND Season = ${season}
          AND DriverID IN (${drivers1Str})
      `, 'singleValue') || 0;

    const d2_RDNF = queryDB(`
        SELECT SUM(DNF)
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND Season = ${season}
          AND DriverID IN (${drivers2Str})
      `, 'singleValue') || 0;

    dnfH2H[0] += d1_RDNF;
    dnfH2H[1] += d2_RDNF;


    // 3.8) Race pace (if at least one driver of the team did not DNF)
    const d1_racePaceStats = queryDB(`
        SELECT COUNT(*), AVG(Time), AVG(Laps)
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND Season = ${season}
          AND DriverID IN (${drivers1Str})
          AND DNF = 0
      `, 'singleRow') || [0, 0, 0];

    if (d1_racePaceStats[0] > 0) { // [0] is COUNT
      const avgTime = d1_racePaceStats[1];
      const avgLaps = d1_racePaceStats[2];
      if (avgLaps && avgTime) {
        const pace = Number((avgTime / avgLaps).toFixed(3));
        d1_avgPace.push(pace);
      }
    }

    const d2_racePaceStats = queryDB(`
        SELECT COUNT(*), AVG(Time), AVG(Laps)
        FROM Races_Results
        WHERE RaceID = ${raceID}
          AND Season = ${season}
          AND DriverID IN (${drivers2Str})
          AND DNF = 0
      `, 'singleRow') || [0, 0, 0];

    if (d2_racePaceStats[0] > 0) { // [0] is COUNT
      const avgTime = d2_racePaceStats[1];
      const avgLaps = d2_racePaceStats[2];
      if (avgLaps && avgTime) {
        const pace = Number((avgTime / avgLaps).toFixed(3));
        d2_avgPace.push(pace);
      }
    }

    // 3.9) Sprint results (MIN FinishingPos)
    const d1_SRes = queryDB(`
        SELECT MIN(FinishingPos)
        FROM Races_Sprintresults
        WHERE RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID IN (${drivers1Str})
      `, 'singleValue');

    const d2_SRes = queryDB(`
        SELECT MIN(FinishingPos)
        FROM Races_Sprintresults
        WHERE RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID IN (${drivers2Str})
      `, 'singleValue');

    if (d1_SRes === 1) {
      sprintWinsH2H[0] += 1;
    }
    if (d2_SRes === 1) {
      sprintWinsH2H[1] += 1;
    }
  }

  // 4) Team points in the championship (TeamStandings)
  const d1_Pts = queryDB(`
      SELECT Points
      FROM Races_TeamStandings
      WHERE RaceFormula = 1
        AND SeasonID = ${season}
        AND TeamID = ${t1}
    `, 'singleValue') || 0;

  const d2_Pts = queryDB(`
      SELECT Points
      FROM Races_TeamStandings
      WHERE RaceFormula = 1
        AND SeasonID = ${season}
        AND TeamID = ${t2}
    `, 'singleValue') || 0;

  pointsH2H[0] = d1_Pts;
  pointsH2H[1] = d2_Pts;

  bestRace[0] = d1_BestRace;
  bestRace[1] = d2_BestRace;
  bestQuali[0] = d1_BestQauli;
  bestQuali[1] = d2_BestQauli;

  // 5) Calculate mean pace difference (race and quali).
  //    rDifferences = (d2_avg - d1_avg) for each pair
  const rDifferences = d1_avgPace.map((val, i) => {
    const d2Val = d2_avgPace[i] || 0;
    return d2Val - val;
  });

  const qDifferences = d1_avgQPace.map((val, i) => {
    const d2Val = d2_avgQPace[i] || 0;
    return d2Val - val;
  });

  // Helpers for mean
  const mean = (arr) => {
    if (!arr.length) return 0;
    const sum = arr.reduce((acc, num) => acc + num, 0);
    return sum / arr.length;
  };

  const avg_racediff = Number(mean(rDifferences).toFixed(3));
  const avg_qualidiff = Number(mean(qDifferences).toFixed(3));


  const resultList = [
    raceH2H,
    qualiH2H,
    pointsH2H,
    podiumsH2H,
    bestRace,
    bestQuali,
    dnfH2H,
    winsH2H,
    polesH2H,
    sprintWinsH2H,
    [-avg_racediff, avg_racediff],
    [-avg_qualidiff, avg_qualidiff]
  ];

  // 7) Return final array
  return resultList;
}
