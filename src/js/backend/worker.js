import {
  fetchSeasonResults, fetchEventsFrom, fetchTeamsStandings,
  fetchDrivers, fetchStaff, fetchEngines, fetchCalendar, fetchYear, fetchDriverNumbers, checkCustomTables, checkYearSave,
  fetchOneDriverSeasonResults, fetchOneTeamSeasonResults, fetchEventsDoneFrom, updateCustomEngines, fetchDriversPerYear, fetchDriverContract,
  editEngines, updateCustomConfig, fetchCustomConfig,
  fetch2025ModData, check2025ModCompatibility,
  fetchPointsRegulations,
  getDate
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
import { change2024Standings, changeDriverLineUps, changeStats, removeFastestLap, timeTravelWithData, manageAffiliates, changeRaces, manageStandings, insertStaff, manageFeederSeries, changeDriverEngineerPairs, updatePerofmrnace2025, fixes_mod } from "./scriptUtils/modUtils";
import {
  generate_news, getOneQualiDetails, getOneRaceDetails, getTransferDetails, getTeamComparisonDetails,
  getFullChampionSeasonDetails, generateTurningResponse, upsertNews,
  updateNewsFields,
  upsertTurningPoints,
  loadTPFromDB,
  computeStableKey,
  migrateLegacyData,
  loadNewsMapFromDB,
  ensureTurningPointsStructure,
  deleteNews,
  deleteTurningPoints
} from "./scriptUtils/newsUtils";
import { getSelectedRecord } from "./scriptUtils/recordUtils";
import { teamReplaceDict } from "./commandGlobals";
import { excelToDate } from "./scriptUtils/eidtStatsUtils";
import { analyzeFileToDatabase, repack } from "./UESaveHandler";

import initSqlJs from 'sql.js';
import { combined_dict } from "../frontend/config";

// Command Dictionary
const workerCommands = {
  /**
   * Loads the database from a file provided in the data.
   * @param {Object} data - Contains the file to load.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  loadDB: async (data, postMessage) => {
    console.log(data)
    const SQL = await initSqlJs({
      locateFile: file => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm',
      wasmMemory: new WebAssembly.Memory({ initial: 1024, maximum: 2048 })
    });

    const { db, metadata } = await analyzeFileToDatabase(data.file, SQL);

    console.log(metadata)

    let day = metadata.careerSaveMetadata.Day;
    let date = excelToDate(day);

    setDatabase(db, metadata);

    postMessage({ responseMessage: "Database loaded", content: date });
  },

  /**
   * Exports the current state of the database to a save file.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  exportSave: async (data, postMessage) => {
    const db = getDatabase();
    const metadata = getMetadata();

    const result = repack(db, metadata);

    postMessage({ responseMessage: "Database exported", content: result });
  },

  /**
   * Fetches data for a specific season/year.
   * @param {Object} data - Contains the year and whether it is the current year.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  yearSelected: (data, postMessage) => {
    const year = data.year
    const isCurrentYear = data.isCurrentYear || true;
    const results = fetchSeasonResults(year, isCurrentYear, true);
    const events = fetchEventsFrom(year);
    const teams = fetchTeamsStandings(year);
    const pointsInfo = fetchPointsRegulations()

    postMessage({
      responseMessage: "Results fetched",
      content: [events, results, teams, pointsInfo]
    });
  },

  /**
   * Handles the selection of a save file, loading various game data.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
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

    setGlobals({ year: yearData[0] });

    const date = getDate();
    setGlobals({ date: date });

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

    const modCompatibility = check2025ModCompatibility(yearData[0]);
    postMessage({ responseMessage: "Mod compatibility", content: modCompatibility });

    const wasError = fixes_mod();
    if (wasError) {
      postMessage({ responseMessage: "Mod fixes", content: "", noti_msg: "An error in the 2025 DLC has been automatically fixed", unlocksDownload: true });
    }

    postMessage({ responseMessage: "Save selected finished" });
  },

  /**
   * Fetches Head-to-Head data for drivers or teams.
   * @param {Object} data - Contains H2H parameters and graph configuration.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  configuredH2H: (data, postMessage) => {
    if (data.h2h !== "-1") {
      let h2hRes;
      if (data.mode === "driver") {
        h2hRes = fetchHead2Head(data.h2h[0], data.h2h[1], data.year, data.isCurrentYear);
      } else if (data.mode === "team") {
        h2hRes = fetchHead2HeadTeam(data.h2h[0], data.h2h[1], data.year, data.isCurrentYear);
      }

      if (h2hRes) {
        postMessage({ responseMessage: "H2H fetched", content: h2hRes, isEditCommand: true });
      }
    }

    const h2hDrivers = [];
    data.graph.forEach(driver => {
      let res;
      if (data.mode === "driver") {
        res = fetchOneDriverSeasonResults(driver, data.year, data.isCurrentYear);
      } else if (data.mode === "team") {
        res = fetchOneTeamSeasonResults(driver, data.year);
      }
      h2hDrivers.push(res);
    });

    // Query events and send to frontend
    const eventsDone = fetchEventsDoneFrom(data.year);
    const allEvents = fetchEventsFrom(data.year);
    h2hDrivers.push(eventsDone);
    h2hDrivers.unshift(allEvents);

    postMessage({ responseMessage: "H2HDriver fetched", content: h2hDrivers });
  },

  /**
   * Updates custom engine data.
   * @param {Object} data - Contains engine data.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  customEngines: (data, postMessage) => {
    updateCustomEngines(data.enginesData);
    postMessage({
      responseMessage: "Custom engines updated",
      noti_msg: "Succesfully updated the custom engines",
      isEditCommand: true,
      unlocksDownload: true
    });
    const engines = fetchEngines();
    postMessage({ responseMessage: "Engines fetched", content: engines });
  },

  /**
   * Fetches drivers for a specific year for H2H comparison.
   * @param {Object} data - Contains the year.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  yearSelectedH2H: (data, postMessage) => {
    const drivers = fetchDriversPerYear(data.year);

    postMessage({ responseMessage: "DriversH2H fetched", content: drivers });
  },

  /**
   * Fetches data for a specific team.
   * @param {Object} data - Contains the team ID.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  teamRequest: (data, postMessage) => {
    const teamID = data.teamID;
    const teamData = fetchTeamData(teamID);
    postMessage({ responseMessage: "TeamData fetched", content: teamData });
  },

  /**
   * Fetches performance parts data for a team.
   * @param {Object} data - Contains the team ID.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  performanceRequest: (data, postMessage) => {
    const designDict = getPartsFromTeam(data.teamID);
    const unitValues = getUnitValueFromParts(designDict);
    const allParts = getAllPartsFromTeam(data.teamID);
    const maxDesign = getMaxDesign();

    const designResponse = { responseMessage: "Parts stats fetched", content: [unitValues, allParts, maxDesign] };
    postMessage(designResponse);
  },

  /**
   * Fetches contract data for a driver.
   * @param {Object} data - Contains the driver ID.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  driverRequest: (data, postMessage) => {
    const contract = fetchDriverContract(data.driverID);
    postMessage({ responseMessage: "Contract fetched", content: contract });
  },

  /**
   * Fetches values for a specific part design.
   * @param {Object} data - Contains the design ID.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  partRequest: (data, postMessage) => {
    const partValues = getUnitValueFromOnePart(data.designID);
    postMessage({ responseMessage: "Part values fetched", content: partValues });
  },

  /**
   * Updates team details.
   * @param {Object} data - Contains team data to update.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  editTeam: (data, postMessage) => {
    editTeam(data);
    postMessage({
      responseMessage: "Team updated",
      noti_msg: `Succesfully edited ${teamReplaceDict[data.teamName]}'s details`,
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Updates driver statistics.
   * @param {Object} data - Contains driver stats and update parameters.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  editStats: (data, postMessage) => {
    const globals = getGlobals();
    editRetirement(data.driverID, data.isRetired);
    if (data.typeStaff === "0") {
      editSuperlicense(data.driverID, data.superLicense);
      if (globals.yearIteration === "24") {
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

    postMessage({
      responseMessage: "Stats updated",
      noti_msg: `Succesfully edited ${data.driver}'s stats`,
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Updates team performance and car parts.
   * @param {Object} data - Contains parts and loadout data.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
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
    const carPerformanceResponse = {
      responseMessage: "Cars fetched",
      content: [carPerformance, carAttributes],
      isEditCommand: true,
      unlocksDownload: true
    };
    postMessage(carPerformanceResponse);
  },

  /**
   * Updates engine data.
   * @param {Object} data - Contains engine update data.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  editEngine: (data, postMessage) => {
    editEngines(data.engines)
    postMessage({
      responseMessage: "Engines updated",
      noti_msg: "Succesfully edited all engines performance",
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Updates driver contract.
   * @param {Object} data - Contains contract details.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  editContract: (data, postMessage) => {
    const year = getGlobals().yearIteration;

    editContract(data.driverID, data.salary, data.year,
      data.signBonus, data.raceBonus, data.raceBonusPos);

    futureContract(data.futureTeam, data.driverID, data.futureSalary, data.futureYear,
      data.futureSignBonus, data.futureRaceBonus, data.futureRaceBonusPos, data.futurePosition, year);

    postMessage({
      responseMessage: "Contract updated",
      noti_msg: `Succesfully edited ${data.driver}'s contract`,
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Updates calendar data.
   * @param {Object} data - Contains calendar codes and race data.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  editCalendar: (data, postMessage) => {
    const year = getGlobals().yearIteration;
    editCalendar(data.calendarCodes, year, data.racesData);
    postMessage({
      responseMessage: "Calendar updated",
      noti_msg: "Succesfully updated the calendar",
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Updates custom configuration.
   * @param {Object} data - Contains configuration data.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  configUpdate: (data, postMessage) => {
    updateCustomConfig(data);
    postMessage({
      responseMessage: "Config updated",
      noti_msg: "Succesfully updated the configuration",
      unlocksDownload: true
    });
  },

  /**
   * Fires a driver from a team.
   * @param {Object} data - Contains driver and team IDs.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  fireDriver: (data, postMessage) => {
    fireDriver(data.driverID, data.teamID);
    postMessage({
      responseMessage: "Driver fired",
      noti_msg: `Succesfully fired ${data.driver} from ${data.team}`,
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Hires a driver to a team.
   * @param {Object} data - Contains driver, team, and contract details.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  hireDriver: (data, postMessage) => {
    hireDriver("hire", data.driverID, data.teamID, data.position, data.salary, data.signBonus, data.raceBonus, data.raceBonusPos, data.year, getGlobals().yearIteration);
    postMessage({
      responseMessage: "Driver hired",
      noti_msg: `Succesfully hired ${data.driver} to ${data.team}`,
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Automatically assigns a driver to a team with default contract.
   * @param {Object} data - Contains driver and team IDs.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  autoContract: (data, postMessage) => {
    hireDriver("auto", data.driverID, data.teamID, data.position, getGlobals().yearIteration);
    postMessage({
      responseMessage: "Driver hired",
      noti_msg: `Succesfully hired ${data.driver} to ${data.team}`,
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Swaps two drivers between their teams.
   * @param {Object} data - Contains IDs of both drivers.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  swapDrivers: (data, postMessage) => {
    swapDrivers(data.driver1ID, data.driver2ID);
    postMessage({
      responseMessage: "Drivers swapped",
      noti_msg: `Succesfully swapped ${data.driver1} and ${data.driver2}`,
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Advances time in the game to a specific day.
   * @param {Object} data - Contains the day number.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  timeTravel: (data, postMessage) => {
    timeTravelWithData(data.dayNumber, true);
    // manageStandings();
    postMessage({
      responseMessage: "Time travel",
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Updates driver lineups, affiliates, feeder series, and engineer pairs.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  changeLineUps: (data, postMessage) => {
    changeDriverLineUps();
    manageAffiliates();
    manageFeederSeries();
    changeDriverEngineerPairs();
    postMessage({
      responseMessage: "Line ups changed",
      isEditCommand: true,
      unlocksDownload: true
    });

    const yearData = checkYearSave();

    const drivers = fetchDrivers(yearData[0]);
    postMessage({ responseMessage: "Drivers fetched", content: drivers });

    const staff = fetchStaff(yearData[0]);
    postMessage({ responseMessage: "Staff fetched", content: staff });
  },

  /**
   * Refreshes the drivers data.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  driversRefresh: (data, postMessage) => {
    const yearData = checkYearSave();

    const drivers = fetchDrivers(yearData[0]);
    postMessage({ responseMessage: "Drivers fetched", content: drivers });
  },

  /**
   * Refreshes the calendar data.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  calendarRefresh: (data, postMessage) => {
    const calendar = fetchCalendar();
    postMessage({ responseMessage: "Calendar fetched", content: calendar });
  },

  /**
   * Applies changes to statistics.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  changeStats: (data, postMessage) => {
    changeStats();
    postMessage({
      responseMessage: "Stats changed",
      isEditCommand: true,
      unlocksDownload: true
    });

    const yearData = checkYearSave();

    const staff = fetchStaff(yearData[0]);
    postMessage({ responseMessage: "Staff fetched", content: staff });
  },

  /**
   * Updates CFD times.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  changeCfd: (data, postMessage) => {
    change2024Standings();
    postMessage({
      responseMessage: "CFD times changed",
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Changes game regulations.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  changeRegulations: (data, postMessage) => {
    removeFastestLap();
    postMessage({
      responseMessage: "Regulations changed",
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Changes the calendar type.
   * @param {Object} data - Contains the calendar type.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  changeCalendar: (data, postMessage) => {
    changeRaces(data.type);
    postMessage({
      responseMessage: "Calendar changed",
      isEditCommand: true,
      unlocksDownload: true
    });

    const calendar = fetchCalendar();
    postMessage({ responseMessage: "Calendar fetched", content: calendar });
  },

  /**
   * Adds extra drivers/staff.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  extraDrivers: (data, postMessage) => {
    insertStaff();
    postMessage({
      responseMessage: "Extra drivers added",
      isEditCommand: true,
      unlocksDownload: true
    });
  },

  /**
   * Updates 2025 performance data.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  changePerformance: (data, postMessage) => {
    updatePerofmrnace2025();
    postMessage({
      responseMessage: "Performance changed",
      isEditCommand: true,
      unlocksDownload: true
    });

    const yearData = checkYearSave();

    const [performance, races] = getPerformanceAllTeamsSeason(yearData[2]);
    const performanceResponse = { responseMessage: "Season performance fetched", content: [performance, races] };
    postMessage(performanceResponse);

    const attibutes = getAttributesAllTeams(yearData[2]);
    const attributesResponse = { responseMessage: "Performance fetched", content: [performance[performance.length - 1], attibutes] };
    postMessage(attributesResponse);

    const carPerformance = getPerformanceAllCars(yearData[2]);
    const carAttributes = getAttributesAllCars(yearData[2]);
    const carPerformanceResponse = {
      responseMessage: "Cars fetched",
      content: [carPerformance, carAttributes],
      isEditCommand: true,
      unlocksDownload: true
    };

    postMessage(carPerformanceResponse);
  },

  /**
   * Refreshes performance data.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  performanceRefresh: (data, postMessage) => {
    const yearData = checkYearSave();

    const [performance, races] = getPerformanceAllTeamsSeason(yearData[2]);
    const performanceResponse = { responseMessage: "Season performance fetched", content: [performance, races] };
    postMessage(performanceResponse);

    const attibutes = getAttributesAllTeams(yearData[2]);
    const attributesResponse = { responseMessage: "Performance fetched", content: [performance[performance.length - 1], attibutes] };
    postMessage(attributesResponse);

    const carPerformance = getPerformanceAllCars(yearData[2]);
    const carAttributes = getAttributesAllCars(yearData[2]);
    const carPerformanceResponse = {
      responseMessage: "Cars fetched",
      content: [carPerformance, carAttributes],
      isEditCommand: true,
      unlocksDownload: true
    };

    postMessage(carPerformanceResponse);
  },

  /**
   * Generates news items.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  generateNews: (data, postMessage) => {
    try {
      const savedNewsMap = loadNewsMapFromDB();   // ← from DB
      const tpStateFromDB = loadTPFromDB();        // ← from DB

      // if you need to ensure minimal TP structure, do it here
      const tpState = ensureTurningPointsStructure(tpStateFromDB);

      const { newsList, turningPointState } = generate_news(savedNewsMap, tpState);

      postMessage({
        responseMessage: "News fetched",
        noti_msg: "News generated successfully",
        content: { newsList, turningPointState },
        unlocksDownload: true
      });
    } catch (e) {
      console.error(e);
      postMessage({ responseMessage: "Error", error: e.message });
    }
  },

  /**
   * Updates the combined dictionary with new team name.
   * @param {Object} data - Contains team ID and new name.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  updateCombinedDict: (data, postMessage) => {
    const teamId = data.teamID;
    const newName = data.newName;

    combined_dict[teamId] = newName;
    postMessage({ responseMessage: "Combined dict updated", content: combined_dict });
  },

  /**
   * Fetches details for a specific race.
   * @param {Object} data - Contains race ID.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  raceDetailsRequest: (data, postMessage) => {
    const raceId = data.raceid;
    const results = getOneRaceDetails(raceId);

    postMessage({ responseMessage: "Race details fetched", content: results });
  },

  /**
   * Fetches details for a specific qualifying session.
   * @param {Object} data - Contains race ID.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  qualiDetailsRequest: (data, postMessage) => {
    const qualiId = data.raceid;
    const results = getOneQualiDetails(qualiId);

    postMessage({ responseMessage: "Quali details fetched", content: results });
  },

  /**
   * Fetches transfer rumors and details.
   * @param {Object} data - Contains drivers and date.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  transferRumorRequest: (data, postMessage) => {
    const drivers = data.drivers;
    const date = data.date || null; // New date parameter

    const info = getTransferDetails(drivers, date)

    postMessage({ responseMessage: "Transfer details fetched", content: info });
  },

  /**
   * Fetches team comparison details.
   * @param {Object} data - Contains team ID, season, and date.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  teamComparisonRequest: (data, postMessage) => {
    const teamId = data.team;
    const season = data.season;
    const date = data.date;

    const results = getTeamComparisonDetails(teamId, season, date);
    postMessage({ responseMessage: "Team comparison details fetched", content: results });
  },

  /**
   * Fetches full championship season details.
   * @param {Object} data - Contains the season.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  fullChampionshipDetailsRequest: (data, postMessage) => {
    const season = data.season;

    const results = getFullChampionSeasonDetails(season);
    postMessage({ responseMessage: "Full championship details fetched", content: results });
  },

  /**
   * Fetches a specific record.
   * @param {Object} data - Contains record type and year.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  recordSelected: (data, postMessage) => {
    const type = data.type;
    const year = data.year;

    const record = getSelectedRecord(type, year);

    postMessage({ responseMessage: "Record fetched", content: record });
  },

  /**
   * Approves a turning point, generating positive news.
   * @param {Object} data - Contains turning point data, type, maxDate, etc.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  approveTurningPoint: (data, postMessage) => {
    const turningPointData = data.turningPointData;
    const type = data.type;
    const maxDate = data.maxDate;
    const originalStableKey = data.id;
    const nonReadable = data.nonReadable || false;

    const newResponse = generateTurningResponse(turningPointData, type, maxDate, "positive");
    newResponse.stableKey = newResponse.stableKey ?? computeStableKey(newResponse);

    if (originalStableKey) {
      updateNewsFields(originalStableKey, {
        turning_point_type: "approved",
        ...(nonReadable ? { nonReadable: true } : {})
      });
    }

    upsertNews([newResponse]);


    postMessage({ responseMessage: "Turning point positive", noti_msg: "Accepted turning point", content: newResponse, isEditCommand: true, unlocksDownload: true });
  },

  /**
   * Cancels a turning point, generating negative news.
   * @param {Object} data - Contains turning point data, type, maxDate, etc.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  cancelTurningPoint: (data, postMessage) => {
    const turningPointData = data.turningPointData;
    const type = data.type;
    const maxDate = data.maxDate;
    const originalStableKey = data.id;

    const newResponse = generateTurningResponse(turningPointData, type, maxDate, "negative");
    newResponse.stableKey = newResponse.stableKey ?? computeStableKey(newResponse);

    if (originalStableKey) {
      updateNewsFields(originalStableKey, { turning_point_type: "cancelled" });
    }

    upsertNews([newResponse]);

    postMessage({ responseMessage: "Turning point negative", noti_msg: "Cancelled turning point", content: newResponse, isEditCommand: true, unlocksDownload: true });
  },

  /**
   * Saves the list of news.
   * @param {Object} data - Contains the news list.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  saveNewsState: (data, postMessage) => {
    try {
      upsertNews(data.newsList || []);
      postMessage({ responseMessage: "News saved", noti_msg: "News saved successfully", isEditCommand: true, unlocksDownload: true });
    } catch (e) {
      console.error(e);
      postMessage({ responseMessage: "Error", error: e.message, unlocksDownload: true });
    }
  },

  /**
   * Updates specific fields of a news item.
   * @param {Object} data - Contains stableKey and patch data.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  updateNews: (data, postMessage) => {
    try {
      const ok = updateNewsFields(
        data.stableKey,
        data.patch || {} // { text, nonReadable, turning_point_type, ... }
      );
      postMessage({ responseMessage: ok ? "News updated" : "News not found", noti_msg: ok ? "News updated successfully" : "News not found", isEditCommand: true, unlocksDownload: true });
    } catch (e) {
      console.error(e);
      postMessage({ responseMessage: "Error", error: e.message, unlocksDownload: true });
    }
  },

  /**
   * Retrieves all news.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  getNews: (data, postMessage) => {
    const newsMap = loadNewsMapFromDB();
    postMessage({ responseMessage: "News map", content: newsMap });
  },

  /**
   * Saves the state of turning points.
   * @param {Object} data - Contains turning point state.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  saveTurningPoints: (data, postMessage) => {
    try {
      upsertTurningPoints(data.turningPointState || {});
      postMessage({ responseMessage: "Turning points saved successfully" });
    } catch (e) {
      console.error(e);
      postMessage({ responseMessage: "Error", error: e.message, unlocksDownload: true });
    }
  },

  /**
   * Retrieves turning points.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  getTurningPoints: (data, postMessage) => {
    const turningPoints = loadTPFromDB();
    postMessage({ responseMessage: "Turning points", content: turningPoints });
  },

  /**
   * Migrates legacy data from local storage.
   * @param {Object} data - Contains legacy news and TP text.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  migrateFromLocalStorage: (data, postMessage) => {
    try {
      const { lsNewsTxt, lsTPTxt } = data || {};
      const res = migrateLegacyData(lsNewsTxt, lsTPTxt);
      postMessage({ responseMessage: "Migration done", status: res, noti_msg: "Migration completed successfully", isEditCommand: true, unlocksDownload: true });
    } catch (e) {
      console.error("Migration error (worker):", e);
      postMessage({ responseMessage: "Error", error: e.message });
    }
  },

  /**
   * Deletes all news and turning points.
   * @param {Object} data - Unused.
   * @param {Function} postMessage - Function to send a message back to the main thread.
   */
  deleteNews: (data, postMessage) => {
    deleteNews();
    deleteTurningPoints();
    postMessage({ responseMessage: "News deleted successfully", unlocksDownload: true });
  }


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
