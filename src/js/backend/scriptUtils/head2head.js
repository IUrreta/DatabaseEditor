import { queryDB } from "../dbManager";

export function fetchHead2Head(driver1ID, driver2ID, year) {

  // Helpers para estadísticos:
  const mean = (arr) => {
    if (!arr.length) return 0;
    const total = arr.reduce((acc, n) => acc + n, 0);
    return total / arr.length;
  };

  const median = (arr) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return (sorted.length % 2 === 1)
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  // 1) Obtenemos todas las carreras en las que participaron ambos pilotos
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

  // 3) Iteramos en cada carrera en la que compitieron ambos
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

    // --- 3.2) Posición en la fase final que corrieron
    const d1_QRes = queryDB(`
        SELECT FinishingPos
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${year}
          AND DriverID = ${driver1ID}
          AND QualifyingStage = ${d1_QStage}
      `, 'singleValue') || 99;

    const d2_QRes = queryDB(`
        SELECT FinishingPos
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${year}
          AND DriverID = ${driver2ID}
          AND QualifyingStage = ${d2_QStage}
      `, 'singleValue') || 99;

    // --- 3.3) Quién ganó el “duelo” de qualy
    if (d1_QStage < d2_QStage) {
      stats.qualiH2H[1] += 1;
    } else if (d1_QStage > d2_QStage) {
      stats.qualiH2H[0] += 1;
    } else {
      // misma fase de qualy
      if (d1_QRes < d2_QRes) {
        stats.qualiH2H[0] += 1;
      } else if (d1_QRes > d2_QRes) {
        stats.qualiH2H[1] += 1;
      }
    }

    // Guardar posiciones de qualy para estadísticas finales
    stats.driver1.QPositions.push(d1_QRes);
    stats.driver2.QPositions.push(d2_QRes);

    // --- 3.4) Lap más rápida comparando la misma fase “mínima”
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

    // --- 3.5) Poles: Q3 y posición 1
    if (d1_QStage === 3 && d1_QRes === 1) {
      stats.polesH2H[0] += 1;
    }
    if (d2_QStage === 3 && d2_QRes === 1) {
      stats.polesH2H[1] += 1;
    }

    // Mejor qualifying
    if (d1_QRes < stats.driver1.bestQuali) {
      stats.driver1.bestQuali = d1_QRes;
    }
    if (d2_QRes < stats.driver2.bestQuali) {
      stats.driver2.bestQuali = d2_QRes;
    }

    // --- 3.6) Resultados de carrera
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

    // ¿Quién terminó por delante?
    if (d1_RRes < d2_RRes) {
      stats.raceH2H[0] += 1;
    } else if (d1_RRes > d2_RRes) {
      stats.raceH2H[1] += 1;
    }

    // Wins
    if (d1_RRes === 1) stats.winsH2H[0] += 1;
    if (d2_RRes === 1) stats.winsH2H[1] += 1;

    // Podios
    if (d1_RRes <= 3) stats.podiumsH2H[0] += 1;
    if (d2_RRes <= 3) stats.podiumsH2H[1] += 1;

    // Mejor posición en carrera
    if (d1_RRes < stats.driver1.bestRace) {
      stats.driver1.bestRace = d1_RRes;
    }
    if (d2_RRes < stats.driver2.bestRace) {
      stats.driver2.bestRace = d2_RRes;
    }

    // Guardamos posición de carrera
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

    // --- 3.8) Ritmo en carrera (avg pace) si ninguno hizo DNF
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

  // 4) Puntos totales en el campeonato (no por carrera)
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

  // 3) Armamos el array final en el mismo orden que en tu Python:
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

  // 4) Retornamos este array en vez de 'stats'
  return resultList;
}

export function fetchHead2HeadTeam(teamID1, teamID2, year) {
  const t1 = teamID1[0];
  const t2 = teamID2[0];
  const season = year;


  // 1) Obtenemos todas las carreras de la temporada (Distinct RaceID)
  const races = queryDB(`
      SELECT DISTINCT RaceID
      FROM Races_Results
      WHERE Season = ${season}
    `, 'allRows') || [];

  // 2) Inicializamos contadores / arreglos
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

  // 3) Iteramos por cada carrera encontrada
  for (const gp of races) {
    const raceID = gp[0];

    // 3.1) Obtenemos todos los DriverIDs de cada equipo en Quali
    //      (En Python, se guardan como tuples y luego se hace "IN (drivers1_str)").
    //      En JS, construiremos la string manualmente.

    // Pilotos del team1
    const drivers1 = queryDB(`
        SELECT DISTINCT DriverID
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND TeamID = ${t1}
      `, 'allRows') || [];

    // Pilotos del team2
    const drivers2 = queryDB(`
        SELECT DISTINCT DriverID
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND TeamID = ${t2}
      `, 'allRows') || [];

    // Transformamos el array de arrays/tuplas en un array de IDs
    const drivers1IDs = drivers1.map(d => d[0]);
    const drivers2IDs = drivers2.map(d => d[0]);

    // Si no hay pilotos, podemos continuar a la siguiente carrera (para evitar queries "IN ()")
    if (!drivers1IDs.length || !drivers2IDs.length) {
      // Team 1 o Team 2 no participa en esta carrera, saltamos
      continue;
    }

    const drivers1Str = drivers1IDs.join(',');
    const drivers2Str = drivers2IDs.join(',');

    // 3.2) Fase de Qualy más alta para cada equipo
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

    // 3.3) Posición mínima en esa fase de Qualy (equivalente a "SELECT MIN(FinishingPos)")
    const d1_QRes = queryDB(`
        SELECT MIN(FinishingPos)
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID IN (${drivers1Str})
          AND QualifyingStage = ${d1_QStage}
      `, 'singleValue') || 99;

    const d2_QRes = queryDB(`
        SELECT MIN(FinishingPos)
        FROM Races_QualifyingResults
        WHERE RaceFormula = 1
          AND RaceID = ${raceID}
          AND SeasonID = ${season}
          AND DriverID IN (${drivers2Str})
          AND QualifyingStage = ${d2_QStage}
      `, 'singleValue') || 99;

    // 3.4) Comparativa H2H de qualy
    if (d1_QStage < d2_QStage) {
      qualiH2H[1] += 1;
    } else if (d1_QStage > d2_QStage) {
      qualiH2H[0] += 1;
    } else {
      // misma fase de qualy
      if (d1_QRes < d2_QRes) {
        qualiH2H[0] += 1;
      } else if (d1_QRes > d2_QRes) {
        qualiH2H[1] += 1;
      }
    }

    // 3.5) Lap más rápida comparando la misma fase mínima
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

    // Poles: si QStage = 3 y la "mejor" posición = 1
    if (d1_QStage === 3 && d1_QRes === 1) {
      polesH2H[0] += 1;
    }
    if (d2_QStage === 3 && d2_QRes === 1) {
      polesH2H[1] += 1;
    }

    // Best Quali
    if (d1_QRes < d1_BestQauli) {
      d1_BestQauli = d1_QRes;
    }
    if (d2_QRes < d2_BestQauli) {
      d2_BestQauli = d2_QRes;
    }

    // 3.6) Resultados de carrera (usamos MIN(FinishingPos))
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

    // Podios
    if (d1_RRes <= 3) podiumsH2H[0] += 1;
    if (d2_RRes <= 3) podiumsH2H[1] += 1;

    // Best Race
    if (d1_RRes < d1_BestRace) {
      d1_BestRace = d1_RRes;
    }
    if (d2_RRes < d2_BestRace) {
      d2_BestRace = d2_RRes;
    }

    // 3.7) DNF => sumamos
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

    if (d1_RDNF > 0) {
      dnfH2H[0] += d1_RDNF;
    }
    if (d2_RDNF > 0) {
      dnfH2H[1] += d2_RDNF;
    }

    // 3.8) Ritmo de carrera, si ambos equipos no sumaron DNFs
    if (d1_RDNF === 0 && d2_RDNF === 0) {
      // Tomamos el promedio de "Time" y "Laps" de los pilotos del equipo
      const d1_raceTotal = queryDB(`
          SELECT AVG(Time)
          FROM Races_Results
          WHERE RaceID = ${raceID}
            AND Season = ${season}
            AND DriverID IN (${drivers1Str})
        `, 'singleValue') || 0;

      const d2_raceTotal = queryDB(`
          SELECT AVG(Time)
          FROM Races_Results
          WHERE RaceID = ${raceID}
            AND Season = ${season}
            AND DriverID IN (${drivers2Str})
        `, 'singleValue') || 0;

      const d1_raceLaps = queryDB(`
          SELECT AVG(Laps)
          FROM Races_Results
          WHERE RaceID = ${raceID}
            AND Season = ${season}
            AND DriverID IN (${drivers1Str})
        `, 'singleValue') || 0;

      const d2_raceLaps = queryDB(`
          SELECT AVG(Laps)
          FROM Races_Results
          WHERE RaceID = ${raceID}
            AND Season = ${season}
            AND DriverID IN (${drivers2Str})
        `, 'singleValue') || 0;

      // Si no son 0, agregamos
      if (d1_raceLaps && d1_raceTotal) {
        const pace = Number((d1_raceTotal / d1_raceLaps).toFixed(3));
        d1_avgPace.push(pace);
      }
      if (d2_raceLaps && d2_raceTotal) {
        const pace = Number((d2_raceTotal / d2_raceLaps).toFixed(3));
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

  // 4) Puntos de cada equipo en el campeonato (TeamStandings)
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

  // 5) Calculamos la diferencia media de ritmo (race y quali).
  //    rDifferences = (d2_avg - d1_avg) para cada par
  const rDifferences = d1_avgPace.map((val, i) => {
    const d2Val = d2_avgPace[i] || 0;
    return d2Val - val;
  });

  const qDifferences = d1_avgQPace.map((val, i) => {
    const d2Val = d2_avgQPace[i] || 0;
    return d2Val - val;
  });

  // Helpers para la media
  const mean = (arr) => {
    if (!arr.length) return 0;
    const sum = arr.reduce((acc, num) => acc + num, 0);
    return sum / arr.length;
  };

  const avg_racediff = Number(mean(rDifferences).toFixed(3));
  const avg_qualidiff = Number(mean(qDifferences).toFixed(3));

  // 6) Construimos resultList con los 12 elementos, en el mismo orden que en Python
  // resultList = [
  //   raceH2H, qualiH2H, pointsH2H, podiumsH2H,
  //   bestRace, bestQuali, dnfH2H, winsH2H,
  //   polesH2H, sprintWinsH2H,
  //   (-avg_racediff, avg_racediff),
  //   (-avg_qualidiff, avg_qualidiff)
  // ]
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

  // 7) Retornamos el array final
  return resultList;
}

