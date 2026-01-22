import { queryDB } from "../dbManager.js";

export function fetchRegulationsData() {
  const enumRows = queryDB(
    `SELECT ChangeID, Name, CurrentValue, MinValue, MaxValue FROM Regulations_Enum_Changes`,
    [],
    "allRows"
  ) || [];

  const enumChanges = {};
  for (const [ChangeID, Name, CurrentValue, MinValue, MaxValue] of enumRows) {
    enumChanges[Name] = {
      ChangeID,
      Name,
      CurrentValue,
      MinValue,
      MaxValue,
    };
  }

  const pointRows = queryDB(
    `SELECT PointScheme, RacePos, Points
     FROM Regulations_NonTechnical_PointSchemes
     ORDER BY PointScheme ASC, RacePos ASC`,
    [],
    "allRows"
  ) || [];

  const pointSchemes = {};
  for (const [PointScheme, RacePos, Points] of pointRows) {
    if (!pointSchemes[PointScheme]) pointSchemes[PointScheme] = [];
    pointSchemes[PointScheme].push({ RacePos, Points });
  }

  const resourceRows = queryDB(
    `SELECT ResourcePackage, StandingPos, WindTunnelBlocks, CfdBlocks
     FROM Regulations_NonTechnical_PartResources
     ORDER BY ResourcePackage ASC, StandingPos ASC`,
    [],
    "allRows"
  ) || [];

  const partResources = {};
  for (const [ResourcePackage, StandingPos, WindTunnelBlocks, CfdBlocks] of resourceRows) {
    if (!partResources[ResourcePackage]) partResources[ResourcePackage] = [];
    partResources[ResourcePackage].push({
      StandingPos,
      WindTunnelBlocks,
      CfdBlocks,
    });
  }

  return { enumChanges, pointSchemes, partResources };
}

function isRowPresent(query, params) {
  const exists = queryDB(query, params, "singleValue");
  return exists !== null && exists !== undefined;
}

export function updateRegulations(data) {
  const enumChanges = data?.enumChanges || {};

  for (const [name, row] of Object.entries(enumChanges)) {
    if (!row || row.CurrentValue === undefined || row.CurrentValue === null) continue;
    queryDB(
      `UPDATE Regulations_Enum_Changes
       SET CurrentValue = ?
       WHERE Name = ?`,
      [row.CurrentValue, name],
      "run"
    );
  }

  const pointSchemes = data?.pointSchemes || {};
  for (const [schemeIdStr, rows] of Object.entries(pointSchemes)) {
    const schemeId = Number(schemeIdStr);
    if (!Array.isArray(rows)) continue;

    for (const r of rows) {
      const racePos = Number(r?.RacePos);
      const points = Number(r?.Points ?? 0);

      const present = isRowPresent(
        `SELECT 1 FROM Regulations_NonTechnical_PointSchemes WHERE PointScheme = ? AND RacePos = ? LIMIT 1`,
        [schemeId, racePos]
      );

      if (present) {
        queryDB(
          `UPDATE Regulations_NonTechnical_PointSchemes
           SET Points = ?
           WHERE PointScheme = ? AND RacePos = ?`,
          [points, schemeId, racePos],
          "run"
        );
      } else {
        queryDB(
          `INSERT INTO Regulations_NonTechnical_PointSchemes (PointScheme, RacePos, Points)
           VALUES (?, ?, ?)`,
          [schemeId, racePos, points],
          "run"
        );
      }
    }
  }

  const partResources = data?.partResources || {};
  for (const [packageIdStr, rows] of Object.entries(partResources)) {
    const packageId = Number(packageIdStr);
    if (!Array.isArray(rows)) continue;

    for (const r of rows) {
      const standingPos = Number(r?.StandingPos);
      const wind = Number(r?.WindTunnelBlocks ?? 0);
      const cfd = Number(r?.CfdBlocks ?? 0);

      const present = isRowPresent(
        `SELECT 1 FROM Regulations_NonTechnical_PartResources WHERE ResourcePackage = ? AND StandingPos = ? LIMIT 1`,
        [packageId, standingPos]
      );

      if (present) {
        queryDB(
          `UPDATE Regulations_NonTechnical_PartResources
           SET WindTunnelBlocks = ?, CfdBlocks = ?
           WHERE ResourcePackage = ? AND StandingPos = ?`,
          [wind, cfd, packageId, standingPos],
          "run"
        );
      } else {
        queryDB(
          `INSERT INTO Regulations_NonTechnical_PartResources (ResourcePackage, StandingPos, WindTunnelBlocks, CfdBlocks)
           VALUES (?, ?, ?, ?)`,
          [packageId, standingPos, wind, cfd],
          "run"
        );
      }
    }
  }
}

