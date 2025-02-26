import {
  fetchSeasonResults, fetchEventsFrom, fetchTeamsStandings,
  fetchDrivers, fetchStaff, fetchEngines, fetchCalendar, fetchYear, fetchDriverNumbers, checkCustomTables, checkYearSave,
  fetchOneDriverSeasonResults, fetchOneTeamSeasonResults, fetchEventsDoneFrom, updateCustomEngines, fetchDriversPerYear, fetchDriverContract,
  editEngines, updateCustomConfig, fetchCustomConfig,
  fetch2025ModData
} from "./scriptUtils/dbUtils";
import { getPerformanceAllTeamsSeason, getAttributesAllTeams, getPerformanceAllCars, getAttributesAllCars } from "./scriptUtils/carAnalysisUtils"
import { setDatabase, getMetadata, getDatabase } from "./dbManager";
import { fetchHead2Head, fetchHead2HeadTeam } from "./scriptUtils/head2head";
import { editTeam, fetchTeamData } from "./scriptUtils/editTeamUtils";
import { overwritePerformanceTeam, updateItemsForDesignDict, fitLoadoutsDict, getPartsFromTeam, getUnitValueFromParts, getAllPartsFromTeam, getMaxDesign, getUnitValueFromOnePart } from "./scriptUtils/carAnalysisUtils";
import { setGlobals, getGlobals } from "./commandGlobals";
import { editAge, editMarketability, editName, editRetirement, editSuperlicense, editCode, editMentality, editStats } from "./scriptUtils/eidtStatsUtils";
import { editCalendar } from "./scriptUtils/calendarUtils";
import { fireDriver, hireDriver, swapDrivers, editContract, futureContract } from "./scriptUtils/transferUtils";
import { change2024Standings, changeDriverLineUps, changeStats, removeFastestLap, timeTravelWithData, manageAffiliates, changeRaces, manageStandings, insertStaff, manageFeederSeries } from "./scriptUtils/modUtils";
import { teamReplaceDict } from "./commandGlobals";
import { excelToDate } from "./scriptUtils/eidtStatsUtils";
import { analyzeFileToDatabase, repack } from "./UESaveHandler";

import initSqlJs from 'sql.js';

// Diccionario de comandos
const workerCommands = {
  loadDB: async (data, postMessage) => {
    console.log(data)
    const SQL = await initSqlJs({
      locateFile: file => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm',
      wasmMemory: new WebAssembly.Memory({ initial: 1024 })
    });

    const { db, metadata } = await analyzeFileToDatabase(data.file, SQL);

    let day = metadata.careerSaveMetadata.Day;
    let date = excelToDate(day);

    console.log(metadata)

    setDatabase(db, metadata);

    postMessage({ responseMessage: "Database loaded", content: date });
  },
  exportSave: async (data, postMessage) => {
    const db = getDatabase();
    const metadata = getMetadata();

    const result = repack(db, metadata);
    
    postMessage({ responseMessage: "Database exported", content: result });
  },

  yearSelected: (year, postMessage) => {
    const results = fetchSeasonResults(year);
    const events = fetchEventsFrom(year);
    const teams = fetchTeamsStandings(year);

    postMessage({
      responseMessage: "Results fetched",
      content: [events, results, teams]
    });
  },

  saveSelected: (data, postMessage) => {
    

    const yearData = checkYearSave();
    postMessage({ responseMessage: "Game Year", content: yearData });

    checkCustomTables(yearData[0]);

    if (yearData[1] !== null) {
      setGlobals({ createTeam: true });
    }
    else {
      setGlobals({ createTeam: false });
    }

    setGlobals({year: yearData[0]});

    const drivers = fetchDrivers(yearData[0]);
    postMessage({ responseMessage: "Save loaded succesfully", content: drivers, noti_msg: "Save loaded succesfully" });

    const staff = fetchStaff(yearData[0]);
    postMessage({ responseMessage: "Staff fetched", content: staff });

    const customConfig = fetchCustomConfig();
    postMessage({ responseMessage: "Config", content: customConfig });

    const engines = fetchEngines();
    postMessage({ responseMessage: "Engines fetched", content: engines });

    const calendar = fetchCalendar();
    postMessage({ responseMessage: "Calendar fetched", content: calendar });

    const year = fetchYear();
    postMessage({ responseMessage: "Year fetched", content: year });

    const numbers = fetchDriverNumbers();
    postMessage({ responseMessage: "Numbers fetched", content: numbers });

    const [performance, races] = getPerformanceAllTeamsSeason(yearData[2]);
    postMessage({ responseMessage: "Season performance fetched", content: [performance, races] });

    const attributes = getAttributesAllTeams(yearData[2]);
    postMessage({ responseMessage: "Performance fetched", content: [performance[performance.length - 1], attributes] });

    const carPerformance = getPerformanceAllCars(yearData[2]);
    const carAttributes = getAttributesAllCars(yearData[2]);
    postMessage({ responseMessage: "Cars fetched", content: [carPerformance, carAttributes] });

    const mod2025Data = fetch2025ModData();
    postMessage({ responseMessage: "Mod data fetched", content: mod2025Data });
  },
  configuredH2H: (data, postMessage) => {
    if (data.h2h !== "-1") {
      let h2hRes;
      if (data.mode === "driver") {
        h2hRes = fetchHead2Head(data.h2h[0], data.h2h[1], data.year);
      } else if (data.mode === "team") {
        h2hRes = fetchHead2HeadTeam(data.h2h[0], data.h2h[1], data.year, "team");
      }

      if (h2hRes) {
        postMessage({ responseMessage: "H2H fetched", content: h2hRes, isEditCommand: true });
      }
    }

    const h2hDrivers = [];
    data.graph.forEach(driver => {
      let res;
      if (data.mode === "driver") {
        res = fetchOneDriverSeasonResults(driver, data.year);
      } else if (data.mode === "team") {
        res = fetchOneTeamSeasonResults(driver, data.year);
      }
      h2hDrivers.push(res);
    });

    // Consulta eventos y los envía al frontend
    const eventsDone = fetchEventsDoneFrom(data.year);
    const allEvents = fetchEventsFrom(data.year);
    h2hDrivers.push(eventsDone);
    h2hDrivers.unshift(allEvents);

    postMessage({ responseMessage: "H2HDriver fetched", content: h2hDrivers });
  },
  customEngines: (data, postMessage) => {
    updateCustomEngines(data.enginesData);
    postMessage({ responseMessage: "Custom engines updated",
                  noti_msg: "Succesfully updated the custom engines", 
                  isEditCommand: true, 
                  unlocksDownload: true });
    const engines = fetchEngines();
    postMessage({ responseMessage: "Engines fetched", content: engines });
  },
  yearSelectedH2H: (data, postMessage) => {
    const drivers = fetchDriversPerYear(data.year);

    postMessage({ responseMessage: "DriversH2H fetched", content: drivers });
  },
  teamRequest: (data, postMessage) => {
    const teamID = data.teamID;
    const teamData = fetchTeamData(teamID);
    postMessage({ responseMessage: "TeamData fetched", content: teamData });
  },
  performanceRequest: (data, postMessage) => {
    const designDict = getPartsFromTeam(data.teamID);
    const unitValues = getUnitValueFromParts(designDict);
    const allParts = getAllPartsFromTeam(data.teamID);
    const maxDesign = getMaxDesign();

    const designResponse = { responseMessage: "Parts stats fetched", content: [unitValues, allParts, maxDesign] };
    postMessage(designResponse);
  },
  driverRequest: (data, postMessage) => {
    const contract = fetchDriverContract(data.driverID);
    postMessage({ responseMessage: "Contract fetched", content: contract });
  },
  partRequest: (data, postMessage) => {
    const partValues = getUnitValueFromOnePart(data.designID);
    postMessage({ responseMessage: "Part values fetched", content: partValues });
  },
  editTeam: (data, postMessage) => {
    editTeam(data);
    postMessage({ responseMessage: "Team updated", 
                  noti_msg: `Succesfully edited ${teamReplaceDict[data.teamName]}'s details`, 
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  editStats: (data, postMessage) => {
    const globals = getGlobals();
    editRetirement(data.driverID, data.isRetired);
    if (data.typeStaff === "0") {
      editSuperlicense(data.driverID, data.superLicense);
      if (globals.yearIteration == "24") {
        editMarketability(data.driverID, data.marketability);
      }
    }
    editStats(data.driverID, data.typeStaff, data.statsArray, data.retirement, data.driverNum, data.wants1);

    if (data.mentality !== "-1" && globals.yearIteration == "24") {
      editMentality(data.driverID, data.mentality);
    }
    editAge(data.driverID, data.age);
    if (data.newName !== "-1") {
      editName(data.driverID, data.newName);
    }
    if (data.newCode !== "-1") {
      editCode(data.driverID, data.newCode);
    }

    postMessage({ responseMessage: "Stats updated", 
                  noti_msg: `Succesfully edited ${data.driver}'s stats`, 
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  editPerformance: (data, postMessage) => {
    let globals = getGlobals();

    const yearData = checkYearSave();

    overwritePerformanceTeam(data.teamID, data.parts, globals.isCreateATeam, globals.yearIteration, data.loadouts);
    updateItemsForDesignDict(data.n_parts_designs, data.teamID)
    fitLoadoutsDict(data.loadouts, data.teamID)

    const [performance, races] = getPerformanceAllTeamsSeason(yearData[2]);
    const performanceResponse = { responseMessage: "Season performance fetched", content: [performance, races], noti_msg: `Succesfully edited ${teamReplaceDict[data.teamName]}'s car performance` };
    postMessage(performanceResponse);

    const attibutes = getAttributesAllTeams(yearData[2]);
    const attributesResponse = { responseMessage: "Performance fetched", content: [performance[performance.length - 1], attibutes] };
    postMessage(attributesResponse);

    const carPerformance = getPerformanceAllCars(yearData[2]);
    const carAttributes = getAttributesAllCars(yearData[2]);
    const carPerformanceResponse = {  responseMessage: "Cars fetched", 
                                      content: [carPerformance, carAttributes], 
                                      isEditCommand: true,
                                      unlocksDownload: true  };
    postMessage(carPerformanceResponse);
  },
  editEngine: (data, postMessage) => {
    editEngines(data.engines)
    postMessage({ responseMessage: "Engines updated", 
                  noti_msg: "Succesfully edited all engines performance", 
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  editContract: (data, postMessage) => {
    const year = getGlobals().yearIteration;

    editContract(data.driverID, data.salary, data.year,
      data.signBonus, data.raceBonus, data.raceBonusPos);

    futureContract(data.futureTeam, data.driverID, data.futureSalary, data.futureYear,
      data.futureSignBonus, data.futureRaceBonus, data.futureRaceBonusPos, data.futurePosition, year);

    postMessage({ responseMessage: "Contract updated", 
                  noti_msg: `Succesfully edited ${data.driver}'s contract`, 
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  editCalendar: (data, postMessage) => {
    const year = getGlobals().yearIteration;
    editCalendar(data.calendarCodes, year);
    postMessage({ responseMessage: "Calendar updated", 
                  noti_msg: "Succesfully updated the calendar", 
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  configUpdate: (data, postMessage) => {
    updateCustomConfig(data);
    postMessage({ responseMessage: "Config updated", 
                  noti_msg: "Succesfully updated the configuration",
                  unlocksDownload: true  });
  },
  fireDriver: (data, postMessage) => {
    fireDriver(data.driverID, data.teamID);
    postMessage({ responseMessage: "Driver fired", 
                  noti_msg: `Succesfully fired ${data.driver} from ${data.team}`, 
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  hireDriver: (data, postMessage) => {
    hireDriver("hire", data.driverID, data.teamID, data.position, data.salary, data.signBonus, data.raceBonus, data.raceBonusPos, data.year, getGlobals().yearIteration);
    postMessage({ responseMessage: "Driver hired", 
                  noti_msg: `Succesfully hired ${data.driver} to ${data.team}`, 
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  autoContract: (data, postMessage) => {
    hireDriver("auto", data.driverID, data.teamID, data.position, getGlobals().yearIteration);
    postMessage({ responseMessage: "Driver hired", 
                  noti_msg: `Succesfully hired ${data.driver} to ${data.team}`, 
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  swapDrivers: (data, postMessage) => {
    swapDrivers(data.driver1ID, data.driver2ID);
    postMessage({ responseMessage: "Drivers swapped", 
                  noti_msg: `Succesfully swapped ${data.driver1} and ${data.driver2}`, 
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  timeTravel: (data, postMessage) => {
    timeTravelWithData(data.dayNumber, true);
    // manageStandings();
    postMessage({ responseMessage: "Time travel",
                  noti_msg: `Succesfully time travelled to 2025`,
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  changeLineUps: (data, postMessage) => {
    changeDriverLineUps();
    manageAffiliates();
    manageFeederSeries();
    postMessage({ responseMessage: "Line ups changed",
                  noti_msg: `Succesfully changed the driver line ups to match 2025`,
                  isEditCommand: true,
                  unlocksDownload: true  });

    const yearData = checkYearSave();

    const staff = fetchStaff(yearData[0]);
    postMessage({ responseMessage: "Staff fetched", content: staff });
  },
  changeStats: (data, postMessage) => {
    changeStats();
    postMessage({ responseMessage: "Stats changed",
                  noti_msg: `Succesfully changed the stats to match 2025`,
                  isEditCommand: true,
                  unlocksDownload: true  });

                  const yearData = checkYearSave();

    const staff = fetchStaff(yearData[0]);
    postMessage({ responseMessage: "Staff fetched", content: staff });
  },
  changeCfd: (data, postMessage) => {
    change2024Standings();
    postMessage({ responseMessage: "CFD times changed",
                  noti_msg: `Succesfully changed CFD times for 2025`,
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  changeRegulations: (data, postMessage) => {
    removeFastestLap();
    postMessage({ responseMessage: "Regulations changed",
                  noti_msg: `Succesfully removed fastest lap bonus for 2025`,
                  isEditCommand: true,
                  unlocksDownload: true  });
  },
  changeCalendar: (data, postMessage) => {
    changeRaces();
    postMessage({ responseMessage: "Calendar changed",
                  noti_msg: `Succesfully changed the calendar to match 2025`,
                  isEditCommand: true,
                  unlocksDownload: true  });

    const calendar = fetchCalendar();
    postMessage({ responseMessage: "Calendar fetched", content: calendar });
  },
  extraDrivers: (data, postMessage) => {
    insertStaff();
    postMessage({ responseMessage: "Extra drivers added",
                  noti_msg: `Succesfully added extra drivers to the database`,
                  isEditCommand: true,
                  unlocksDownload: true  });
  },

};


self.addEventListener('message', async (e) => {
  console.log(e.data);
  const { command, data } = e.data;
  if (workerCommands[command]) {
    try {
      await workerCommands[command](data, (response) => postMessage(response));
    } catch (error) {
      console.error(`[Worker] Error executing command '${command}':`, error);
      postMessage({ responseMessage: "Error", error: error.message });
    }
  } else {
    console.error(`[Worker] Unknown command: '${command}'`);
    postMessage({ responseMessage: "Unknown command", command });
  }
});
