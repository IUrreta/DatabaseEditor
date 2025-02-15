import { queryDB } from "../dbManager";

function getExcelDate(year) {
    const excelStartDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, 0, 1);
    const msPerDay = 24 * 60 * 60 * 1000;

    const diffDays = Math.floor((targetDate - excelStartDate) / msPerDay) + 2;
    return diffDays;
}


export function editContract(driverID, salary, endSeason, startingBonus, raceBonus, raceBonusTargetPos) {
    const hasContract = queryDB(`
      SELECT TeamID
      FROM Staff_Contracts
      WHERE StaffID = ${driverID}
        AND ContractType = 0
    `, 'singleValue');

    if (hasContract !== null && hasContract !== undefined) {
        queryDB(`
        UPDATE Staff_Contracts
        SET
          Salary = ${salary},
          EndSeason = ${endSeason},
          StartingBonus = ${startingBonus},
          RaceBonus = ${raceBonus},
          RaceBonusTargetPos = ${raceBonusTargetPos}
        WHERE
          ContractType = 0
          AND StaffID = ${driverID}
      `);
    }
}

export function futureContract(
    teamID,
    driverID,
    salary,
    endSeason,
    startingBonus,
    raceBonus,
    raceBonusTargetPos,
    position,
    year_iteration = "24"
) {
    if (teamID === "-1") {
        queryDB(`
        DELETE FROM Staff_Contracts
        WHERE StaffID = ${driverID}
          AND ContractType = 3
      `);
    } else {
        let alreadyHasFutureContract = queryDB(`
        SELECT TeamID
        FROM Staff_Contracts
        WHERE StaffID = ${driverID}
          AND ContractType = 3
      `, 'singleValue');

        if (alreadyHasFutureContract === null || alreadyHasFutureContract === undefined) {
            alreadyHasFutureContract = -1;
        }

        if (parseInt(alreadyHasFutureContract, 10) !== parseInt(teamID, 10)) {
            const season = queryDB(`
          SELECT CurrentSeason
          FROM Player_State
        `, 'singleValue');

            const day = getExcelDate(season + 1);

            queryDB(`
          DELETE FROM Staff_Contracts
          WHERE StaffID = ${driverID}
            AND ContractType = 3
        `);

            if (year_iteration === "24") {
                queryDB(`
            INSERT INTO Staff_Contracts
            VALUES (
              ${driverID},          
              3,                 
              ${teamID},            
              ${position},        
              ${day},              
              ${endSeason},         
              ${salary},            
              ${startingBonus},    
              ${raceBonus},         
              ${raceBonusTargetPos},
              0.5,                  
              0                    
            )
          `);
            } else if (year_iteration === "23") {
                queryDB(`
            INSERT INTO Staff_Contracts
            VALUES (
              ${driverID},
              3,
              1,
              ${day},
              1,
              ${teamID},
              ${position},
              1,
              '[OPINION_STRING_NEUTRAL]',
              ${day},
              ${endSeason},
              1,
              '[OPINION_STRING_NEUTRAL]',
              ${salary},
              1,
              '[OPINION_STRING_NEUTRAL]',
              ${startingBonus},
              1,
              '[OPINION_STRING_NEUTRAL]',
              ${raceBonus},
              1,
              '[OPINION_STRING_NEUTRAL]',
              ${raceBonusTargetPos},
              1,
              '[OPINION_STRING_NEUTRAL]',
              0,
              1,
              '[OPINION_STRING_NEUTRAL]'
            )
          `);
            }
        } else {
            queryDB(`
          UPDATE Staff_Contracts
          SET
            PosInTeam = ${position},
            Salary = ${salary},
            EndSeason = ${endSeason},
            StartingBonus = ${startingBonus},
            RaceBonus = ${raceBonus},
            RaceBonusTargetPos = ${raceBonusTargetPos}
          WHERE
            StaffID = ${driverID}
            AND TeamID = ${alreadyHasFutureContract}
            AND ContractType = 3
        `);
        }
    }
}
