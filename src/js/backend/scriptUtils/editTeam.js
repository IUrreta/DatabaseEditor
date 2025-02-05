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