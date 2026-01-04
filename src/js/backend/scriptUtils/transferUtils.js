import { queryDB } from "../dbManager";

export const minMaxTypeStaff = {
  driver: {
    salary: {
      1: [14,30],
      2: [7,12],
      3: [0.5,6],
      4: [0.2,1.2]
    },
    starting_bonus: {
      1: [2,4.5],
      2: [1,2],
      3: [0,1.6],
      4: [0,0]
    },
    year_end: {
      1: [1,5],
      2: [1,4],
      3: [1,3],
      4: [1,2]
    },
    race_bonus: {
      1: [1.5,2.5],
      2: [0.9,1.7],
      3: [0,0.7],
      4: [0,0]
    },
    race_bonus_pos: {
      1: [1,3],
      2: [2,5],
      3: [7,10],
      4: [9,10]
    }
  },
  staff: {
    salary: {
      1: [3.5,5],
      2: [2.5,4],
      3: [1.5,3],
      4: [0.5,1.5]
    },
    starting_bonus: {
      1: [0.5,1.5],
      2: [0.5,1],
      3: [0,0.5],
      4: [0,0.5]
    },
    year_end: {
      1: [1,5],
      2: [1,4],
      3: [1,3],
      4: [1,2]
    }
  }
};

export function transferJuniorDriver(driverID,newTeamID, posInTeam, yearIteration = "24") {
  const teamHasDriverInPosition = queryDB(`SELECT StaffID FROM Staff_Contracts WHERE TeamID = ? AND PosInTeam = ? AND ContractType = 0`,[newTeamID,posInTeam],"singleValue");
  if (teamHasDriverInPosition) {
    //remove that driver from the team
    queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND TeamID = ? AND ContractType = 0`,[teamHasDriverInPosition,newTeamID],'run');
    queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = ?`,[teamHasDriverInPosition],'run');
    queryDB(`UPDATE Staff_DriverData SET FeederSeriesAssignedCarNumber = NULL WHERE StaffID = ?`,[teamHasDriverInPosition],'run');
  }
  //check if the driver has a contract with another team that is in between 11 and 31 (both included)
  const hasJunioorContract = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0 AND TeamID > 10 AND TeamID < 32`,[driverID],"singleValue");
  if (hasJunioorContract) {
    queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND TeamID = ? AND ContractType = 0`,[driverID,hasJunioorContract],'run');
    queryDB(`UPDATE Staff_DriverData SET FeederSeriesAssignedCarNumber = NULL WHERE StaffID = ?`,[driverID],'run');
  }
  //add the driver to the new team
  const day = queryDB("SELECT Day FROM Player_State",[],"singleValue");
  const year = queryDB("SELECT CurrentSeason FROM Player_State",[],"singleValue");
  const yearEnd = (parseInt(year) + 1).toString();
  const salary = "100000";
  if (yearIteration === "23") {
    queryDB(`INSERT INTO Staff_Contracts VALUES (?, 0, 1, ?, 1, ?, ?, 1, '[OPINION_STRING_NEUTRAL]', ?, ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', 0, 1, '[OPINION_STRING_NEUTRAL]')`, 
      [driverID,day,newTeamID,posInTeam,day,yearEnd,salary,"0","0","1"],'run'
    );
  } else if (yearIteration === "24") {
    queryDB(
      `INSERT INTO Staff_Contracts VALUES (?, 0, ?, ?, ?, ?, ?, ?, ?, ?, 0.5, 0)`,
      [driverID,newTeamID,posInTeam,day,yearEnd,salary,"0","0","1"],'run'
    );
  }
  queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = ? WHERE StaffID = ?`,[posInTeam,driverID],'run');
  queryDB(`UPDATE Staff_DriverData SET FeederSeriesAssignedCarNumber = ? WHERE StaffID = ?`,[posInTeam,driverID],'run');
  rearrangeDriverEngineerPairings(newTeamID);
  //if teamid is less than 22, then its 2, if more is 3
  const juniorFormula = (newTeamID < 22) ? 2 : 3;
  //check if he is in the standings of that formula
  let positionInStandings = queryDB(`SELECT Position FROM Races_DriverStandings WHERE SeasonID = ? AND DriverID = ? AND RaceFormula = ?`,[year,driverID,juniorFormula],"singleValue");
  if (!positionInStandings) {
    //insert in position maximum possible
    const actualMaxPosition = queryDB(`SELECT COUNT(*) FROM Races_DriverStandings WHERE SeasonID = ? AND RaceFormula = ?`,[year,juniorFormula],"singleValue");
    positionInStandings = actualMaxPosition + 1;
    queryDB(`INSERT INTO Races_DriverStandings VALUES (?, ?, 0, ?, 0, 0, ?)`,[year,driverID,positionInStandings,juniorFormula],'run');
  }

}

export function hireDriver(type,driverID,teamID,position,salary = "",startingBonus = "",raceBonus = "",raceBonusPos = "",yearEnd = "",yearIteration = "24") {
  if (type === "auto" || salary === "" || startingBonus === "") {
    const params = getParamsAutoContract(driverID,teamID,position,yearIteration);
    salary = params.salary;
    yearEnd = params.yearEnd;
    startingBonus = params.startingBonus;
    raceBonus = params.raceBonus;
    raceBonusPos = params.raceBonusPos;
  }

  const day = queryDB("SELECT Day FROM Player_State",[],"singleValue");
  const year = queryDB("SELECT CurrentSeason FROM Player_State",[],"singleValue");
  const staffType = fetchTypeStaff(driverID);

  const isRetired = queryDB(`SELECT Retired FROM Staff_GameData WHERE StaffID = ?`,[driverID],"singleValue");
  if (isRetired === 1) {
    queryDB(`UPDATE Staff_GameData SET Retired = 0 WHERE StaffID = ?`,[driverID],'run');
  }

  if (yearIteration === "23") {
    queryDB(
      `INSERT INTO Staff_Contracts VALUES (?, 0, 1, ?, 1, ?, ?, 1, '[OPINION_STRING_NEUTRAL]', ?, ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', 0, 1, '[OPINION_STRING_NEUTRAL]')`,
      [driverID,day,teamID,position,day,yearEnd,salary,startingBonus,raceBonus,raceBonusPos],'run'
    );
  } else if (yearIteration === "24") {
    queryDB(
      `INSERT INTO Staff_Contracts VALUES (?, 0, ?, ?, ?, ?, ?, ?, ?, ?, 0.5, 0)`,
      [driverID,teamID,position,day,yearEnd,salary,startingBonus,raceBonus,raceBonusPos],'run'
    );
  }

  if (parseInt(position) < 3 && staffType === 0) {
    queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = ? WHERE StaffID = ?`,[position,driverID],'run');
    const isDrivingInF2F3 = queryDB(
      `SELECT TeamID FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0 AND (TeamID > 10 AND TeamID < 32)`,
      [driverID],
      "singleValue"
    );
    if (isDrivingInF2F3 !== null && isDrivingInF2F3 !== undefined) {
      queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0 AND TeamID = ?`,[driverID,isDrivingInF2F3],'run');
      queryDB(`UPDATE Staff_DriverData SET FeederSeriesAssignedCarNumber = NULL WHERE StaffID = ?`,[driverID],'run');
    }

    let positionInStandings = queryDB(
      `SELECT MAX(Position) FROM Races_DriverStandings WHERE SeasonID = ? AND RaceFormula = 1`,
      [year],
      "singleValue"
    );
    let pointsDriverInStandings = queryDB(
      `SELECT Points FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 1`,
      [driverID,year],
      "singleValue"
    );
    if (pointsDriverInStandings === null || pointsDriverInStandings === undefined) {
      pointsDriverInStandings = 0;
      queryDB(
        `INSERT INTO Races_DriverStandings VALUES (?, ?, ?, ?, 0, 0, 1)`,
        [year,driverID,pointsDriverInStandings,positionInStandings + 1],'run'
      );
    }

    const wasInF2 = queryDB(
      `SELECT Points FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 2`,
      [driverID,year],
      "singleValue"
    );
    const wasInF3 = queryDB(
      `SELECT Points FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 3`,
      [driverID,year],
      "singleValue"
    );
    if (wasInF2 !== null && wasInF2 !== undefined) {
      queryDB(`DELETE FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 2`,[driverID,year],'run');
    }
    if (wasInF3 !== null && wasInF3 !== undefined) {
      queryDB(`DELETE FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 3`,[driverID,year],'run');
    }

    const driverHasNumber = queryDB(
      `SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder = ?`,
      [driverID],
      "singleValue"
    );
    if (!driverHasNumber) {
      freeNumbersNotF1();
      const freeNumbers = queryDB("SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder IS NULL AND Number != 0",[],"allRows");
      if (freeNumbers && freeNumbers.length > 0) {
        const randIndex = Math.floor(Math.random() * freeNumbers.length);
        const newNum = freeNumbers[randIndex][0];
        queryDB(`UPDATE Staff_DriverNumbers SET CurrentHolder = ? WHERE Number = ?`,[driverID,newNum],'run');
      }
    }
  }

  rearrangeDriverEngineerPairings(teamID);
  fixDriverStandings();
}

export function freeNumbersNotF1() {
  const numbers = queryDB("SELECT CurrentHolder, Number FROM Staff_DriverNumbers WHERE Number != 0 AND CurrentHolder IS NOT NULL",[],"allRows");
  if (numbers) {
    numbers.forEach(row => {
      const driver = row[0];
      const number = row[1];
      const teamId = queryDB(
        `SELECT MIN(TeamID) FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0`,
        [driver],
        "singleValue"
      );
      if (teamId !== null && teamId > 10 && teamId < 32) {
        queryDB(`UPDATE Staff_DriverNumbers SET CurrentHolder = NULL WHERE Number = ?`,[number],'run');
      }
    });
  }
}

export function fetchTypeStaff(driverID) {
  return queryDB(`SELECT StaffType FROM Staff_GameData WHERE StaffID = ?`,[driverID],"singleValue");
}

export function getParamsAutoContract(driverID,teamID,position,yearIteration = "24") {
  const day = queryDB("SELECT Day FROM Player_State",[],"singleValue");
  const year = queryDB("SELECT CurrentSeason FROM Player_State",[],"singleValue");
  const [tier,type,rating] = getTier(driverID);

  // Calcular salary
  const salaryRange = minMaxTypeStaff[type].salary[tier];
  let salary = (Math.round((Math.random() * (salaryRange[1] - salaryRange[0]) + salaryRange[0]) * 1000) / 1000) * 1000000;
  salary = salary.toString();

  const startingBonusRange = minMaxTypeStaff[type].starting_bonus[tier];
  let startingBonus = (Math.round((Math.random() * (startingBonusRange[1] - startingBonusRange[0]) + startingBonusRange[0]) * 1000) / 1000) * 1000000;
  startingBonus = startingBonus.toString();

  let yearEnd = parseInt(year) + Math.floor(Math.random() * (minMaxTypeStaff[type].year_end[tier][1] - minMaxTypeStaff[type].year_end[tier][0] + 1)) + minMaxTypeStaff[type].year_end[tier][0];
  yearEnd = yearEnd.toString();

  let raceBonus = "0";
  let hasBonus = false;
  if (type === "driver") {
    if (tier === 1) {
      const rbRange = minMaxTypeStaff[type].race_bonus[tier];
      raceBonus = (Math.round((Math.random() * (rbRange[1] - rbRange[0]) + rbRange[0]) * 1000) / 1000) * 1000000;
      raceBonus = raceBonus.toString();
      hasBonus = true;
    } else if (tier === 2) {
      if (Math.floor(Math.random() * 11) <= 7) {
        const rbRange = minMaxTypeStaff[type].race_bonus[tier];
        raceBonus = (Math.round((Math.random() * (rbRange[1] - rbRange[0]) + rbRange[0]) * 1000) / 1000) * 1000000;
        raceBonus = raceBonus.toString();
        hasBonus = true;
      } else {
        raceBonus = "0";
        hasBonus = false;
      }
    } else if (tier === 3) {
      if (Math.floor(Math.random() * 11) <= 2) {
        const rbRange = minMaxTypeStaff[type].race_bonus[tier];
        raceBonus = (Math.round((Math.random() * (rbRange[1] - rbRange[0]) + rbRange[0]) * 1000) / 1000) * 1000000;
        raceBonus = raceBonus.toString();
        hasBonus = true;
      } else {
        raceBonus = "0";
        hasBonus = false;
      }
    } else if (tier === 4) {
      raceBonus = "0";
      hasBonus = false;
    }
  } else {
    raceBonus = "0";
    hasBonus = false;
  }

  const driverBirthDate = queryDB(`SELECT DOB_ISO FROM Staff_BasicData WHERE StaffID = ?`,[driverID],"singleValue");
  if (driverBirthDate) {
    const yob = parseInt(driverBirthDate.split("-")[0]);
    if ((parseInt(year) - yob > 34) && type === "driver") {
      yearEnd = (parseInt(year) + Math.floor(Math.random() * 2) + 1).toString();
    }
  }

  let raceBonusPos = "1";
  if (hasBonus) {
    let prestigeTableName = "Board_Prestige";
    if (yearIteration === "24") {
      prestigeTableName = "Board_TeamRating";
    }
    const prestigeValues = queryDB(
      `SELECT PtsFromConstructorResults, PtsFromDriverResults, PtsFromSeasonsEntered, PtsFromChampionshipsWon FROM ${prestigeTableName} WHERE SeasonID = ? AND TeamID = ?`,
      [year,teamID],
      "allRows"
    );
    let prestige = 0;
    if (prestigeValues) {
      prestigeValues.forEach(row => {
        prestige += row[0];
      });
    }
    if (prestige >= 750) {
      raceBonusPos = (Math.floor(Math.random() * (3 - 1 + 1)) + 1).toString();
    } else if (prestige >= 600) {
      raceBonusPos = (Math.floor(Math.random() * (5 - 2 + 1)) + 2).toString();
    } else if (prestige >= 525) {
      raceBonusPos = (Math.floor(Math.random() * (10 - 7 + 1)) + 7).toString();
    } else if (prestige >= 450) {
      raceBonusPos = (Math.floor(Math.random() * (10 - 9 + 1)) + 9).toString();
    } else {
      raceBonus = "0";
      raceBonusPos = "1";
    }
  }

  return { salary,yearEnd,position,startingBonus,raceBonus,raceBonusPos };
}

export function fireDriver(driverID,teamID) {
  const position = queryDB(`SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = ?`,[driverID],"singleValue");
  queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0 AND TeamID = ?`,[driverID,teamID],'run');
  if (position < 3) {
    queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = ?`,[driverID],'run');
  }
  const engineerID = queryDB(
    `SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = ?`,
    [driverID],
    "singleValue"
  );
  if (engineerID) {
    queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ? AND DriverID = ?`,[engineerID,driverID],'run');
  }
}

export function removeFutureContract(driverID) {
  queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 3`,[driverID],'run');
}

export function rearrangeDriverEngineerPairings(teamID) {
  const engineers = queryDB(
    `SELECT gam.StaffID FROM Staff_GameData gam JOIN Staff_Contracts con ON gam.StaffID = con.StaffID WHERE con.TeamID = ? AND con.ContractType = 0 AND gam.StaffType = 2`,
    [teamID],
    "allRows"
  );
  const drivers = queryDB(
    `SELECT gam.StaffID FROM Staff_GameData gam JOIN Staff_Contracts con ON gam.StaffID = con.StaffID WHERE con.TeamID = ? AND con.ContractType = 0 AND gam.StaffType = 0 AND PosInTeam <= 2`,
    [teamID],
    "allRows"
  );
  if (drivers && drivers.length === 2 && engineers && engineers.length === 2) {
    drivers.forEach(driverRow => {
      const driverID = driverRow[0];
      queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE DriverID = ?`,[driverID],'run');
    });
    engineers.forEach(engineerRow => {
      const engineerID = engineerRow[0];
      queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ?`,[engineerID],'run');
    });
    const pair1Exists = queryDB(
      `SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE DriverID = ? AND RaceEngineerID = ?`,
      [drivers[0][0],engineers[0][0]],
      "singleValue"
    );
    if (pair1Exists !== null && pair1Exists !== undefined) {
      queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE DriverID = ? AND RaceEngineerID = ?`,[drivers[0][0],engineers[0][0]],'run');
    } else {
      queryDB(`INSERT INTO Staff_RaceEngineerDriverAssignments VALUES (?, ?, 0, 0, 1)`,[engineers[0][0],drivers[0][0]],'run');
    }
    const pair2Exists = queryDB(
      `SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE DriverID = ? AND RaceEngineerID = ?`,
      [drivers[1][0],engineers[1][0]],
      "singleValue"
    );
    if (pair2Exists !== null && pair2Exists !== undefined) {
      queryDB(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE DriverID = ? AND RaceEngineerID = ?`,[drivers[1][0],engineers[1][0]],'run');
    } else {
      queryDB(`INSERT INTO Staff_RaceEngineerDriverAssignments VALUES (?, ?, 0, 0, 1)`,[engineers[1][0],drivers[1][0]],'run');
    }
  }
}

export function swapDrivers(driver1ID,driver2ID) {
  const position1 = queryDB(`SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = ?`,[driver1ID],"singleValue");
  const position2 = queryDB(`SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = ?`,[driver2ID],"singleValue");
  const team1ID = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE StaffID = ?`,[driver1ID],"singleValue");
  const team2ID = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE StaffID = ?`,[driver2ID],"singleValue");
  const year = queryDB("SELECT CurrentSeason FROM Player_State",[],"singleValue");
  const type1 = fetchTypeStaff(driver1ID);
  const type2 = fetchTypeStaff(driver2ID);
  const isStaff = (type1 === 1 || type2 === 1);

  if (position1 < 3 && position2 < 3 && !isStaff) {
    queryDB(`UPDATE Staff_Contracts SET TeamID = ?, PosInTeam = ? WHERE ContractType = 0 AND StaffID = ?`,[team2ID,position2,driver1ID],'run');
    queryDB(`UPDATE Staff_Contracts SET TeamID = ?, PosInTeam = ? WHERE ContractType = 0 AND StaffID = ?`,[team1ID,position1,driver2ID],'run');
    queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = ? WHERE StaffID = ?`,[position2,driver1ID],'run');
    queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = ? WHERE StaffID = ?`,[position1,driver2ID],'run');
    rearrangeDriverEngineerPairings(team1ID);
    rearrangeDriverEngineerPairings(team2ID);
  } else if ((position1 >= 3 && position2 >= 3) || isStaff) {
    queryDB(`UPDATE Staff_Contracts SET TeamID = ? WHERE ContractType = 0 AND StaffID = ?`,[team2ID,driver1ID],'run');
    queryDB(`UPDATE Staff_Contracts SET TeamID = ? WHERE ContractType = 0 AND StaffID = ?`,[team1ID,driver2ID],'run');
  } else if (position1 >= 3) {
    const isDrivingInF2 = queryDB(
      `SELECT TeamID FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0 AND (TeamID > 10 AND TeamID < 32)`,
      [driver1ID],
      "singleValue"
    );
    if (isDrivingInF2) {
      queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0 AND TeamID = ?`,[driver1ID,isDrivingInF2],'run');
    }
    const type = fetchTypeStaff(driver1ID);
    if (parseInt(type) === 0) {
      const wasInF2 = queryDB(
        `SELECT Points FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 2`,
        [driver1ID,year],
        "singleValue"
      );
      const wasInF3 = queryDB(
        `SELECT Points FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 3`,
        [driver1ID,year],
        "singleValue"
      );
      if (wasInF2) {
        queryDB(`DELETE FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 2`,[driver1ID,year],'run');
      }
      if (wasInF3) {
        queryDB(`DELETE FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 3`,[driver1ID,year],'run');
      }
      const position1InStandings = queryDB(
        `SELECT MAX(Position) FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = ?`,
        [year],
        "singleValue"
      );
      let pointsDriver1InStandings = queryDB(
        `SELECT Points FROM Races_DriverStandings WHERE RaceFormula = 1 AND DriverID = ? AND SeasonID = ?`,
        [driver1ID,year],
        "singleValue"
      );
      if (pointsDriver1InStandings === null || pointsDriver1InStandings === undefined) {
        pointsDriver1InStandings = 0;
        queryDB(
          `INSERT INTO Races_DriverStandings VALUES (?, ?, ?, ?, 0, 0, 1)`,
          [year,driver1ID,pointsDriver1InStandings,position1InStandings + 1],'run'
        );
      }
    }
    queryDB(
      `UPDATE Staff_Contracts SET TeamID = ?, PosInTeam = ? WHERE ContractType = 0 AND StaffID = ? AND TeamID = ?`,
      [team1ID,position1,driver2ID,team2ID],'run'
    );
    queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = ?`,[driver2ID],'run');
    queryDB(
      `UPDATE Staff_Contracts SET TeamID = ?, PosInTeam = ? WHERE ContractType = 0 AND StaffID = ? AND TeamID = ?`,
      [team2ID,position2,driver1ID,team1ID],'run'
    );
    queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = ? WHERE StaffID = ?`,[position2,driver1ID],'run');
    rearrangeDriverEngineerPairings(team1ID);
    rearrangeDriverEngineerPairings(team2ID);
  } else if (position2 >= 3) {
    const isDrivingInF2 = queryDB(
      `SELECT TeamID FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0 AND (TeamID > 10 AND TeamID < 32)`,
      [driver2ID],
      "singleValue"
    );
    if (isDrivingInF2) {
      queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0 AND TeamID = ?`,[driver2ID,isDrivingInF2],'run');
    }
    const type = fetchTypeStaff(driver1ID);
    if (parseInt(type) === 0) {
      const wasInF2 = queryDB(
        `SELECT Points FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 2`,
        [driver2ID,year],
        "singleValue"
      );
      const wasInF3 = queryDB(
        `SELECT Points FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 3`,
        [driver2ID,year],
        "singleValue"
      );
      if (wasInF2) {
        queryDB(`DELETE FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 2`,[driver2ID,year],'run');
      }
      if (wasInF3) {
        queryDB(`DELETE FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 3`,[driver2ID,year],'run');
      }
      const position2InStandings = queryDB(
        `SELECT MAX(Position) FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = ?`,
        [year],
        "singleValue"
      );
      let pointsDriver2InStandings = queryDB(
        `SELECT Points FROM Races_DriverStandings WHERE RaceFormula = 1 AND DriverID = ? AND SeasonID = ?`,
        [driver2ID,year],
        "singleValue"
      );
      if (pointsDriver2InStandings === null || pointsDriver2InStandings === undefined) {
        pointsDriver2InStandings = 0;
        queryDB(
          `INSERT INTO Races_DriverStandings VALUES (?, ?, ?, ?, 0, 0, 1)`,
          [year,driver2ID,pointsDriver2InStandings,position2InStandings + 1],'run'
        );
      }
    }
    queryDB(
      `UPDATE Staff_Contracts SET TeamID = ?, PosInTeam = ? WHERE ContractType = 0 AND StaffID = ? AND TeamID = ?`,
      [team2ID,position2,driver1ID,team1ID],'run'
    );
    queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = ?`,[driver1ID],'run');
    queryDB(
      `UPDATE Staff_Contracts SET TeamID = ?, PosInTeam = ? WHERE ContractType = 0 AND StaffID = ? AND TeamID = ?`,
      [team1ID,position1,driver2ID,team2ID],'run'
    );
    queryDB(`UPDATE Staff_DriverData SET AssignedCarNumber = ? WHERE StaffID = ?`,[position1,driver2ID],'run');
    rearrangeDriverEngineerPairings(team1ID);
    rearrangeDriverEngineerPairings(team2ID);
  }
  fixDriverStandings();
}

export function editContract(driverID,salary,endSeason,startingBonus,raceBonus,raceBonusTargetPos) {
  const hasContract = queryDB(
    `SELECT TeamID FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0`,
    [driverID],
    "singleValue"
  );
  if (hasContract !== null && hasContract !== undefined) {
    queryDB(
      `UPDATE Staff_Contracts SET Salary = ?, EndSeason = ?, StartingBonus = ?, RaceBonus = ?, RaceBonusTargetPos = ? WHERE ContractType = 0 AND StaffID = ?`,
      [salary,endSeason,startingBonus,raceBonus,raceBonusTargetPos,driverID],'run'
    );
  }
}

export function futureContract(teamID,driverID,salary,endSeason,startingBonus,raceBonus,raceBonusTargetPos,position,yearIteration = "24") {
  if (teamID === "-1") {
    queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 3`,[driverID],'run');
  } else {
    let alreadyHasFutureContract = queryDB(
      `SELECT TeamID FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 3`,
      [driverID],
      "singleValue"
    );
    if (alreadyHasFutureContract === null || alreadyHasFutureContract === undefined) {
      alreadyHasFutureContract = -1;
    }
    if (parseInt(alreadyHasFutureContract) !== parseInt(teamID)) {
      const season = queryDB("SELECT CurrentSeason FROM Player_State",[],"singleValue");
      const day = getExcelDate(parseInt(season) + 1);
      queryDB(`DELETE FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 3`,[driverID],'run');
      if (yearIteration === "24") {
        queryDB(
          `INSERT INTO Staff_Contracts VALUES (?, 3, ?, ?, ?, ?, ?, ?, ?, ?, 0.5, 0)`,
          [driverID,teamID,position,day,endSeason,salary,startingBonus,raceBonus,raceBonusTargetPos],'run'
        );
      } else if (yearIteration === "23") {
        queryDB(
          `INSERT INTO Staff_Contracts VALUES (?, 3, 1, ?, 1, ?, ?, 1, '[OPINION_STRING_NEUTRAL]', ?, ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', ?, 1, '[OPINION_STRING_NEUTRAL]', 0, 1, '[OPINION_STRING_NEUTRAL]')`,
          [driverID,day,teamID,position,day,endSeason,salary,startingBonus,raceBonus,raceBonusTargetPos],'run'
        );
      }
    } else {
      queryDB(
        `UPDATE Staff_Contracts SET PosInTeam = ?, Salary = ?, EndSeason = ?, StartingBonus = ?, RaceBonus = ?, RaceBonusTargetPos = ? WHERE StaffID = ? AND TeamID = ? AND ContractType = 3`,
        [position,salary,endSeason,startingBonus,raceBonus,raceBonusTargetPos,driverID,alreadyHasFutureContract],'run'
      );
    }
  }
}

export function getExcelDate(year) {
  const excelStartDate = new Date(1900,0,1);
  const targetDate = new Date(year,0,1);
  const diffDays = Math.floor((targetDate - excelStartDate) / (1000 * 60 * 60 * 24)) + 2;
  return diffDays;
}

export function unretire(driverID) {
  queryDB(`UPDATE Staff_GameData SET Retired = 0 WHERE StaffID = ?`,[driverID],'run');
  queryDB(`UPDATE Staff_DriverData SET HasSuperLicense = 1 WHERE StaffID = ?`,[driverID],'run');
}

export function getTier(driverID) {
  const driverStats = queryDB(`SELECT Val FROM Staff_PerformanceStats WHERE StaffID = ?`,[driverID],"allRows");
  let type = "driver";
  let rating = 0;
  if (driverStats && driverStats.length === 9) {
    const cornering = parseFloat(driverStats[0][0]);
    const braking = parseFloat(driverStats[1][0]);
    const control = parseFloat(driverStats[2][0]);
    const smoothness = parseFloat(driverStats[3][0]);
    const adaptability = parseFloat(driverStats[4][0]);
    const overtaking = parseFloat(driverStats[5][0]);
    const defence = parseFloat(driverStats[6][0]);
    const reactions = parseFloat(driverStats[7][0]);
    const accuracy = parseFloat(driverStats[8][0]);
    rating = (cornering + braking * 0.75 + reactions * 0.5 + control * 0.75 + smoothness * 0.5 + accuracy * 0.75 + adaptability * 0.25 + overtaking * 0.25 + defence * 0.25) / 5;
    rating = Math.round(rating);
  } else if (driverStats && driverStats.length > 0) {
    type = "staff";
    driverStats.forEach(stat => {
      rating += parseFloat(stat[0]);
    });
    rating = rating / driverStats.length;
  } else {
    rating = 0;
  }
  let tier = 4;
  if (rating >= 89) {
    tier = 1;
  } else if (rating >= 85) {
    tier = 2;
  } else if (rating >= 80) {
    tier = 3;
  } else {
    tier = 4;
  }
  return [tier,type,rating];
}

export function getDriverOverall(driverID) {
  const driverStats = queryDB(`SELECT Val FROM Staff_PerformanceStats WHERE StaffID = ?`,[driverID],"allRows");
  let rating = 0;
  if (driverStats && driverStats.length === 9) {
    const cornering = parseFloat(driverStats[0][0]);
    const braking = parseFloat(driverStats[1][0]);
    const control = parseFloat(driverStats[2][0]);
    const smoothness = parseFloat(driverStats[3][0]);
    const adaptability = parseFloat(driverStats[4][0]);
    const overtaking = parseFloat(driverStats[5][0]);
    const defence = parseFloat(driverStats[6][0]);
    const reactions = parseFloat(driverStats[7][0]);
    const accuracy = parseFloat(driverStats[8][0]);
    rating = (cornering + braking * 0.75 + reactions * 0.5 + control * 0.75 + smoothness * 0.5 + accuracy * 0.75 + adaptability * 0.25 + overtaking * 0.25 + defence * 0.25) / 5;
  } else if (driverStats && driverStats.length > 0) {
    driverStats.forEach(stat => {
      rating += parseFloat(stat[0]);
    });
    rating = rating / driverStats.length;
  } else {
    rating = 0;
  }
  return Math.round(rating);
}

export function getDriverId(name) {
  let driver = name.charAt(0).toUpperCase() + name.slice(1);
  const multipleDrivers = ["Perez","Raikkonen","Hulkenberg","Toth","Stanek","Villagomez","Bolukbasi","Marti"];
  if (multipleDrivers.includes(driver)) {
    driver = driver + "1";
  }
  let driverId;
  if (driver === "Aleclerc") {
    driverId = 132;
  } else if (driver === "Devries") {
    driverId = 76;
  } else if (driver === "Dschumacher") {
    driverId = 270;
  } else {
    const lastName = `[StaffName_Surname_${driver}]`;
    driverId = queryDB(`SELECT StaffID FROM Staff_BasicData WHERE LastName = ?`,[lastName],"singleValue");
  }
  return driverId;
}

export function fixDriverStandings() {
  const year = queryDB("SELECT CurrentSeason FROM Player_State",[],"singleValue");
  const driversInStandings = queryDB(`SELECT DriverID FROM Races_DriverStandings WHERE SeasonID = ? AND RaceFormula = 1`,[year],"allRows");
  if (driversInStandings) {
    driversInStandings.forEach(driverRow => {
      const driverID = driverRow[0];
      const isDriver = queryDB(`SELECT StaffType FROM Staff_GameData WHERE StaffID = ?`,[driverID],"singleValue");
      if (isDriver !== 0) {
        queryDB(`DELETE FROM Races_DriverStandings WHERE DriverID = ? AND SeasonID = ? AND RaceFormula = 1`,[driverID,year],'run');
      }
    });
  }
}
