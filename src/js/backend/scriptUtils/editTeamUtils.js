import { queryDB } from "../dbManager";

export function fetchTeamData(teamID){
    console.log(teamID);
    const levCon = queryDB(`
        SELECT BuildingID, DegradationValue
        FROM Buildings_HQ
        WHERE TeamID = ${teamID}
      `, 'allRows') || [];

      console.log(levCon);
      const data = levCon.map(row => [row[0], parseFloat(Number(row[1]).toFixed(2))]);
      if (teamID == "32") data.push(["160", 1]);
    
      const daySeason = queryDB(`
        SELECT Day, CurrentSeason
        FROM Player_State
      `, 'singleRow');
    
      const days = queryDB(`
        SELECT MIN(Day), MAX(Day)
        FROM Seasons_Deadlines
        WHERE SeasonID = ${daySeason[1]}
      `, 'singleRow');
    
      const costCap = queryDB(`
        SELECT SUM(value) AS Value
        FROM Finance_Transactions
        WHERE Day >= ${days[0]}
          AND Day < ${days[1]}
          AND AffectsCostCap = 1
          AND TeamID = ${teamID}
      `, 'allRows');
    
      const teamBalance = queryDB(`
        SELECT Balance
        FROM Finance_TeamBalance
        WHERE TeamID = ${teamID}
      `, 'singleRow');
    
      const seasonObj = queryDB(`
        SELECT TargetPos
        FROM Board_SeasonObjectives
        WHERE TeamID = ${teamID}
          AND SeasonID = ${daySeason[1]}
      `, 'singleRow');
    
      const maxTargetYear = queryDB(`
        SELECT MAX(TargetEndYear)
        FROM Board_Objectives
        WHERE TeamID = ${teamID}
      `, 'singleRow');
    
      const longTermObj = queryDB(`
        SELECT Type, TargetEndYear
        FROM Board_Objectives
        WHERE TeamID = ${teamID}
          AND TargetEndYear = ${maxTargetYear[0]}
      `, 'singleRow');
    
      const playerTeam = queryDB(`
        SELECT TeamID
        FROM Player
      `, 'singleRow');
    
      let confidence;
      if (playerTeam[0] == Number(teamID)) {
        confidence = queryDB(`
          SELECT Confidence
          FROM Board_Confidence
          WHERE Season = ${daySeason[1]}
        `, 'singleRow') || [-1];
      } else {
        confidence = [-1];
      }
    
      const pitStats = queryDB(`
        SELECT StatID, Val
        FROM Staff_PitCrew_PerformanceStats
        WHERE TeamID = ${teamID}
      `, 'allRows') || [];
    
      const pitDict = {};
      pitStats.forEach(stat => {
        pitDict[stat[0]] = parseFloat(Number(stat[1]).toFixed(2));
      });

      const engineId = queryDB(`SELECT engineId FROM Custom_Engine_Allocations WHERE teamId = ${teamID}`, 'singleValue');
    
      data.push(seasonObj, longTermObj, teamBalance, costCap, confidence, daySeason[1], pitDict, engineId);
      return data;
}

// manageCostCap(teamID, amount)
export function manageCostCap(teamID, amount) {
  let remaining = parseInt(amount, 10);

  if (remaining > 0) {
    while (remaining > 0) {
      // Obtenemos la transacción negativa más reciente
      const transaction = queryDB(`
        SELECT ROWID, Value, Reference
        FROM Finance_Transactions
        WHERE TeamID = ${teamID}
          AND AffectsCostCap = 1
          AND Value < 0
        ORDER BY Day DESC, ROWID DESC
        LIMIT 1
      `, 'singleRow');

      if (!transaction) {
        break; 
      } else {
        const rowid = transaction[0];
        const value = transaction[1];
        // reference = transaction[2]; // no se usa directamente

        let amountToAdd;
        if ((value + remaining) <= 0) {
          amountToAdd = remaining;
        } else {
          amountToAdd = -value;
        }

        queryDB(`
          UPDATE Finance_Transactions
          SET Value = Value + ${amountToAdd}
          WHERE ROWID = ${rowid}
        `);

        remaining -= amountToAdd;
      }
    }
  } 
  // Si remaining <= 0, insertamos una transacción que incremente el CostCap (o lo modifique negativamente)
  else {
    const daySeason = queryDB(`
      SELECT Day, CurrentSeason
      FROM Player_State
    `, 'singleRow');
    
    queryDB(`
      INSERT INTO Finance_Transactions
      VALUES (${teamID}, ${daySeason[0]}, ${amount}, 9, -1, 1)
    `);
  }
}

export function editTeam(info) {
  console.log("EDITING TEAM");
  console.log(info);
  const daySeason = queryDB(`
    SELECT Day, CurrentSeason
    FROM Player_State
  `, 'singleRow');

  const teamID = info.teamID;

  // Actualización de Buildings_HQ
  info.facilities.forEach(facility => {
    const id = facility[0].slice(0, -1); 
    // facility[0] podría ser "160a", por ejemplo, y con slice(0, -1) quitas el último carácter
    
    queryDB(`
      UPDATE Buildings_HQ
      SET BuildingID = '${facility[0]}',
          DegradationValue = ${facility[1]}
      WHERE TeamID = ${teamID}
        AND BuildingType = ${id}
    `);
  });

  // Board_SeasonObjectives
  queryDB(`
    UPDATE Board_SeasonObjectives
    SET TargetPos = ${info.seasonObj}
    WHERE TeamID = ${teamID}
      AND SeasonID = ${daySeason[1]}
  `);

  // Board_Objectives (objetivo a largo plazo)
  const maxTargetYear = queryDB(`
    SELECT MAX(TargetEndYear)
    FROM Board_Objectives
    WHERE TeamID = ${teamID}
  `, 'singleRow');
  
  queryDB(`
    UPDATE Board_Objectives
    SET Type = ${info.longTermObj},
        TargetEndYear = ${info.longTermYear}
    WHERE TeamID = ${teamID}
      AND TargetEndYear = ${maxTargetYear[0]}
  `);

  // Board_Confidence
  if (info.confidence !== "-1") {
    queryDB(`
      UPDATE Board_Confidence
      SET Confidence = ${info.confidence}
      WHERE Season = ${daySeason[1]}
    `);
  }

  // Finance_TeamBalance
  queryDB(`
    UPDATE Finance_TeamBalance
    SET Balance = ${info.teamBudget}
    WHERE TeamID = ${teamID}
  `);

  // Ajuste de CostCap
  manageCostCap(teamID, info.costCapEdit);

  // Actualizar Staff_PitCrew_PerformanceStats
  Object.keys(info.pitCrew).forEach(statID => {
    queryDB(`
      UPDATE Staff_PitCrew_PerformanceStats
      SET Val = ${info.pitCrew[statID]}
      WHERE TeamID = ${teamID}
        AND StatID = ${statID}
    `);
  });

  // La parte de manage_engine_change la manejas tú
  manage_engine_change(teamID, info.engine);
}

export function manage_engine_change(teamID, engineId) {

  const oldEngineId = queryDB(`SELECT DesignID FROM Parts_Designs WHERE TeamID = ${teamID} AND PartType = 0`, 'singleValue');
  const oldERSId = queryDB(`SELECT DesignID FROM Parts_Designs WHERE TeamID = ${teamID} AND PartType = 1`, 'singleValue');
  const oldGearboxId = queryDB(`SELECT DesignID FROM Parts_Designs WHERE TeamID = ${teamID} AND PartType = 2`, 'singleValue');

  const nmewERSId = parseInt(engineId, 10) + 1;
  const newGearboxId = parseInt(engineId, 10) + 2;

  const newEngineStats = queryDB(`SELECT partStat, unitValue, Value FROM Custom_Engines_Stats WHERE designId = ${engineId}`, 'allRows');
  const newERSStats = queryDB(`SELECT partStat, unitValue, Value FROM Custom_Engines_Stats WHERE designId = ${nmewERSId}`, 'singleRow');
  const newGearboxStats = queryDB(`SELECT partStat, unitValue, Value FROM Custom_Engines_Stats WHERE designId = ${newGearboxId}`, 'singleRow');

  const engineStats = queryDB(`SELECT PartStat FROM Parts_Designs_StatValues WHERE DesignID = ${oldEngineId}`, 'allRows');

  engineStats.forEach(stat => {
    const newStat = newEngineStats.find(newStat => newStat[0] === stat[0]);
    if (newStat) {
      console.log("updating stat " + stat[0] + " to " + newStat[2]);
      queryDB(`UPDATE Parts_Designs_StatValues SET Value = ${newStat[2]}, UnitValue =  ${newStat[1]} WHERE DesignID = ${oldEngineId} AND PartStat = ${stat[0]}`);
    }
  });

  queryDB(`UPDATE Parts_Designs_StatValues SET Value = ${newERSStats[2]}, UnitValue =  ${newERSStats[1]} WHERE DesignID = ${oldERSId} AND PartStat = 15`);
  queryDB(`UPDATE Parts_Designs_StatValues SET Value = ${newGearboxStats[2]}, UnitValue =  ${newGearboxStats[1]} WHERE DesignID = ${oldGearboxId} AND PartStat = 15`);

  if (parseInt(engineId) <= 10){
    const year = queryDB(`SELECT CurrentSeason FROM Player_State`, 'singleValue');
    const newEngineManufacturer = queryDB(`SELECT Value FROM Parts_Enum_EngineManufacturers WHERE EngineDesignID = ${engineId}`, 'singleValue');
    queryDB(`UPDATE Parts_TeamHistory SET EngineManufacturer = ${newEngineManufacturer} WHERE TeamID = ${teamID} AND Season = ${year}`);
  }

  queryDB(`UPDATE Custom_Engine_Allocations SET engineId = ${engineId} WHERE teamId = ${teamID}`);


}