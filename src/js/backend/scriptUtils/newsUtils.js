import { fetchEventsDoneFrom, formatNamesSimple, fetchEventsDoneBefore, fetchPointsRegulations, computeDriverOfTheDayFromRows, getDoDTopNForRace, editEngines } from "./dbUtils";
import { races_names, countries_dict, countries_data, getParamMap, team_dict, combined_dict, opinionDict, part_full_names, continentDict, contintntRacesRegions } from "../../frontend/config";
import newsTitleTemplates from "../../../data/news/news_titles_templates.json";
import turningPointsTitleTemplates from "../../../data/news/turning_points_titles_templates.json";
import { fetchSeasonResults, fetchQualiResults } from "./dbUtils";
import { queryDB } from "../dbManager";
import { excelToDate, dateToExcel, driverStats } from "./eidtStatsUtils";
import { getTier, getDriverOverall, fireDriver, hireDriver, swapDrivers } from "./transferUtils";
import { getPerformanceAllTeamsSeason, getAllPartsFromTeam, getPerformanceAllTeams } from "./carAnalysisUtils";
import { getGlobals } from "../commandGlobals";
import { unitValueToValue } from "./carConstants";
import { track } from "@vercel/analytics";
import LZString from "lz-string";
import { enrichDriversWithHistory, fetchDriverHistoryRecords } from "./recordUtils";
const USE_COMPRESSION = false;

const _seasonResultsCache = new Map();
export const _standingsCache = new Map();
const _dropsCache = new Map();

const FREE_AGENT_MAX_AGE = 19;
const YOUNG_DRIVER_MAX_PER_SERIES = 3;
const FREE_AGENT_MAX = 3;
const YOUNG_DRIVER_STAT_BOOST_MIN = 1;
const YOUNG_DRIVER_STAT_BOOST_MAX = 4;
const YOUNG_DRIVER_GROWTH_BOOST_MIN = 1;
const YOUNG_DRIVER_GROWTH_BOOST_MAX = 4;

function fetchSeasonResultsCached(season) {
    if (_seasonResultsCache.has(season)) return _seasonResultsCache.get(season);
    const res = fetchSeasonResults(season);
    _seasonResultsCache.set(season, res);
    return res;
}

export function rebuildStandingsUntilCached(season, seasonResults, raceId, includeCurrentRacePrevResults = false, includeCurrentRacePoints = true) {
    const key = `${season}:${raceId}:${includeCurrentRacePrevResults}:${includeCurrentRacePoints}`;
    if (_standingsCache.has(key)) return _standingsCache.get(key);
    const res = rebuildStandingsUntil(seasonResults, raceId, includeCurrentRacePrevResults, includeCurrentRacePoints);
    _standingsCache.set(key, res);
    return res;
}

export function generate_news(savednews, turningPointState) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const racesDone = fetchEventsDoneFrom(daySeason[1]);
    // const potentialChampionTestRaceId = 216; // Set to null for normal operation.

    const potentialChampionNewsList = generateChampionMilestones(racesDone, savednews);

    const currentDate = excelToDate(daySeason[0]);
    const currentMonth = currentDate.getMonth() + 1;
    const rumorMonths = [4, 5, 6, 7];
    const comparisonMonths = [4, 5, 6, 7, 8, 9, 10];
    const monthsDone = rumorMonths.filter(m => m <= currentMonth);

    const raceNews = generateRaceResultsNews(racesDone, savednews);
    const qualiNews = generateQualifyingResultsNews(racesDone, savednews);

    const raceReactions = generateRaceReactionsNews(racesDone, savednews);

    const comparisonNews = generateComparisonNews(comparisonMonths, savednews);

    const transferRumors = getTrueTransferRumors();

    const sillySeasonNews = generateTransferRumorsNews(transferRumors, savednews);

    const contractRenewals = getContractExtensions();

    const bigConfirmedTransfersNews = generateBigConfirmedTransferNews(savednews, currentMonth);
    const fakeTransferNews = generateFakeTransferNews(monthsDone, savednews, bigConfirmedTransfersNews);
    const contractRenewalsNews = generateContractRenewalsNews(savednews, contractRenewals, currentMonth);

    const seasonReviews = generateSeasonReviewNews(savednews);

    const nextSeasonGridNews = generateNextSeasonGridNews(savednews, currentMonth);

    const dsqTurningPointNews = generateDSQTurningPointNews(racesDone, savednews, turningPointState);

    const midSeasonTransfersTurningPointNews = generateMidSeasonTransfersTurningPointNews(monthsDone, currentMonth, savednews, turningPointState);

    const technicalDirectiveTurningPointNews = generateTechnicalDirectiveTurningPointNews(currentMonth, savednews, turningPointState);

    const investmentTurningPointNews = generateInvestmentTurningPointNews(currentMonth, savednews, turningPointState);

    const raceSubstitutionTurningPointNews = generateRaceSubstitutionTurningPointNews(currentMonth, savednews, turningPointState);

    const driverInjuryTurningPointNews = generateDriverInjuryTurningPointNews(currentMonth, savednews, turningPointState);

    const enginesTurningPointNews = generateEnginesTurningPointNews(currentMonth, savednews, turningPointState);
    const youngDriversTurningPointNews = generateYoungDriversTurningPointNews(currentMonth, savednews, turningPointState);

    let turningPointOutcomes = [];
    if (Object.keys(savednews).length > 0) {
        turningPointOutcomes = Object.entries(savednews)
            .filter(([_, n]) => n.type && n.type.startsWith("turning_point_outcome"))
            .map(([id, n]) => ({ id, ...n }));
    }

    let newsList = [...raceNews || [], ...qualiNews || [], ...fakeTransferNews || [],
    ...bigConfirmedTransfersNews || [], ...contractRenewalsNews || [], ...comparisonNews || [], ...seasonReviews || [],
    ...potentialChampionNewsList || [], ...sillySeasonNews || [], ...dsqTurningPointNews || [], ...midSeasonTransfersTurningPointNews || [],
    ...turningPointOutcomes || [], ...technicalDirectiveTurningPointNews || [], ...investmentTurningPointNews || [],
    ...raceSubstitutionTurningPointNews || [], ...driverInjuryTurningPointNews || [], ...raceReactions || [], ...nextSeasonGridNews || [],
    ...enginesTurningPointNews || [], ...youngDriversTurningPointNews || []];

    //order by date descending
    newsList.sort((a, b) => b.date - a.date);

    upsertNews(newsList);
    upsertTurningPoints(turningPointState);

    return {
        newsList,
        turningPointState
    };
}

export function generateTurningResponse(turningPointData, type, maxDate, outcome) {
    let newEntry;
    if (type === "turning_point_transfer") {
        if (outcome === "positive") {
            executeMidSeasonTransfer(turningPointData);
        }
        const entryId = `turning_point_outcome_transfer_${turningPointData.month}`;
        const title = generateTurningPointTitle(turningPointData, 101, outcome);
        const image = getImagePath(null, turningPointData.driver_in.id, "transfer");

        newEntry = {
            id: entryId,
            title,
            image,
            data: turningPointData,
            date: maxDate + 1,
            turning_point_type: outcome,
            type: "turning_point_outcome_transfer"
        }
    }
    else if (type === "turning_point_dsq") {
        if (outcome === "positive") {
            const pointsReg = fetchPointsRegulations();

            disqualifyTeamInRace({
                raceId: turningPointData.race_id,
                teamId: turningPointData.teamId,
                queryDB,
                pointsReg
            });
        }

        const entryId = `turning_point_outcome_dsq_${turningPointData.race_id}`;
        const title = generateTurningPointTitle(turningPointData, 103, outcome);
        const image = getImagePath(null, null, "dsq");


        newEntry = {
            id: entryId,
            title,
            image,
            data: turningPointData,
            date: maxDate + 1,
            turning_point_type: outcome,
            type: "turning_point_outcome_dsq"
        }
        maxDate += 1;

    }
    else if (type === "turning_point_technical_directive") {
        if (outcome === "positive") {
            applyTechnicalDirectiveEffect(turningPointData);
        }
        const entryId = `turning_point_outcome_technical_directive_${turningPointData.month}`;
        const title = generateTurningPointTitle(turningPointData, 100, outcome);
        const image = getImagePath(null, turningPointData.componentId, "technical");
        newEntry = {
            id: entryId,
            title,
            image,
            data: turningPointData,
            date: maxDate + 1,
            turning_point_type: outcome,
            type: "turning_point_outcome_technical_directive"
        }
        maxDate += 1;
    }
    else if (type === "turning_point_investment") {
        if (outcome === "positive") {
            //apply investment effects: add the money and improve key facilities
            applyInvestmentEffect(turningPointData);
        }
        const entryId = `turning_point_outcome_investment_${turningPointData.month}`;
        const title = generateTurningPointTitle(turningPointData, 102, outcome);
        const image = getImagePath(null, turningPointData.investmentId, "investment") || "null.png";

        newEntry = {
            id: entryId,
            title,
            image,
            data: turningPointData,
            date: maxDate + 1,
            turning_point_type: outcome,
            type: "turning_point_outcome_investment"
        }
        maxDate += 1;
    }
    else if (type === "turning_point_race_substitution") {
        if (outcome === "positive") {
            applyRaceSubstitution(turningPointData);
        }
        const entryId = `turning_point_outcome_race_substitution_${turningPointData.month}`;
        const title = generateTurningPointTitle(turningPointData, 105, outcome);
        const code = races_names[Number(turningPointData.newRaceTrackId)].toLowerCase()
        const image = getImagePath(null, code, "race_substitution") || "null.png";
        newEntry = {
            id: entryId,
            title,
            image,
            data: turningPointData,
            date: maxDate + 1,
            turning_point_type: outcome,
            type: "turning_point_outcome_race_substitution"
        }
        maxDate += 1;
    }
    else if (type === "turning_point_injury") {
        if (outcome === "positive") {
            applyDriverInjury(turningPointData);
        }
        const entryId = `turning_point_outcome_injury_${turningPointData.month}`;
        const title = generateTurningPointTitle(turningPointData, 106, outcome);
        const image = getImagePath(null, null, "injury") || "null.png";
        newEntry = {
            id: entryId,
            title,
            image,
            data: turningPointData,
            date: maxDate + 1,
            turning_point_type: outcome,
            type: "turning_point_outcome_injury"
        }
        maxDate += 1;
    }
    else if (type === "turning_point_engine_regulation") {
        if (outcome === "positive") {
            editEngines(turningPointData.engineData);
        }
        const entryId = `turning_point_outcome_engine_regulation_${turningPointData.season}`;
        const title = generateTurningPointTitle(turningPointData, 107, outcome);
        const image = getImagePath(null, "engine", "engine") || "null.png";     
        newEntry = {
            id: entryId,
            title,
            image,
            data: turningPointData,
            date: maxDate + 1,
            turning_point_type: outcome,
            type: "turning_point_outcome_engine_regulation"
        }
        maxDate += 1;
    }
    else if (type === "turning_point_young_drivers") {
        if (outcome === "positive") {
            applyYoungDriversBoost(turningPointData);
            const entryId = `turning_point_outcome_young_drivers_${turningPointData.season}`;
            const title = generateTurningPointTitle(turningPointData, 108, outcome);
            const image = getImagePath(null, null, "young") || "null.png";
            newEntry = {
                id: entryId,
                title,
                image,
                data: turningPointData,
                date: maxDate + 1,
                turning_point_type: outcome,
                type: "turning_point_outcome_young_drivers"
            }
            maxDate += 1;
        }
        //if outcome is negative, no news is generated

    }

    return newEntry;
}



function applyRaceSubstitution(turningPointData) {
    const raceId = turningPointData.raceId;
    const newTrackId = turningPointData.newRaceTrackId;
    const newDay = turningPointData.newRaceDay;
    queryDB(`UPDATE Races SET TrackID = ?, Day = ? WHERE RaceID = ?`, [newTrackId, newDay, raceId], 'run');
}

function applyInvestmentEffect(turningPointData) {
    const teamId = turningPointData.teamId;
    const investmentAmount = turningPointData.investmentAmount;
    const keyBuildings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 15];
    const level4Buildings = [2, 3, 5, 6, 7, 8];

    for (const buildingId of keyBuildings) {
        //buildingID is a number that first has the actual id and the last number represents its level
        if (level4Buildings.includes(buildingId)) {
            //put it to at least level4, if its already at 4, improve to 5
            const current = queryDB(`SELECT BuildingID FROM Buildings_HQ WHERE TeamID = ? AND BuildingType = ?`, [teamId, buildingId], 'singleValue');
            let newLevel = 4;
            if (current) {
                //get last digit
                const currentLevel = parseInt(current.toString().slice(-1));
                if (currentLevel === 4) {
                    newLevel = 5;
                }
                const newBuildingId = parseInt(current.toString().slice(0, -1) + newLevel.toString());
                queryDB(`UPDATE Buildings_HQ SET BuildingID = ?, DegradationValue = 1 WHERE BuildingType = ? AND TeamID = ?`, [newBuildingId, buildingId, teamId], 'run');
            }

        }
        else {//improve by 1 level
            const current = queryDB(`SELECT BuildingID FROM Buildings_HQ WHERE TeamID = ? AND BuildingType = ?`, [teamId, buildingId], 'singleValue');
            if (current) {
                // Upgrade the building by 1 level (parse to int first) and refurbish
                const newLevel = parseInt(current) + 1;
                queryDB(`UPDATE Buildings_HQ SET BuildingID = ?, DegradationValue = 1 WHERE BuildingType = ? AND TeamID = ?`, [newLevel, buildingId, teamId], 'run');
            }

        }

    }

    //multiply investment amount by 1 million
    const moneyToAdd = investmentAmount * 1000000;
    queryDB(`UPDATE Finance_TeamBalance SET Balance = Balance + ? WHERE TeamID = ?`, [moneyToAdd, teamId], 'run');
}

function executeMidSeasonTransfer(turningPointData) {
    const { teamId, driver_out, driver_in, driver_substitute } = turningPointData;

    // Red Bull special case: Swap drivers
    if (teamId === 3 && (combined_dict[8] === "Alpha Tauri" || combined_dict[8] === "Visa Cashapp RB") && driver_in.teamId === 8) {
        // Fire both drivers
        fireDriver(driver_out.id, driver_out.teamId);
        fireDriver(driver_in.id, driver_in.teamId);

        // Hire them in their new teams
        const existingDrivers = queryDB(`SELECT con.PosInTeam FROM Staff_Contracts con JOIN Staff_DriverData dri ON con.StaffID = dri.StaffID WHERE con.TeamID = ? AND con.ContractType = 0 AND con.PosInTeam <= 2`, [driver_out.teamId], 'allRows').map(r => r[0]);
        const posInTeamForDriverIn = existingDrivers.includes(1) ? 2 : 1;
        hireDriver("auto", driver_in.id, driver_out.teamId, posInTeamForDriverIn);

        const existingDriversSubTeam = queryDB(`SELECT con.PosInTeam FROM Staff_Contracts con JOIN Staff_DriverData dri ON con.StaffID = dri.StaffID WHERE con.TeamID = ? AND con.ContractType = 0 AND con.PosInTeam <= 2`, [driver_in.teamId], 'allRows').map(r => r[0]);
        const posInTeamForDriverOut = existingDriversSubTeam.includes(1) ? 2 : 1;
        hireDriver("auto", driver_out.id, driver_in.teamId, posInTeamForDriverOut);
        return;
    }

    // --- Standard Transfer ---

    // 1. Fire all involved drivers from their current teams
    fireDriver(driver_out.id, driver_out.teamId);
    if (driver_in.teamId) {
        fireDriver(driver_in.id, driver_in.teamId);
    }
    if (driver_substitute && driver_substitute.teamId) {
        fireDriver(driver_substitute.id, driver_substitute.teamId);
    }

    // 2. Hire drivers into their new teams
    // Hire driver_in to the main team (teamId)
    const existingDrivers = queryDB(`SELECT con.PosInTeam FROM Staff_Contracts con JOIN Staff_DriverData dri ON con.StaffID = dri.StaffID WHERE con.TeamID = ? AND con.ContractType = 0 AND con.PosInTeam <= 2`, [teamId], 'allRows').map(r => r[0]);
    const posInTeamForDriverIn = existingDrivers.includes(1) ? 2 : 1;
    hireDriver("auto", driver_in.id, teamId, posInTeamForDriverIn);

    // Hire driver_substitute to driver_in's original team (if applicable)
    if (driver_substitute && driver_in.teamId) {
        const existingDriversSubTeam = queryDB(`SELECT con.PosInTeam FROM Staff_Contracts con JOIN Staff_DriverData dri ON con.StaffID = dri.StaffID WHERE con.TeamID = ? AND con.ContractType = 0 AND con.PosInTeam <= 2`, [driver_in.teamId], 'allRows').map(r => r[0]);
        const posInTeamForSubstitute = existingDriversSubTeam.includes(1) ? 2 : 1;
        hireDriver("auto", driver_substitute.id, driver_in.teamId, posInTeamForSubstitute);
    }
}

function applyTechnicalDirectiveEffect(turningPointData) {
    //iterate through the object turningPointData.effectOnEachteam
    const componentId = turningPointData.componentId;
    for (const [teamIdStr, effect] of Object.entries(turningPointData.effectOnEachteam)) {
        const teamId = Number(teamIdStr);
        const performanceChange = Number(effect.performanceGainLoss);
        const designs = queryDB(`SELECT DesignID FROM Parts_Designs WHERE TeamID = ? AND PartType = ?`, [teamId, componentId], 'allRows');
        for (const designRow of designs) {
            const designId = designRow[0];
            const unitValues = queryDB(`SELECT UnitValue, PartStat FROM Parts_Designs_StatValues WHERE DesignID = ? AND  PartStat != 15`, [designId], 'allRows');
            for (const valueRow of unitValues) {
                const partStat = valueRow[1];
                const currentUnitValue = Number(valueRow[0]);
                const newRelative = 100 + performanceChange;
                const newUnitValue = (currentUnitValue * newRelative) / 100;
                const newValue = unitValueToValue[partStat](newUnitValue);
                queryDB(`UPDATE Parts_Designs_StatValues SET Value = ?, UnitValue = ? WHERE DesignID = ? AND PartStat = ?`, [newValue, newUnitValue, designId, partStat], 'run');
            }
        }
        //now the expertise
        const expertise = queryDB(`SELECT Expertise, PartStat FROM Parts_TeamExpertise WHERE TeamID = ? AND PartType = ? AND PartStat != 15`, [teamId, componentId], 'allRows');
        for (const expRow of expertise) {
            const currentExpertise = Number(expRow[0]);
            const partStat = expRow[1];
            const newRelative = 100 + performanceChange;
            const newExpertise = (currentExpertise * newRelative) / 100;
            queryDB(`UPDATE Parts_TeamExpertise SET Expertise = ? WHERE TeamID = ? AND PartType = ? AND PartStat = ?`, [newExpertise, teamId, componentId, partStat], 'run');
        }
    }
}

function generateRaceSubstitutionTurningPointNews(currentMonth, savednews = {}, turningPointState = {}) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    let newsList = [];
    //check if there is anmy news with race substitution turning point, and return the first one found
    for (let month of [4, 5, 6, 7, 8, 9, 10, 11]) {
        const entryId = `turning_point_race_substitution_${month}`;
        if (savednews[entryId]) {
            newsList.push({ id: entryId, ...savednews[entryId] });
            return newsList;
        }
    }

    if (turningPointState.raceSubstitutionOpportunities[currentMonth] !== null) {
        return newsList;
    }

    //10% chance of happening
    if (Math.random() > 0.1) {
        turningPointState.raceSubstitutionOpportunities[currentMonth] = "None";
        return newsList;
    }

    //get races that are still to be done
    const calendar = queryDB(`SELECT RaceID, TrackID, Day FROM Races WHERE SeasonID = ? AND State = 0 ORDER BY Day`, [daySeason[1]], 'allRows');
    //remove the first 4
    const potentialRaces = calendar.slice(4);

    if (potentialRaces.length < 2) { //too little races
        return newsList;
    }

    //pick one randomly between nber 5 and 9 of the remaining races
    const potentialCancellations = potentialRaces.slice(0, Math.min(5, potentialRaces.length - 1));
    const cancellationRace = randomPick(potentialCancellations);
    const originalTrackId = Number(String(cancellationRace[1]).trim());
    let originalRaceId = cancellationRace[0];
    let availableRaceBefore = false, availableRaceAfter = false;
    let newRaceTrackId = null;
    let newRaceDay = null;
    let typeOfSubstitution = null;

    //check if the race before is more than 7 days before or the race after is more than 7 days after
    const cancellationIndex = calendar.findIndex(r => r[0] === cancellationRace[0]);
    if (cancellationIndex > 0) {
        const previousRace = calendar[cancellationIndex - 1];
        const dayDiff = cancellationRace[2] - previousRace[2];
        if (dayDiff > 7) {
            availableRaceBefore = true;
        }
    }
    if (cancellationIndex < calendar.length - 1) {
        const nextRace = calendar[cancellationIndex + 1];
        const dayDiff = nextRace[2] - cancellationRace[2];
        if (dayDiff > 7) {
            availableRaceAfter = true;
        }
    }

    if (availableRaceAfter) {
        //50% chance
        if (Math.random() < 0.5) { //put the same race that the race after but 7 days before
            const nextRace = calendar[cancellationIndex + 1];
            newRaceTrackId = nextRace[1];
            newRaceDay = nextRace[2] - 7;
            typeOfSubstitution = "same_as_next";
        }
        else {
            let region = continentDict[originalTrackId] || "Europe";
            let racesPool = contintntRacesRegions[region].filter(tid => tid !== originalTrackId);
            newRaceTrackId = randomPick(racesPool);
            newRaceDay = cancellationRace[2]; //same day
            typeOfSubstitution = "different_race";
        }
    }
    else if (availableRaceBefore) {
        //50% chance
        if (Math.random() < 0.5) { //put the same race that the race before but 7 days after
            const previousRace = calendar[cancellationIndex - 1];
            newRaceTrackId = previousRace[1];
            newRaceDay = previousRace[2] + 7;
            typeOfSubstitution = "same_as_previous";
        }
        else {
            let region = continentDict[originalTrackId] || "Europe";
            let racesPool = contintntRacesRegions[region].filter(tid => tid !== originalTrackId);
            newRaceTrackId = randomPick(racesPool);
            newRaceDay = cancellationRace[2]; //same day
            typeOfSubstitution = "different_race";
        }
    }
    else {
        let region = continentDict[originalTrackId] || "Europe";
        let racesPool = contintntRacesRegions[region].filter(tid => tid !== originalTrackId);
        newRaceTrackId = randomPick(racesPool);
        newRaceDay = cancellationRace[2];
        typeOfSubstitution = "different_race";
    }
    const originalCountry = countries_data[races_names[originalTrackId]]?.adjective || "Unknown Country";
    const substituteCountry = countries_data[races_names[newRaceTrackId]]?.country || "Unknown Country";

    const reasons_pool = [
        "infrastructure delays",
        "contractual disputes",
        "financial uncertainty",
        "logistical challenges",
        "homologation issues",
        "political instability",
        "travel restrictions",
        "calendar restructuring",
        "environmental concerns",
        "permit complications with local authorities"
    ];
    const reason = randomPick(reasons_pool);

    const newEntryId = `turning_point_race_substitution_${currentMonth}`;
    const code = races_names[Number(originalTrackId)].toLowerCase()
    const image = getImagePath(null, code, "race_substitution");

    const titleData = {
        originalCountry: originalCountry,
        substituteCountry: substituteCountry,
        reason: reason,
        originalTrackId: originalTrackId,
        newRaceTrackId: newRaceTrackId,
        newRaceDay: newRaceDay,
        raceId: originalRaceId,
        month: currentMonth,
        season: daySeason[1],
        typeOfSubstitution: typeOfSubstitution
    };

    const title = generateTurningPointTitle(titleData, 105, "original");
    const excelDate = dateToExcel(new Date(daySeason[1], currentMonth - 1, Math.floor(Math.random() * 28) + 1));
    turningPointState.raceSubstitutionOpportunities[currentMonth] = titleData;
    const newsEntry = {
        id: newEntryId,
        title: title,
        image: image,
        date: excelDate,
        data: titleData,
        turning_point_type: "original",
        type: "turning_point_race_substitution"
    }

    newsList.push(newsEntry);


    return newsList;
}

function generateInvestmentTurningPointNews(currentMonth, savednews = {}, turningPointState = {}) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    let newsList = [];
    //check if there is anmy news with investment turning point, and return the first one found
    for (let month of [4, 5, 6, 7, 8, 9, 10, 11]) {
        const entryId = `turning_point_investment_${month}`;
        if (savednews[entryId]) {
            newsList.push({ id: entryId, ...savednews[entryId] });
            return newsList;
        }
    }

    //if season is odd, return empty array
    if (daySeason[1] % 2 === 1) {
        return newsList;
    }
    //if that month has already been calculated then skip chance
    if (turningPointState.investmentOpportunities[currentMonth] !== null) {
        return newsList;
    }

    //90% chance of NOT happening,
    if (Math.random() >= 0.1) {
        turningPointState.investmentOpportunities[currentMonth] = "None";
        return newsList;
    }

    //rich countries with interest in motorsport, especially middle eastern
    const investmentCountries = ["China", "Saudi Arabia", "United Arab Emirates", "India", "Russia", "South Africa", "Qatar", "Bahrain", "Singapore", "Vietnam"];
    const countryName = randomPick(investmentCountries);

    const countryCode = countryName.slice(0, 3).toLowerCase();


    const globals = getGlobals();
    let teamIds = [2, 3, 5, 6, 7, 8, 9, 10] //exclude ferrari abd mercedes
    if (globals.isCreateATeam) {
        teamIds.push(32);
    }
    const randomTeamId = randomPick(teamIds);
    const randomTeamName = combined_dict[randomTeamId] || "Unknown Team";

    const investmentRanges = [
        { share: 10, amounts: [30, 40, 50, 60] },
        { share: 15, amounts: [40, 50, 60, 70] },
        { share: 20, amounts: [50, 60, 75, 90] },
        { share: 25, amounts: [70, 80, 90, 100] },
        { share: 30, amounts: [80, 100, 120, 140] },
        { share: 35, amounts: [100, 120, 150] },
        { share: 40, amounts: [120, 150, 180] },
        { share: 51, amounts: [150, 180, 200, 220] },
        { share: 65, amounts: [200, 250, 300] },
        { share: 80, amounts: [250, 300, 350, 400] }
    ];

    const selectedRange = randomPick(investmentRanges);
    const investmentShare = selectedRange.share;
    const investmentAmount = randomPick(selectedRange.amounts);

    const titleData = {
        country: countryName,
        teamId: randomTeamId,
        teamName: randomTeamName,
        investmentAmount: investmentAmount,
        investmentShare: investmentShare,
        season: daySeason[1],
        month: currentMonth,
    };

    const title = generateTurningPointTitle(titleData, 102, "original");

    const image = getImagePath(null, countryCode, "investment");
    const excelDate = dateToExcel(new Date(daySeason[1], currentMonth - 1, Math.floor(Math.random() * 28) + 1));

    turningPointState.investmentOpportunities[currentMonth] = {
        country: countryName,
        teamId: randomTeamId,
        teamName: randomTeamName,
        investmentAmount: investmentAmount,
        investmentShare: investmentShare,
        season: daySeason[1],
        month: currentMonth,
    }

    const entryId = `turning_point_investment_${currentMonth}`;

    const newsEntry = {
        id: entryId,
        title: title,
        image: image,
        date: excelDate,
        data: titleData,
        turning_point_type: "original",
        type: "turning_point_investment"
    }
    newsList.push(newsEntry);

    return newsList;
}

function generateDriverInjuryTurningPointNews(currentMonth, savednews = {}, turningPointState = {}) {
    turningPointState.injuries = turningPointState.injuries || {};

    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const todayExcel = Number(daySeason[0]);
    const seasonYear = Number(daySeason[1]);

    const newsList = [];
    for (const m of [4, 5, 6]) { //should only be april, may and june, else is for testing
        const id = `turning_point_injury_${m}`;
        if (savednews[id]) newsList.push({ id, ...savednews[id] });
        //if there are already 2, return newsList
        if (newsList.length >= 2) {
            return newsList;
        }
    }

    //should only be april, may and june, else is for testing
    if (![4, 5, 6].includes(currentMonth) || turningPointState.injuries[currentMonth]) {
        return newsList;
    }

    const nRemainingRaces = queryDB(`
        SELECT COUNT(*) FROM Races
        WHERE SeasonID = ? AND State = 0
    `, [seasonYear], 'singleValue');

    // Need at least 5 races remaining to consider an injury
    if (nRemainingRaces < 5) {
        turningPointState.injuries[currentMonth] = "None";
        return newsList;
    }

    // 20% chance to happen
    if (Math.random() >= 0.2) {
        turningPointState.injuries[currentMonth] = "None";
        return newsList;
    }

    const INJURY_CATALOG = [
        {
            share: 35,
            type: "illness",
            condition: "an illness",
            durations: [7, 10, 14],
            reasons: [
                "a strong viral infection requiring rest",
                "high fever and fatigue from a viral infection",
                "a severe stomach flu affecting performance"
            ]
        },
        {
            share: 20,
            type: "minor_injury",
            condition: "a sprained wrist",
            durations: [14, 21, 28],
            reasons: [
                "a minor wrist sprain during strength training",
                "an awkward twist of the wrist in a reaction drill",
                "a wrist knock after a training fall on the bike"
            ]
        },
        {
            share: 15,
            type: "back_pain",
            condition: "a back-pain flare-up",
            durations: [14, 21, 28, 35],
            reasons: [
                "a back-pain flare-up after long simulator sessions",
                "a lower-back muscle strain requiring physiotherapy",
                "persistent lumbar discomfort requiring medical rest"
            ]
        },
        {
            share: 15,
            type: "concussion",
            condition: "a concussion",
            durations: [21, 28, 35, 42],
            reasons: [
                "a light crash during private testing (concussion protocol)",
                "mild concussion symptoms requiring medical clearance",
                "dizziness and headache after an impact (FIA protocol)"
            ]
        },
        {
            share: 10,
            type: "fracture",
            condition: "a small fracture",
            durations: [28, 42, 56],
            reasons: [
                "a small collarbone fracture from cycling",
                "a hairline rib fracture during a bike session",
                "a minor hand fracture requiring immobilization"
            ]
        },
        {
            share: 5,
            type: "surgery",
            condition: "a recent minor surgery",
            durations: [35, 49, 63],
            reasons: [
                "a scheduled minor procedure with ongoing recovery",
                "a successful minor intervention followed by rehabilitation",
                "a preventive procedure to address recurring pain"
            ]
        }
    ];


    // Weighted random pick helper
    function weightedPick(arr, key = "share") {
        const total = arr.reduce((s, it) => s + (it[key] || 0), 0);
        let r = Math.random() * total;
        for (const it of arr) {
            r -= (it[key] || 0);
            if (r <= 0) return it;
        }
        return arr[arr.length - 1];
    }

    const pickedInjury = weightedPick(INJURY_CATALOG);
    const baseDuration = randomPick(pickedInjury.durations);


    // --- Get teams with two official drivers ---
    const pairs = queryDB(`
    SELECT con.TeamID, con.StaffID
    FROM Staff_Contracts con
    JOIN Staff_DriverData d ON d.StaffID = con.StaffID
    WHERE con.ContractType = 0 AND con.PosInTeam <= 2 AND (con.TeamID <= 10 OR con.TeamID = 32)
    `, [], 'allRows');

    if (!pairs || !pairs.length) {
        turningPointState.injuries[currentMonth] = "None";
        return newsList;
    }

    const teamToDrivers = {};
    for (const row of pairs) {
        const teamId = Number(row[0]);
        const driverId = Number(row[1]);
        (teamToDrivers[teamId] ||= []).push(driverId);
    }
    const eligibleTeams = Object.keys(teamToDrivers).filter(t => teamToDrivers[t].length >= 2).map(Number);
    if (!eligibleTeams.length) {
        turningPointState.injuries[currentMonth] = "None";
        return newsList;
    }

    // Pick random team and driver
    const teamId = randomPick(eligibleTeams);
    const teamDrivers = teamToDrivers[teamId];
    const driverId = randomPick(teamDrivers);
    const teamName = combined_dict[teamId] || "Unknown Team";

    // Get driver name
    let nameRow = queryDB(`SELECT FirstName, LastName FROM Staff_BasicData WHERE StaffID = ?`, [driverId], 'singleRow') || ["Unknown", "Driver"];
    const driverName = formatNamesSimple([...nameRow, driverId]);

    // --- Injury dates ---
    const startExcel = todayExcel;
    const startDate = excelToDate(startExcel);


    // Get next race after start date
    const nextRaceDay = queryDB(`
        SELECT MIN(Day) FROM Races
        WHERE Day > ?
    `, [startExcel], 'singleValue');
    const nextRaceExcel = nextRaceDay ? Number(nextRaceDay) + 2 : null;

    // Compute end date (extended to cover at least the next race)
    let endDate = new Date(startDate.getTime());
    endDate.setDate(endDate.getDate() + baseDuration);

    if (nextRaceExcel) {
        const nextRaceDate = excelToDate(nextRaceExcel);
        if (endDate < nextRaceDate) {
            endDate = new Date(nextRaceDate.getTime());
        }
    }

    const endExcel = dateToExcel(endDate);


    // Find affected races between start and end
    const racesAffected = queryDB(`
        SELECT RaceID, Day, TrackID
        FROM Races
        WHERE Day >= ? AND Day <= ?
        ORDER BY Day ASC
    `, [startExcel, endExcel], 'allRows') || [];


    const expectedRaceReturn = queryDB(`
        SELECT MIN(Day), RaceID, TrackID FROM Races
        WHERE Day > ?
    `, [endExcel], 'singleRow');
    const expectedReturnRaceId = expectedRaceReturn ? Number(expectedRaceReturn[1]) : null;
    const expectedReturnCountry = countries_data[races_names[Number(expectedRaceReturn[2])]]?.country

    const reason = randomPick(pickedInjury.reasons);


    let reserve = {}
    let reserveCandidates = [];
    const reserveDrivers = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID
    FROM Staff_Contracts con
    JOIN Staff_BasicData bas ON con.StaffID = bas.StaffID
    JOIN Staff_DriverData dri ON con.StaffID = dri.StaffID
    WHERE con.TeamID = ? AND con.ContractType = 0 AND con.PosInTeam > 2`, [teamId], 'allRows');
    if (reserveDrivers.length) {
        reserveCandidates = [];
        for (const rd of reserveDrivers) {
            const overall = getDriverOverall(rd[2]);
            reserveCandidates.push({ driverId: rd[2], teamId: rd[3], rating: overall, name: formatNamesSimple([rd[0], rd[1], rd[4]])[0] });
        }
        reserveCandidates.sort((a, b) => b.rating - a.rating);
    }
    else {
        return newsList;
    }
    //get the reserve driver with highest rating
    reserve.name = reserveCandidates[0].name;
    reserve.id = reserveCandidates[0].driverId;
    reserve.teamId = reserveCandidates[0].teamId;
    reserve.overall = reserveCandidates[0].rating;

    //if reserve overall is lower than 70 and fallback
    if (reserve.overall < 70 || !reserve.overall || !reserve.id) {
        let freeCandidates = [];
        const freeAgents = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID
                    FROM Staff_BasicData bas
                    JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID
                    JOIN Staff_GameData gd ON bas.StaffID = gd.StaffID
                    WHERE dri.StaffID NOT IN (SELECT StaffID FROM Staff_Contracts)
                    AND gd.Retired = 0`, [], 'allRows');
        if (freeAgents.length) {
            for (const fa of freeAgents) {
                const overall = getDriverOverall(fa[2]);
                freeCandidates.push({ driverId: fa[2], rating: overall, name: formatNamesSimple([fa[0], fa[1], fa[2]])[0] });
            }
            freeCandidates.sort((a, b) => b.rating - a.rating);
            reserve.name = freeCandidates[0].name;
            reserve.id = freeCandidates[0].driverId;
            reserve.teamId = null;
            reserve.overall = freeCandidates[0].rating;
            reserve.isFreeAgent = true;
            reserve.futureTeamId = teamId;
        }
    }

    // Build data object
    const entryId = `turning_point_injury_${currentMonth}`;
    if (savednews[entryId]) return newsList;

    const newData = {
        team: teamName,
        teamId,
        driver_affected: {
            id: driverId,
            name: driverName[0],
            teamId
        },
        condition: {
            type: pickedInjury.type,
            condition: pickedInjury.condition,
            reason,
            start_date: startExcel,
            end_date: endExcel,
            next_race_min_enforced: !!nextRaceExcel,
            races_affected: racesAffected.map(r => ({
                raceId: Number(r[0]),
                country: countries_data[races_names[Number(r[2])]]?.country,
                day: Number(r[1])
            })),
            expectedReturnRaceId: expectedReturnRaceId,
            expectedReturnCountry: expectedReturnCountry
        },
        reserve_driver: reserve,
        month: currentMonth,
        season: seasonYear
    };

    turningPointState.injuries[currentMonth] = newData;

    const title = generateTurningPointTitle(newData, 106, "original")

    const image = getImagePath(null, driverId, "injury");

    const entry = {
        id: entryId,
        title,
        image,
        data: newData,
        date: startExcel,
        turning_point_type: "original",
        type: "turning_point_injury"
    };

    newsList.push(entry);
    return newsList;
}


function generateEnginesTurningPointNews(currentMonth, savednews = {}, turningPointState = {}) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], "singleRow");
    const season = daySeason[1];
    const newsList = [];

    const allRacesDone = queryDB(
        `SELECT COUNT(*) FROM Races WHERE SeasonID = ? AND State = 2`,
        [season],
        "singleValue"
    );
    const totalRaces = queryDB(
        `SELECT COUNT(*) FROM Races WHERE SeasonID = ?`,
        [season],
        "singleValue"
    );

    // Solo último mes + temporada terminada
    if (currentMonth < 11 || allRacesDone < totalRaces) {
        return newsList;
    }

    const entryId = `turning_point_engine_regulation_${season}`;
    if (savednews[entryId]) {
        newsList.push({ id: entryId, ...savednews[entryId] });
        return newsList;
    }

    // // 50% chance de ocurrir
    if (Math.random() >= 0.5) {
        return newsList;
    }

    // --- Lectura DB ---
    const engines = queryDB(`SELECT * FROM Custom_Engines_list`, [], "allRows");
    const engineStats = queryDB(`SELECT * FROM Custom_Engines_stats`, [], "allRows");

    // --- Tipo de regulación ---
    let changeType = "minor";
    if (Math.random() < 0.1) changeType = "major";

    const minorChangeAreas = [
        "fuel flow monitoring",
        "ERS deployment limits",
        "MGU-K usage rules",
        "cooling system allowances",
        "gearbox durability limits",
        "turbo efficiency limits",
        "oil consumption rules"
    ];
    const majorChangeAreas = [
        "hybrid system architecture",
        "engine architecture layout",
        "combustion concept rules",
        "turbocharger design limits",
        "energy recovery system redesign",
        "fuel system design rules",
        "power unit packaging regulations"
    ];
    const changeAreasPool = changeType === "major" ? majorChangeAreas : minorChangeAreas;
    const mainChangeArea = randomPick(changeAreasPool);

    const VAR = changeType === "major" ? 0.30 : 0.05;

    const randBetween = (min, max) => min + Math.random() * (max - min);
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));


    const currentStats = {};
    for (const row of engineStats) {
        const engineId = String(row[0]);
        const designId = Number(row[1]);
        const partStat = Number(row[2]);
        const unitValue = Number(row[3]); // 4º valor = unitValue (según tu tabla)

        if (!currentStats[engineId]) currentStats[engineId] = {};

        const eNum = Number(engineId);
        if (partStat === 15 && designId === eNum + 1) {
            currentStats[engineId][18] = unitValue; // ERS
        } else if (partStat === 15 && designId === eNum + 2) {
            currentStats[engineId][19] = unitValue; // Gearbox
        } else {
            currentStats[engineId][partStat] = unitValue;
        }
    }

    // --- 2) Decide beneficiado/perjudicado ANTES (Opción A) ---
    // Distribución:
    // minor: 35% win, 35% lose, 30% neutral
    // major: 45% win, 45% lose, 10% neutral
    const engineBias = {}; // engineId -> -1 | 0 | +1
    const winners = [];
    const losers = [];
    const neutrals = [];

    for (const engineId of Object.keys(currentStats)) {
        const r = Math.random();
        let bias;

        if (changeType === "major") {
            bias = r < 0.45 ? 1 : r < 0.90 ? -1 : 0;
        } else {
            bias = r < 0.35 ? 1 : r < 0.70 ? -1 : 0;
        }

        engineBias[engineId] = bias;
        if (bias === 1) winners.push(engineId);
        else if (bias === -1) losers.push(engineId);
        else neutrals.push(engineId);
    }

    // --- 3) Genera engineData aplicando variación SOLO en dirección del bias ---
    // engineData[engineId][stat] = nuevo unitValue
    const engineData = {};
    const engineImpact = {}; // engineId -> % medio (ej 0.032 = +3.2%) para ordenar si quieres

    for (const engineId of Object.keys(currentStats)) {
        engineData[engineId] = {};

        let sumPct = 0;
        let count = 0;

        for (const statKey of Object.keys(currentStats[engineId])) {
            const stat = Number(statKey);
            const cur = Number(currentStats[engineId][stat]);

            // No tocar 11 y 12
            if (stat === 11 || stat === 12) {
                engineData[engineId][stat] = cur;
                continue;
            }

            const bias = engineBias[engineId];

            let mult = 1;
            if (bias === 1) mult = 1 + randBetween(0, VAR);          // solo sube
            else if (bias === -1) mult = 1 - randBetween(0, VAR);    // solo baja
            else mult = 1 + randBetween(-VAR, VAR);                  // neutro: libre

            let next = Math.round(cur * mult);

            next = Math.max(0, next);
            next = clamp(next, 0, 100);

            engineData[engineId][stat] = next;

            if (cur > 0) {
                sumPct += (next - cur) / cur;
                count++;
            }
        }

        engineImpact[engineId] = count ? sumPct / count : 0;

        const eNum = Number(engineId);

        if (engineData[engineId][18] === undefined) {
            const ersUnit = queryDB(
                `SELECT UnitValue FROM Custom_Engines_Stats WHERE engineId = ? AND designId = ? AND partStat = 15`,
                [engineId, eNum + 1],
                "singleValue"
            );
            engineData[engineId][18] = ersUnit != null ? clamp(Math.max(0, Number(ersUnit)), 0, 100) : 0;
        }

        if (engineData[engineId][19] === undefined) {
            const gbUnit = queryDB(
                `SELECT UnitValue FROM Custom_Engines_Stats WHERE engineId = ? AND designId = ? AND partStat = 15`,
                [engineId, eNum + 2],
                "singleValue"
            );
            engineData[engineId][19] = gbUnit != null ? clamp(Math.max(0, Number(gbUnit)), 0, 100) : 0;
        }
    }

    // --- 4) Mapea nombres de motores para news (opcional pero útil) ---
    // engines viene tipo: [[1,"Ferrari"], [4,"Red Bull"], ...]
    const engineNameById = {};
    engines.forEach(row => {
        engineNameById[String(row[0])] = row[1];
    });

    const winnerNames = winners.map(id => engineNameById[id] ?? id);
    const loserNames = losers.map(id => engineNameById[id] ?? id);
    const neutralNames = neutrals.map(id => engineNameById[id] ?? id);

    const titleData = {
        changeType,
        mainChangeArea,
        variability: VAR,
        engineData,       // <- lo pasas a editEngines(engineData)
        engineBias,       // <- +1/-1/0 por motor
        engineImpact,     // <- % medio por motor
        winners,
        losers,
        neutrals,
        winnerNames,
        loserNames,
        neutralNames,
        season
    };


    turningPointState.engineRegulation = titleData;

    const title = generateTurningPointTitle(titleData, 107, "original");
    const image = getImagePath(null, "engine", "engine");
    const newsDate = new Date(season, 11, Math.floor(Math.random() * 8) + 13);
    const excelDate = dateToExcel(newsDate);

    const newsEntry = {
        id: entryId,
        title,
        image,
        date: excelDate,
        data: titleData,
        turning_point_type: "original",
        type: "turning_point_engine_regulation"
    };

    newsList.push(newsEntry);

    return newsList;
}


function generateYoungDriversTurningPointNews(currentMonth, savednews = {}, turningPointState = {}) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const season = daySeason?.[1];
    const newsList = [];

    if (!season) {
        return newsList;
    }

    const allRacesDone = queryDB(
        `SELECT COUNT(*) FROM Races WHERE SeasonID = ? AND State = 2`,
        [season],
        "singleValue"
    );
    const totalRaces = queryDB(
        `SELECT COUNT(*) FROM Races WHERE SeasonID = ?`,
        [season],
        "singleValue"
    );

    if (currentMonth < 11 || allRacesDone < totalRaces) {
        return newsList;
    }

    const entryId = `turning_point_young_drivers_${season}`;
    if (savednews[entryId]) {
        newsList.push({ id: entryId, ...savednews[entryId] });
        return newsList;
    }

    const currentDay = daySeason?.[0] ?? 0;

    const f2Rows = queryDB(
        `SELECT bas.FirstName, bas.LastName, dri.StaffID, bas.DOB, con.TeamID, sta.Position, sta.Points
         FROM Staff_Contracts con
         JOIN Staff_DriverData dri
           ON con.StaffID = dri.StaffID
         JOIN Staff_BasicData bas
           ON bas.StaffID = dri.StaffID
         LEFT JOIN Races_DriverStandings sta
           ON sta.DriverID = dri.StaffID
          AND sta.SeasonID = ?
          AND sta.RaceFormula = 2
         WHERE con.ContractType = 0
           AND con.TeamID BETWEEN 11 AND 21`,
        [season],
        "allRows"
    );

    const f2Map = new Map();
    f2Rows.forEach(row => {
        const [firstName, lastName, driverId, dob, teamId, position, points] = row;
        const age = (dob != null && currentDay != null) ? Math.floor((currentDay - dob) / 365.25) : null;

        const driverNum = Number(driverId);
        if (f2Map.has(driverNum)) return;

        const [nameFormatted] = formatNamesSimple([firstName, lastName, driverId]);
        const teamName = teamId ? combined_dict[teamId] : null;
        const overall = getDriverOverall(driverId);

        f2Map.set(driverNum, {
            driverId: driverNum,
            name: nameFormatted,
            age,
            position: position != null ? Number(position) : null,
            points: points != null ? Number(points) : null,
            teamId: teamId != null ? Number(teamId) : null,
            team: teamName || "",
            series: "F2",
            overall: Number(overall || 0)
        });
    });

    const f2AllDrivers = Array.from(f2Map.values());
    const f2AgeValues = f2AllDrivers.map(p => p.age).filter(age => typeof age === "number");
    const f2AverageAge = f2AgeValues.length
        ? f2AgeValues.reduce((sum, age) => sum + age, 0) / f2AgeValues.length
        : null;
    const f2AgeCut = f2AverageAge != null ? f2AverageAge : Number.POSITIVE_INFINITY;
    const f2Eligible = f2AllDrivers.filter(p => typeof p.age === "number" && p.age <= f2AgeCut);
    const f2Prospects = f2Eligible
        .sort((a, b) => (b.overall - a.overall) || (a.age - b.age))
        .slice(0, YOUNG_DRIVER_MAX_PER_SERIES);

    const f3Rows = queryDB(
        `SELECT bas.FirstName, bas.LastName, dri.StaffID, bas.DOB, con.TeamID, sta.Position, sta.Points
         FROM Staff_Contracts con
         JOIN Staff_DriverData dri
           ON con.StaffID = dri.StaffID
         JOIN Staff_BasicData bas
           ON bas.StaffID = dri.StaffID
         LEFT JOIN Races_DriverStandings sta
           ON sta.DriverID = dri.StaffID
          AND sta.SeasonID = ?
          AND sta.RaceFormula = 3
         WHERE con.ContractType = 0
           AND con.TeamID BETWEEN 22 AND 31`,
        [season],
        "allRows"
    );

    const f3Map = new Map();
    f3Rows.forEach(row => {
        const [firstName, lastName, driverId, dob, teamId, position, points] = row;
        const age = (dob != null && currentDay != null) ? Math.floor((currentDay - dob) / 365.25) : null;

        const driverNum = Number(driverId);
        if (f3Map.has(driverNum)) return;

        const [nameFormatted] = formatNamesSimple([firstName, lastName, driverId]);
        const teamName = teamId ? combined_dict[teamId] : null;
        const overall = getDriverOverall(driverId);

        f3Map.set(driverNum, {
            driverId: driverNum,
            name: nameFormatted,
            age,
            position: position != null ? Number(position) : null,
            points: points != null ? Number(points) : null,
            teamId: teamId != null ? Number(teamId) : null,
            team: teamName || "",
            series: "F3",
            overall: Number(overall || 0)
        });
    });

    const f3AllDrivers = Array.from(f3Map.values());
    const f3AgeValues = f3AllDrivers.map(p => p.age).filter(age => typeof age === "number");
    const f3AverageAge = f3AgeValues.length
        ? f3AgeValues.reduce((sum, age) => sum + age, 0) / f3AgeValues.length
        : null;
    const f3AgeCut = f3AverageAge != null ? f3AverageAge : Number.POSITIVE_INFINITY;
    const f3Eligible = f3AllDrivers.filter(p => typeof p.age === "number" && p.age <= f3AgeCut);
    const f3Prospects = f3Eligible
        .sort((a, b) => (b.overall - a.overall) || (a.age - b.age))
        .slice(0, YOUNG_DRIVER_MAX_PER_SERIES);

    const usedIds = new Set([...f2Prospects, ...f3Prospects].map(p => p.driverId));

    const extraRows = queryDB(
        `SELECT bas.FirstName, bas.LastName, bas.DOB, dri.StaffID
         FROM Staff_BasicData bas
         JOIN Staff_DriverData dri
           ON bas.StaffID = dri.StaffID
         JOIN Staff_GameData gd
           ON bas.StaffID = gd.StaffID
         WHERE gd.Retired = 0
           AND dri.StaffID NOT IN (SELECT StaffID FROM Staff_Contracts WHERE ContractType = 0)`,
        [],
        "allRows"
    );

    const extraCandidates = [];
    extraRows.forEach(row => {
        const [firstName, lastName, dob, driverId] = row;
        const driverNum = Number(driverId);
        if (usedIds.has(driverNum)) return;

        const age = (dob != null && currentDay != null) ? Math.floor((currentDay - dob) / 365.25) : null;
        if (age == null || age > FREE_AGENT_MAX_AGE) return;

        const [nameFormatted] = formatNamesSimple([firstName, lastName, driverId]);
        const overall = getDriverOverall(driverId);

        extraCandidates.push({
            driverId: driverNum,
            name: nameFormatted,
            age,
            position: null,
            points: null,
            teamId: null,
            team: "",
            series: "Regional formulas",
            overall: Number(overall || 0)
        });
    });

    const freeAgentProspects = extraCandidates
        .sort((a, b) => (b.overall - a.overall) || (a.age - b.age))
        .slice(0, FREE_AGENT_MAX);


    const titleProspects = [];
    const titleSeen = new Set();
    const pushTitleProspect = (prospect) => {
        if (!prospect || titleSeen.has(prospect.driverId)) return;
        titleProspects.push(prospect);
        titleSeen.add(prospect.driverId);
    };

    if (f2Prospects.length > 0) {
        pushTitleProspect(f2Prospects[0]);
    }
    if (f3Prospects.length > 0) {
        pushTitleProspect(f3Prospects[0]);
    }
    if (f2Prospects.length === 0 || f3Prospects.length === 0) {
        freeAgentProspects.forEach(pushTitleProspect);
    }

    if (titleProspects.length < 2) {
        f2Prospects.slice(1).forEach(pushTitleProspect);
        f3Prospects.slice(1).forEach(pushTitleProspect);
    }

    const titleNames = titleProspects.slice(0, 2).map(p => p.name);

    const titleData = {
        season,
        driver1: titleNames[0] || "",
        driver2: titleNames[1] || "",
        driver3: titleNames[2] || "",
        f2Prospects,
        f3Prospects,
        freeAgentProspects,
        prospects: [...f2Prospects, ...f3Prospects, ...freeAgentProspects]
    };

    turningPointState.youngDrivers = titleData;

    const title = generateTurningPointTitle(titleData, 108, "original");
    const image = getImagePath(null, null, "young");
    const newsDate = new Date(season, 11, Math.floor(Math.random() * 8) + 13);
    const excelDate = dateToExcel(newsDate);

    const newsEntry = {
        id: entryId,
        title,
        image,
        date: excelDate,
        data: titleData,
        turning_point_type: "original",
        type: "turning_point_young_drivers"
    };

    newsList.push(newsEntry);

    return newsList;
}

function applyYoungDriversBoost(turningPointData) {
    const prospects = turningPointData?.prospects || [];
    if (!prospects.length) return;

    const uniqueDriverIds = [...new Set(prospects.map(p => p.driverId).filter(Boolean))];
    uniqueDriverIds.forEach(driverId => {
        boostDriverStats(driverId);
        boostDriverGrowth(driverId);
    });
}

function boostDriverStats(driverId) {
    driverStats.forEach(statId => {
        const currentValue = queryDB(
            `SELECT Val FROM Staff_performanceStats WHERE StaffID = ? AND StatID = ?`,
            [driverId, statId],
            "singleValue"
        );
        const boost = randomIntBetween(YOUNG_DRIVER_STAT_BOOST_MIN, YOUNG_DRIVER_STAT_BOOST_MAX);
        const baseValue = currentValue != null ? Number(currentValue) : 50;
        const nextValue = clampValue(baseValue + boost, 0, 100);

        if (currentValue == null) {
            queryDB(
                `INSERT INTO Staff_performanceStats (StaffID, StatID, Val, Max)
                 VALUES (?, ?, ?, 100)`,
                [driverId, statId, nextValue],
                "run"
            );
        } else {
            queryDB(
                `UPDATE Staff_performanceStats
                 SET Val = ?
                 WHERE StaffID = ? AND StatID = ?`,
                [nextValue, driverId, statId],
                "run"
            );
        }
    });
}

function boostDriverGrowth(driverId) {
    const currentValue = queryDB(
        `SELECT Improvability FROM Staff_DriverData WHERE StaffID = ?`,
        [driverId],
        "singleValue"
    );
    const boost = randomIntBetween(YOUNG_DRIVER_GROWTH_BOOST_MIN, YOUNG_DRIVER_GROWTH_BOOST_MAX);
    const baseValue = currentValue != null ? Number(currentValue) : 0;
    const nextValue = clampValue(baseValue + boost, 0, 100);

    queryDB(
        `UPDATE Staff_DriverData
         SET Improvability = ?
         WHERE StaffID = ?`,
        [nextValue, driverId],
        "run"
    );
}

function clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomIntBetween(min, max) {
    const minVal = Math.ceil(min);
    const maxVal = Math.floor(max);
    return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}


function generateTechnicalDirectiveTurningPointNews(currentMonth, savednews = {}, turningPointState = {}) {
    let newsList = [];
    //get previous technical directive turning point news
    for (let month of [6, 9]) {
        const entryId = `turning_point_technical_directive_${month}`;
        if (savednews[entryId]) {
            newsList.push({ id: entryId, ...savednews[entryId] });
        }
    }

    if ((currentMonth !== 6 && currentMonth !== 9) || turningPointState.technicalDirectives[currentMonth] === "None") {
        return newsList;
    }

    const entryId = `turning_point_technical_directive_${currentMonth}`;

    if (savednews[entryId]) {
        return newsList;
    }

    //60% chance of happening
    if (Math.random() < 0.6) {
        turningPointState.technicalDirectives[currentMonth] = "None";
        return newsList;
    }
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');


    const parts = [3, 4, 5, 6, 7, 8]
    const partId = randomPick(parts);
    const partName = part_full_names[partId].toLowerCase() || "Unknown Part";

    const globals = getGlobals();
    let teamIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    if (globals.isCreateATeam) {
        teamIds.push(32);
    }

    const excelDate = dateToExcel(new Date(daySeason[1], currentMonth - 1, Math.floor(Math.random() * 28) + 1));


    const performance = getPerformanceAllTeams(excelDate, null, globals.isCreateATeam)
    const championship = queryDB(`SELECT TeamID, Points, Position FROM Races_TeamStandings WHERE SeasonID = ? AND RaceFormula = 1 ORDER BY Position`, [daySeason[1]], 'allRows');

    const constructorsStandings = {};
    for (const row of championship) {
        const teamId = Number(row[0]);
        constructorsStandings[teamId] = {
            points: Number(row[1]),
            rank: Number(row[2])
        };
    }

    const capsByPart = {
        3: 7.5, //chasis
        4: 4, //front wing
        5: 4, //rear wing
        6: 4, //underfloor
        7: 7, //suspension
        8: 5  //sidepod
    }

    const cap = capsByPart[partId] || 5;               // máximo +/-
    const standingsWeight = 0.25;   // 0 = ignora standings; prueba 0.2–0.3 si quieres mezclar un poco
    const zeroSum = true;          // intenta balance neto ~0 en compresión
    let effectOnEachteam = {};

    // Normaliza tipos de teamIds por si vienen como strings
    const ids = teamIds.map(id => Number(id));

    // Helper clamp
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    if (Math.random() < 0.5) {
        // --- MODO RANDOM PURO (50%) ---
        for (const teamId of ids) {
            const v = (Math.random() * 2 * cap) - cap; // [-2, 2]
            effectOnEachteam[teamId] = {
                performanceGainLoss: v.toFixed(2),
                teamName: combined_dict[teamId] || "Unknown Team"
            };
        }
    } else {
        // console.log("MODO COMPRESION");
        // --- MODO COMPRESIÓN (50%) basado en rendimiento (+ opcional standings) ---
        const vals = ids
            .map(id => performance[id])
            .filter(v => typeof v === "number" && Number.isFinite(v));
        const mean = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;

        let maxAbsDev = 1e-9; // evita div/0
        for (const id of ids) {
            const dev = ((performance[id] ?? mean) - mean);
            if (Math.abs(dev) > maxAbsDev) maxAbsDev = Math.abs(dev);
        }

        // Precompute máximo de puntos para normalizar standings si se usa
        const maxPts = Math.max(...ids.map(id => constructorsStandings[id]?.points ?? 0), 1);

        // Calcula efectos crudos
        const raw = ids.map(teamId => {
            const score = performance[teamId] ?? mean;
            const norm = (score - mean) / maxAbsDev; // [-1, 1]

            // efecto “compresión” por rendimiento
            let eff = -norm * cap;

            // mezcla ligera con standings (mejores => leve castigo, peores => ayuda)
            if (standingsWeight > 0) {
                const pts = constructorsStandings[teamId]?.points ?? 0;
                const ptsNorm = (pts / maxPts);                // 0..1
                const standingsEff = -(ptsNorm - 0.5) * cap;   // centra en 0.5
                eff = (1 - standingsWeight) * eff + standingsWeight * standingsEff;
            }

            // un pelín de ruido para que no sea tan lineal
            eff += (Math.random() * 0.3) - 0.15;

            return { teamId, eff };
        });

        // Cero-suma (opcional)
        let adjusted = raw;
        if (zeroSum && adjusted.length) {
            const avg = adjusted.reduce((a, r) => a + r.eff, 0) / adjusted.length;
            adjusted = adjusted.map(r => ({ teamId: r.teamId, eff: r.eff - avg }));
        }

        // clamp + salida
        for (const { teamId, eff } of adjusted) {
            effectOnEachteam[teamId] = {
                performanceGainLoss: clamp(eff, -cap, cap).toFixed(2),
                teamName: combined_dict[teamId] || "Unknown Team",
                teamId: teamId
            };
        }
    }

    const possibleReasons = ["improve safety", "reduce costs", "standardize components", "enhance performance parity", "improve racing", "address a grey area in the regulations"];
    const reason = randomPick(possibleReasons);

    const titleData = {
        component: partName,
        componentId: partId,
        effectOnEachteam: effectOnEachteam,
        month: currentMonth,
        reason: reason,
        season: daySeason[1]
    }

    const title = generateTurningPointTitle(titleData, 100, "original");
    const image = getImagePath(null, partId, "technical");
    //generate a RANDOM date in the current month

    turningPointState.technicalDirectives[currentMonth] = {
        component: partName,
        componentId: partId,
        effectOnEachteam: effectOnEachteam
    }

    const newData = {
        id: entryId,
        title: title,
        image: image,
        date: excelDate,
        data: titleData,
        turning_point_type: "original",
        type: "turning_point_technical_directive"
    }

    newsList.push(newData);

    return newsList;
}

function generateMidSeasonTransfersTurningPointNews(monthsDone, currentMonth, savednews = {}, turningPointState = {}) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    let newsList = [];
    for (let month = 5; month <= 7; month++) {
        const entryId = `turning_point_transfer_${month}`;
        if (savednews[entryId]) {
            newsList.push({ id: entryId, ...savednews[entryId] });
        }
    }

    if (![5, 6, 7].includes(currentMonth) || turningPointState.transfers[currentMonth]) {
        return newsList;
    }

    //   // 50% chance
    if (Math.random() >= 0.5) {
        turningPointState.transfers[currentMonth] = "None";
        return newsList;
    }

    const driversTeamPoints = queryDB(`
    SELECT
      res.DriverID,
      con.TeamID,
      res.Points AS TotalPoints
    FROM Races_DriverStandings res
    JOIN Staff_Contracts con
      ON res.DriverID = con.StaffID
     AND con.ContractType = 0
     AND con.PosInTeam <= 2
    WHERE res.SeasonID = ?
      AND res.RaceFormula = 1
    `, [daySeason[1]], "allRows");


    const teamsById = {};
    for (const row of driversTeamPoints) {
        const teamId = Number(row[1]);
        const driverId = Number(row[0]);
        const pts = Number(row[2]) || 0;

        if (!teamsById[teamId]) {
            teamsById[teamId] = { total: 0, drivers: {} };
        }
        teamsById[teamId].total += pts;
        teamsById[teamId].drivers[driverId] = (teamsById[teamId].drivers[driverId] || 0) + pts;
    }

    const teamsWithImbalance = [];
    for (const [teamIdStr, data] of Object.entries(teamsById)) {
        const teamId = Number(teamIdStr);
        const total = data.total || 0;
        if (total <= 0) continue;

        const hasCarry = Object.values(data.drivers).some(pts => (pts / total) > 0.70);
        if (hasCarry) teamsWithImbalance.push(teamId);
    }

    const usedTeams = new Set();

    if (turningPointState?.transfers) {
        for (const m of [5, 6, 7]) {
            const tp = turningPointState.transfers[m];
            if (tp && tp !== "None" && tp?.teamId != null) {
                usedTeams.add(Number(tp.teamId));
            }
        }
    }

    const candidateTeams = teamsWithImbalance.filter(tid => !usedTeams.has(tid));

    if (candidateTeams.length === 0) {
        turningPointState.transfers[currentMonth] = "None";
        return newsList;
    }

    const randomTeam = randomPick(candidateTeams);
    const randomTeamName = combined_dict[randomTeam] || "Unknown Team";

    const entryId = `turning_point_transfer_${currentMonth}`;

    if (savednews[entryId]) {
        return newsList;
    }

    //the driver from the randomteam with less points
    let driverOut = teamsById[randomTeam] ? Object.entries(teamsById[randomTeam].drivers).sort((a, b) => a[1] - b[1])[0] : null;
    let driverIn, driverSubstitute, driverInTeamId, driverSubstituteTeamId;

    if (randomTeam === 3) {
        if (combined_dict[8] === "Alpha Tauri" || combined_dict[8] === "Visa Cashapp RB") { //red bull special case
            driverIn = Object.entries(teamsById[8].drivers).sort((a, b) => b[1] - a[1])[0];
            driverInTeamId = 8;
        } else {
            const teamsByTotalPoints = Object.entries(teamsById).sort((a, b) => a[1].total - b[1].total);
            const lowerTeams = teamsByTotalPoints.filter(entry => entry[1].total < teamsById[3].total).map(entry => entry[0]);
            //get all the drivers from those teams and order them by rating
            const candidates = [];
            for (const tId of lowerTeams) {
                if (teamsById[tId]) {
                    for (const [dId, pts] of Object.entries(teamsById[tId].drivers)) {
                        let rating = getDriverOverall(dId);
                        candidates.push({ driverId: dId, points: pts, teamId: tId, rating });
                    }
                }
            }
            candidates.sort((a, b) => b.rating - a.rating);
            if (candidates.length > 0) {
                driverIn = [candidates[0].driverId, candidates[0].points];
                driverInTeamId = candidates[0].teamId;
            }

            //fallback if not driverIn, get the best free agent
            if (!driverIn) {
                const freeAgents = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID
                    FROM Staff_BasicData bas
                    JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID
                    JOIN Staff_GameData gd ON bas.StaffID = gd.StaffID
                    WHERE dri.StaffID NOT IN (SELECT StaffID FROM Staff_Contracts)
                    AND gd.Retired = 0`, [], 'allRows');
                if (freeAgents.length) {
                    for (const fa of freeAgents) {
                        const overall = getDriverOverall(fa[2]);
                        fa.push(overall);
                    }
                    freeAgents.sort((a, b) => b[3] - a[3]);
                    driverIn = [freeAgents[0][2], freeAgents[0][3]];
                }
            }
        }
    } else {
        const teamsByTotalPoints = Object.entries(teamsById).sort((a, b) => a[1].total - b[1].total);
        const bottom3Teams = teamsByTotalPoints.slice(0, 3).map(entry => entry[0]);
        const top4Teams = teamsByTotalPoints.slice(-4).map(entry => entry[0]);


        const teamToCompare = String(randomTeam);

        if (bottom3Teams.includes(teamToCompare)) {
            const reserveDrivers = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID
                FROM Staff_Contracts con
                JOIN Staff_BasicData bas ON con.StaffID = bas.StaffID
                JOIN Staff_DriverData dri ON con.StaffID = dri.StaffID
                WHERE con.TeamID = ? AND con.ContractType = 0 AND con.PosInTeam > 2`, [randomTeam], 'allRows');
            if (reserveDrivers.length) {
                //get the best reserve driver by overall
                const reserveCandidates = [];
                for (const rd of reserveDrivers) {
                    const overall = getDriverOverall(rd[2]);
                    reserveCandidates.push({ driverId: rd[2], teamId: rd[3], rating: overall });
                }
                reserveCandidates.sort((a, b) => b.rating - a.rating);
                driverIn = [reserveCandidates[0].driverId, reserveCandidates[0].rating];
                driverInTeamId = reserveCandidates[0].teamId;
            }
        } else if (top4Teams.includes(teamToCompare)) {
            const teamsByTotalPoints = Object.entries(teamsById).sort((a, b) => a[1].total - b[1].total);
            const lowerTeams = teamsByTotalPoints.filter(entry => entry[1].total < teamsById[randomTeam].total).map(entry => entry[0]);
            //get all the drivers from those teams and order them by rating
            const candidates = [];
            for (const tId of lowerTeams) {
                if (teamsById[tId]) {
                    for (const [dId, pts] of Object.entries(teamsById[tId].drivers)) {
                        let rating = getDriverOverall(dId);
                        candidates.push({ driverId: dId, points: pts, teamId: tId, rating });
                    }
                }
            }
            candidates.sort((a, b) => b.rating - a.rating);
            if (candidates.length > 0) {
                //get a random pick from the top 5 candidates
                const topCandidates = candidates.slice(0, 5);
                const selectedCandidate = randomPick(topCandidates);
                driverIn = [selectedCandidate.driverId, selectedCandidate.points];
                driverInTeamId = selectedCandidate.teamId;

                const freeAgents = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID
                        FROM Staff_BasicData bas
                        JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID
                        JOIN Staff_GameData gd ON bas.StaffID = gd.StaffID
                        WHERE dri.StaffID NOT IN (SELECT StaffID FROM Staff_Contracts)
                        AND gd.Retired = 0`, [], 'allRows');
                if (freeAgents.length) {
                    for (const fa of freeAgents) {
                        const overall = getDriverOverall(fa[2]);
                        fa.push(overall);
                    }
                    freeAgents.sort((a, b) => b[3] - a[3]);
                    driverSubstitute = [freeAgents[0][2], freeAgents[0][3]];
                }
            }
        } else {
            const candidates = [];
            for (const tId of bottom3Teams.filter(tid => tid != randomTeam)) {
                if (teamsById[tId]) {
                    for (const [dId, pts] of Object.entries(teamsById[tId].drivers)) {
                        candidates.push({ driverId: dId, points: pts, teamId: tId });
                    }
                }
            }
            candidates.sort((a, b) => b.points - a.points);
            if (candidates.length > 0) {
                driverIn = [candidates[0].driverId, candidates[0].points];
                driverInTeamId = candidates[0].teamId;

                const reserveDrivers = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID
                    FROM Staff_Contracts con
                    JOIN Staff_BasicData bas ON con.StaffID = bas.StaffID
                    JOIN Staff_DriverData dri ON con.StaffID = dri.StaffID
                    WHERE con.TeamID = ? AND con.ContractType = 0 AND con.PosInTeam > 2`, [driverInTeamId], 'allRows');

                if (reserveDrivers.length) {
                    const reserveCandidates = [];
                    for (const rd of reserveDrivers) {
                        const overall = getDriverOverall(rd[2]);
                        reserveCandidates.push({ driverId: rd[2], teamId: rd[3], rating: overall });
                    }
                    reserveCandidates.sort((a, b) => b.rating - a.rating);
                    driverSubstitute = [reserveCandidates[0].driverId, reserveCandidates[0].rating];
                    driverSubstituteTeamId = reserveCandidates[0].teamId;
                } else {
                    const freeAgents = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID
                        FROM Staff_BasicData bas
                        JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID
                        JOIN Staff_GameData gd ON bas.StaffID = gd.StaffID
                        WHERE dri.StaffID NOT IN (SELECT StaffID FROM Staff_Contracts)
                        AND gd.Retired = 0`, [], 'allRows');
                    if (freeAgents.length) {
                        for (const fa of freeAgents) {
                            const overall = getDriverOverall(fa[2]);
                            fa.push(overall);
                        }
                        freeAgents.sort((a, b) => b[3] - a[3]);
                        driverSubstitute = [freeAgents[0][2], freeAgents[0][3]];
                    }
                }
            }
        }
    }

    const excelDate = dateToExcel(new Date(daySeason[1], currentMonth - 1, Math.floor(Math.random() * 28) + 1));

    let driverOutName = driverOut ? queryDB(`SELECT FirstName, LastName FROM Staff_BasicData WHERE StaffID = ?`, [driverOut[0]], 'singleRow') : null;
    driverOutName.push(driverOut[0], driverOut[1]);
    driverOutName = formatNamesSimple(driverOutName || ["Unknown", "Driver"]);

    let driverInName = driverIn ? queryDB(`SELECT FirstName, LastName FROM Staff_BasicData WHERE StaffID = ?`, [driverIn[0]], 'singleRow') : null;
    driverInName.push(driverIn[0], driverIn[1]);
    driverInName = formatNamesSimple(driverInName || ["Unknown", "Driver"]);

    let driverSubstituteName = [];
    if (driverSubstitute) {
        driverSubstituteName = queryDB(`SELECT FirstName, LastName FROM Staff_BasicData WHERE StaffID = ?`, [driverSubstitute[0]], 'singleRow');
        driverSubstituteName.push(driverSubstitute[0], driverSubstitute[1]);
        driverSubstituteName = formatNamesSimple(driverSubstituteName || ["Unknown", "Driver"]);
    }

    const newData = {
        team: randomTeamName,
        teamId: randomTeam,
        driver_out: {
            id: driverOutName[1],
            name: driverOutName[0],
            teamId: randomTeam
        },
        driver_in: {
            id: driverInName[1],
            name: driverInName[0],
            teamId: driverInTeamId
        },
        driver_substitute: driverSubstitute ? {
            id: driverSubstituteName[1],
            name: driverSubstituteName[0],
            teamId: driverSubstituteTeamId
        } : null,
        month: currentMonth,
        season: daySeason[1]
    };

    turningPointState.transfers[currentMonth] = newData; //tendria que ser currentMonth, pero para pruebas lo dejo fijo en junio

    const title = generateTurningPointTitle(newData, 101, "original");
    const image = getImagePath(null, driverOutName[1], "transfer");

    const newEntry = {
        id: entryId,
        title,
        image,
        data: newData,
        date: excelDate,
        turning_point_type: "original",
        type: "turning_point_transfer"
    };

    newsList.push(newEntry);

    return newsList;
}

function generateDSQTurningPointNews(racesDone, savednews = {}, turningPointState = {}) {
    const last3Races = racesDone.slice(-3);
    let newsList = [];
    let forcedCleanSeason = false;

    // Populate newsList with existing news from savednews that correspond to illegal races
    if (turningPointState.ilegalRaces) {
        turningPointState.ilegalRaces.forEach(raceData => {
            const entryId = `turning_point_dsq_${raceData.race_id}`;
            if (savednews[entryId]) {
                newsList.push({ id: entryId, ...savednews[entryId] });
                //if there is alredy two ilegal races, the rest of the season will be clean
                if (turningPointState.ilegalRaces.length >= 2) forcedCleanSeason = true;
            }
        });
    }

    const racesNotChecked = [];
    for (const r of last3Races) {
        if (!turningPointState.checkedRaces.includes(r)) {
            racesNotChecked.push(r);
            turningPointState.checkedRaces.push(r);
        }
    }

    if (racesNotChecked.length === 0) {
        return newsList; // All recent races checked, return existing news
    }

    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');

    if (Math.random() > 0.08 || forcedCleanSeason) { //testing, should be 0.08
        return newsList; // Random chance to not generate
    }

    const raceId = randomPick(racesNotChecked); // Pick from only the new races to check
    const raceDate = queryDB(`SELECT Day FROM Races WHERE RaceID = ?`, [raceId], 'singleValue');
    const teamsWithPoints = queryDB(`SELECT TeamID, SUM(Points) FROM Races_Results WHERE RaceID = ? AND Points > 0 GROUP BY TeamID`, [raceId], 'allRows');

    if (!teamsWithPoints.length) {
        return newsList;
    }
    const teamRow = randomPick(teamsWithPoints);

    const teamId = teamRow[0];
    const teamName = combined_dict[teamId] || "Unknown Team";

    const entryId = `turning_point_dsq_${raceId}`;
    if (savednews[entryId]) {
        // This case should ideally not be hit if logic is correct, but as a safeguard:
        if (!newsList.some(item => item.id === entryId)) {
            newsList.push({ id: entryId, ...savednews[entryId] });
        }
        return newsList;
    }

    const components = ["engine brake map", "fuel flow", "front wing", "rear wing", "diffuser", "floor", "brake ducts", "suspension", "gearbox", "cooling system", "hydraulics", "clutch", "plank wear"];
    const component = randomPick(components);

    let driver1, driver2;
    const drivers = queryDB(`SELECT bas.FirstName, bas.LastName, res.TeamID, res.Points, bas.StaffID, res.FinishingPos FROM Races_Results res JOIN Staff_BasicData bas ON res.DriverID = bas.StaffID WHERE res.RaceID = ?  AND res.TeamID = ?`, [raceId, teamId], 'allRows');
    drivers.forEach((d, idx) => {
        const nameFormatted = formatNamesSimple(d);
        if (idx === 0) {
            driver1 = { name: nameFormatted[0], points: d[3], position: d[5], driverId: d[4] };
        } else if (idx === 1) {
            driver2 = { name: nameFormatted[0], points: d[3], position: d[5], driverId: d[4] };
        }
    });

    const titleData = {
        team: teamName,
        adjective: getCircuitInfo(raceId).adjective,
        circuit: getCircuitInfo(raceId).circuit,
        country: getCircuitInfo(raceId).country,
        race_id: raceId,
        component: component,
        teamId: teamId,
        currentSeason: daySeason[1],
        driver_1: driver1,
        driver_2: driver2
    }

    turningPointState.ilegalRaces.push(titleData);

    const title = generateTurningPointTitle(titleData, 103, "original");
    const image = getImagePath(null, null, "dsq");

    const newEntry = {
        id: entryId,
        title,
        image,
        data: titleData,
        date: raceDate + 2,
        turning_point_type: "original",
        type: "turning_point_dsq"
    }

    newsList.push(newEntry);

    return newsList;
}

function getMaxPointsForRace(raceId, pointsSchema, seasonId = null) {
    let maxPoints = parseInt(pointsSchema.twoBiggestPoints[0])
    let fastestLapPoint = parseInt(pointsSchema.fastestLapBonusPoint)
    let polePositionPoint = parseInt(pointsSchema.polePositionBonusPoint)
    let isLastraceDouble = parseInt(pointsSchema.isLastraceDouble)
    const isSprint = queryDB(`SELECT WeekendType FROM Races WHERE RaceID = ?`, [raceId], 'singleValue') === 1;
    const maxSprintPoints = 8;
    const isLastRaceOfSeason = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ?`, [seasonId], 'singleValue') === raceId;

    if (isLastRaceOfSeason && isLastraceDouble) {
        maxPoints *= 2;
    }

    if (isSprint) {
        maxPoints += parseInt(maxSprintPoints);
    }

    if (fastestLapPoint) {
        maxPoints += parseInt(fastestLapPoint);
    }

    if (polePositionPoint) {
        maxPoints += parseInt(polePositionPoint);
    }

    return parseInt(maxPoints);
}

function championshipStatus(
    raceIdToCheck,
    pointsSchema,
    allSeasonRaces,
    leader,
    rival,
    currentSeason
) {
    const raceInfo = allSeasonRaces.find(r => r.id === raceIdToCheck);
    if (!raceInfo) throw new Error("Carrera no encontrada");

    // 2) Lista de todas las carreras desde esta (incluida) en adelante
    const remainingRaces = allSeasonRaces
        .filter(r => r.day >= raceInfo.day)
        .map(r => r.id);

    // 3) Suma de puntos máximos que puede conseguir el rival
    const maxPointsForRival = remainingRaces
        .reduce((sum, id) =>
            sum + getMaxPointsForRace(id, pointsSchema, currentSeason)
            , 0);

    // === COMPROBACIÓN A: ¿YA es campeón antes de la carrera? ===
    // Si rival.points + maxPointsForRival < leader.points entonces no le alcanzan ni sumando TODO
    const alreadyChampion = (rival.points + maxPointsForRival) < leader.points;

    // === COMPROBACIÓN B: ¿Se corona EN esta carrera? ===
    // Puntos máximos que puede sumar el líder en esta carrera
    const maxPointsThisRace = getMaxPointsForRace(
        raceIdToCheck,
        pointsSchema,
        currentSeason
    );

    // Puntos máximos que puede sumar el rival **solo en las posteriores** a esta carrera
    const futureRaces = allSeasonRaces
        .filter(r => r.day > raceInfo.day)
        .map(r => r.id);

    const maxPointsFutureOnly = futureRaces
        .reduce((sum, id) =>
            sum + getMaxPointsForRace(id, pointsSchema, currentSeason)
            , 0);

    // Si líder + maxPointsThisRace > rival + maxPointsFutureOnly, se corona EN esta carrera
    const clinchThisRace =
        (leader.points + maxPointsThisRace) > (rival.points + maxPointsFutureOnly);


    return { alreadyChampion, clinchThisRace };
}

function generateChampionMilestones(racesDone, savednews = {}) {
    const pointsSchema = fetchPointsRegulations();

    const ps = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    if (!ps) return [];
    const currentSeason = ps[1];

    const allSeasonRacesQuery = queryDB(
        `SELECT RaceID, Day, TrackID FROM Races WHERE SeasonID = ? ORDER BY Day ASC`, [currentSeason],
        'allRows'
    );
    if (!allSeasonRacesQuery || allSeasonRacesQuery.length === 0) return [];

    const allRaces = allSeasonRacesQuery.map(r => ({ id: r[0], day: r[1], trackId: r[2] }));
    const totalRaces = allRaces.length;
    const halfIndex = Math.floor(totalRaces / 2);

    const seasonResults = fetchSeasonResults(currentSeason);
    if (!seasonResults) return [];

    const doneSet = new Set(racesDone ?? []);
    let lastDoneIdx = -1;
    for (let i = 0; i < allRaces.length; i++) {
        if (doneSet.has(allRaces[i].id)) lastDoneIdx = i;
    }

    if (lastDoneIdx < halfIndex) return [];

    const out = [];

    const iStart = halfIndex;
    const prevRaceIdStart = iStart > 0 ? allRaces[iStart - 1].id : 0;
    const standingsBeforeStart = rebuildStandingsUntil(seasonResults, prevRaceIdStart);
    let wasAlreadyChampionBeforeThisRace = false;
    if (standingsBeforeStart?.driverStandings?.length >= 2) {
        const leaderS = standingsBeforeStart.driverStandings[0];
        const rivalS = standingsBeforeStart.driverStandings[1];
        if (leaderS && rivalS) {
            const statusAtStart = championshipStatus(
                allRaces[iStart].id,
                pointsSchema,
                allRaces,
                leaderS,
                rivalS,
                currentSeason
            );
            wasAlreadyChampionBeforeThisRace = !!statusAtStart?.alreadyChampion;
        }
    }

    const iEnd = Math.min(lastDoneIdx + 1, allRaces.length - 1);
    for (let i = iStart; i <= iEnd; i++) {
        const race = allRaces[i];
        const prevRaceId = i > 0 ? allRaces[i - 1].id : 0;

        const standingsBefore = rebuildStandingsUntil(seasonResults, prevRaceId);
        if (standingsBefore?.driverStandings?.length >= 2) {
            const leaderB = standingsBefore.driverStandings[0];
            const rivalB = standingsBefore.driverStandings[1];

            if (leaderB && rivalB && leaderB.points != null && rivalB.points != null) {
                const statusAtRace = championshipStatus(
                    race.id,
                    pointsSchema,
                    allRaces,
                    leaderB,
                    rivalB,
                    currentSeason
                );

                if (statusAtRace?.clinchThisRace && !wasAlreadyChampionBeforeThisRace) {
                    const newsId = `${currentSeason}_potential_champion_${race.id}`;
                    if (savednews && savednews[newsId]) {
                        out.push({ id: newsId, ...savednews[newsId] });
                    } else {
                        const raceInfo = getCircuitInfo(race.id);
                        const jsDate = excelToDate(race.day); jsDate.setDate(jsDate.getDate() - 2);
                        const finalNewsDateExcel = dateToExcel(jsDate);

                        const code = races_names[Number(race.trackId)];
                        const image = getImagePath(leaderB.teamId, code, "champion");

                        const title = generateTitle({
                            driver_name: leaderB.name,
                            circuit: raceInfo.circuit,
                            country: raceInfo.country,
                            adjective: raceInfo.adjective,
                            season_year: currentSeason
                        }, 8);

                        out.push({
                            id: newsId,
                            type: "potential_champion",
                            title,
                            date: finalNewsDateExcel,
                            image,
                            overlay: null,
                            text: null,
                            data: {
                                raceId: race.id,
                                season_year: currentSeason,
                                driver_id: leaderB.driverId,
                                driver_team_id: leaderB.teamId,
                                driver_name: leaderB.name,
                                driver_points: leaderB.points,
                                rival_driver_id: rivalB.driverId,
                                rival_driver_name: rivalB.name,
                                rival_points: rivalB.points,
                                circuit_name: raceInfo.circuit,
                                country_name: raceInfo.country,
                                adjective: raceInfo.adjective
                            }
                        });
                    }
                }
            }
        }


        const standingsAfter = rebuildStandingsUntil(seasonResults, race.id);
        let alreadyChampionBeforeNext = false;
        if (standingsAfter?.driverStandings?.length >= 2) {
            const leaderA = standingsAfter.driverStandings[0];
            const rivalA = standingsAfter.driverStandings[1];

            if (leaderA && rivalA && leaderA.points != null && rivalA.points != null) {
                const hasNext = i + 1 < allRaces.length;
                if (hasNext) {
                    const nextRace = allRaces[i + 1];
                    const statusBeforeNext = championshipStatus(
                        nextRace.id,
                        pointsSchema,
                        allRaces,
                        leaderA,
                        rivalA,
                        currentSeason
                    );
                    alreadyChampionBeforeNext = !!statusBeforeNext?.alreadyChampion;
                } else {
                    alreadyChampionBeforeNext = (leaderA.points >= rivalA.points);
                }

                if (alreadyChampionBeforeNext && !wasAlreadyChampionBeforeThisRace) {
                    const newsId = `${currentSeason}_world_champion`;
                    if (savednews && savednews[newsId]) {
                        out.push({ id: newsId, ...savednews[newsId] });
                    } else {
                        const raceInfo = getCircuitInfo(race.id);
                        const finalNewsDateExcel = race.day + 1;

                        const code = races_names[Number(race.trackId)];
                        const image = getImagePath(leaderA.teamId, code, "champion");

                        const title = generateTitle({
                            driver_name: leaderA.name,
                            circuit: raceInfo.circuit,
                            country: raceInfo.country,
                            adjective: raceInfo.adjective,
                            season_year: currentSeason
                        }, 9);

                        out.push({
                            id: newsId,
                            type: "world_champion",
                            title,
                            date: finalNewsDateExcel,
                            image,
                            overlay: null,
                            text: null,
                            data: {
                                raceId: race.id,
                                season_year: currentSeason,
                                driver_id: leaderA.driverId,
                                driver_team_id: leaderA.teamId,
                                driver_name: leaderA.name,
                                driver_points: leaderA.points,
                                rival_driver_id: rivalA.driverId,
                                rival_driver_name: rivalA.name,
                                rival_points: rivalA.points,
                                circuit_name: raceInfo.circuit,
                                country_name: raceInfo.country,
                                adjective: raceInfo.adjective
                            }
                        });
                    }
                }
            }
        }

        // Avanza el flag para el próximo i
        wasAlreadyChampionBeforeThisRace = alreadyChampionBeforeNext;
    }

    return out;
}






export function getCircuitInfo(raceId) {
    const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ?`, [raceId], 'singleRow');
    const code = races_names[parseInt(trackId)];
    if (!code) return "Unknown Circuit";
    return countries_data[code] || code;
}

function randomRemovalOfNames(data) {
    let paramsWithName = ["winnerName", "pole_driver", "driver1", "driver2", "driver3", "driver_name"];
    const nestedPaths = [
        ["driver_affected", "name"],
        ["reserve_driver", "name"],
        ["driver_out", "name"],
        ["driver_in", "name"],
        ["driver_substitute", "name"],
        ["reserve", "name"],
    ];

    // Campos planos
    paramsWithName.forEach(param => {
        const v = data[param];
        if (typeof v === "string" && v.trim()) {
            let out = v.trim();
            if (Math.random() < 0.5) {
                out = out.split(/\s+/).pop();
            }
            out = news_insert_space(out);
            data[param] = out;
        }
    });

    // Campos anidados .name
    nestedPaths.forEach(path => {
        let obj = data;
        for (let i = 0; i < path.length - 1; i++) {
            obj = obj?.[path[i]];
            if (!obj) return;
        }
        const lastKey = path[path.length - 1];
        const v = obj[lastKey];
        if (typeof v === "string" && v.trim()) {
            let out = v.trim();
            if (Math.random() < 0.5) {
                out = out.split(/\s+/).pop();
            }
            out = (typeof news_insert_space === "function" ? news_insert_space(out) : _newsSpace(out));
            obj[lastKey] = out;
        }
    });

    return data;
}


function generateTurningPointTitle(data, new_type, turningPointType) {
    let dataRandomized = randomRemovalOfNames(data);
    let templateObj = null;
    templateObj = turningPointsTitleTemplates.find(t => t.new_type === new_type);
    const paramMap = getParamMap(dataRandomized);
    let titles = [];
    if (turningPointType === "original") {
        titles = templateObj.turning_titles;
    } else if (turningPointType === "positive") {
        titles = templateObj.positive_titles;
    } else if (turningPointType === "negative") {
        titles = templateObj.negative_titles;
    }

    const idx = Math.floor(Math.random() * titles.length);
    const tpl = titles[idx];
    return tpl.replace(/{{\s*(\w+)\s*}}/g, (_, key) => paramMap[new_type][key] || '');
}


function generateTitle(data, new_type) {
    let dataRandomized = randomRemovalOfNames(data);
    let templateObj = null;
    templateObj = newsTitleTemplates.find(t => t.new_type === new_type);
    let raceInfo = null;
    if (data.raceId) {
        raceInfo = getCircuitInfo(data.raceId);
        data.circuit = raceInfo.circuit;
        data.country = raceInfo.country;
        data.adjective = raceInfo.adjective;
    }
    const paramMap = getParamMap(dataRandomized);

    const titles = templateObj.titles;
    const idx = Math.floor(Math.random() * titles.length);
    const tpl = titles[idx];

    return tpl.replace(/{{\s*(\w+)\s*}}/g, (_, key) => paramMap[new_type][key] || '');
}

export function generateFakeTransferNews(monthsDone, savedNews, bigConfirmedTransfersNews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const season = daySeason[1];

    const seasonResults = fetchSeasonResults(season);

    const usedDriverIdsGlobal = new Set();

    Object.entries(savedNews || {}).forEach(([id, news]) => {
        if (!news || !news.data || !Array.isArray(news.data.drivers)) return;
        // Solo nos interesa mapear fechas por mes para las fake_transfer_*
        if (id.startsWith("fake_transfer_")) {
            news.data.drivers.forEach(driver => {
                if (driver.driverId) {
                    usedDriverIdsGlobal.add(driver.driverId);
                }
            });

            //if it is only fake_transfer_m without slot, transform it into fake_transfer_m_1
            const parts = id.split("_");
            if (parts.length === 3) {
                const newId = `${id}_1`;
                savedNews[newId] = news;
                delete savedNews[id];
            }
        }

        if (id.startsWith("big_transfer_") || id.startsWith("massive_signing_")) {
            let id = news.data.driverId;
            if (id) {
                usedDriverIdsGlobal.add(id);
            }
        }
    });

    //alkso put driverids from bigConfirmedTransfersNews into usedDriverIdsGlobal
    bigConfirmedTransfersNews.forEach(news => {
        let id = news.data.driverId;
        if (id) {
            usedDriverIdsGlobal.add(id);
        }
    });

    let newsList = [];

    monthsDone.forEach(m => {
        // ---- Cálculos que no dependen del "slot" ----
        const drivers = queryDB(
            `SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID
             FROM Staff_BasicData bas
             JOIN Staff_DriverData dri
               ON bas.StaffID = dri.StaffID
             JOIN Staff_Contracts con
               ON bas.StaffID = con.StaffID
             WHERE con.ContractType = 0
               AND con.PosInTeam <= 2
               AND con.TeamID IN (1,2,3,4,5,6,7,8,9,10,32)`, [],
            'allRows'
        );

        let driversWithOverall = [];
        drivers.forEach(d => {
            const overall = getDriverOverall(d[2]);
            const name = formatNamesSimple(d);
            const teamId = d[3];
            const teamName = combined_dict[teamId] || "Unknown Team";

            let driver = {
                name: name[0],
                driverId: name[1],
                team: teamName,
                teamId: teamId,
                overall: overall
            };
            if (overall >= 88 && !usedDriverIdsGlobal.has(driver.driverId)) {
                driversWithOverall.push(driver);
            }
        });

        //sort by overall descending
        driversWithOverall.sort((a, b) => b.overall - a.overall);

        const pointsSchema = fetchPointsRegulations();
        const racesDone = queryDB(
            `SELECT COUNT(*) FROM Races WHERE SeasonID = ? AND State = 2`, [season],
            'singleValue'
        );
        const mostPointsPerRace = pointsSchema.twoBiggestPoints[0];
        const maxPointsPossible = mostPointsPerRace * racesDone;
        const championshipLeaderPoints = queryDB(
            `SELECT DriverID, Points
             FROM Races_DriverStandings
             WHERE SeasonID = ?
               AND Position = 1
               AND RaceFormula = 1`, [season],
            'singleRow'
        );

        const leaderPoints = Number(championshipLeaderPoints?.[1] || 0);
        const thresholdGap = maxPointsPossible / 3;

        // Para evitar repetir piloto en el mismo mes (opcional pero lógico)

        // Si ya hay noticias guardadas para este mes, marcar sus drivers como usados
        for (let slot = 1; slot <= 2; slot++) {
            const existingId = `fake_transfer_${m}_${slot}`;
            const saved = savedNews[existingId];
            if (saved && saved.data && saved.data.drivers && saved.data.drivers[0]) {
                const savedDriverId = saved.data.drivers[0].driverId;
                if (savedDriverId) usedDriverIdsGlobal.add(savedDriverId);
            }
        }

        for (let slot = 1; slot <= 2; slot++) {
            const entryId = `fake_transfer_${m}_${slot}`;

            if (savedNews[entryId]) {
                newsList.push({ id: entryId, ...savedNews[entryId] });
                continue;
            }

            const day = Math.floor(Math.random() * 30) + 1;
            const date = new Date(season, m - 1, day);
            const excelDate = dateToExcel(date);
            const latestRaceDoneUpToDate = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ? AND State = 2 AND Day <= ?`, [season, excelDate], 'singleValue');

            const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, latestRaceDoneUpToDate);
            const championshipLeader = driverStandings.find(ds => ds.position === 1);
            const leaderPoints = Number(championshipLeader?.points || 0);

            if (savedNews[entryId]) {
                newsList.push({ id: entryId, ...savedNews[entryId] });
                continue;
            }

            let randomDriver = null;
            let randomTeamId = null;

            driversWithOverall.forEach(driver => {
                if (usedDriverIdsGlobal.has(driver.driverId)) {
                    return;
                }

                const driverPoints = driversResults.find(dr => dr.driverId === driver.driverId)?.points;

                const points = Number(driverPoints || 0);
                const gap = leaderPoints - points;

                if (gap >= thresholdGap) {
                    if (!randomDriver || driver.overall > randomDriver.overall) {
                        randomDriver = {
                            name: driver.name,
                            driverId: driver.driverId,
                            teamId: driver.teamId
                        };
                        randomTeamId = driver.teamId;
                        usedDriverIdsGlobal.add(driver.driverId);
                    }
                }
            });

            if (!randomDriver) {
                const top10DriversExpiringContracts = queryDB(
                    `SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID
                     FROM Staff_BasicData bas
                     JOIN Staff_DriverData dri
                       ON bas.StaffID = dri.StaffID
                     JOIN Staff_Contracts con
                       ON bas.StaffID = con.StaffID
                     JOIN Races_DriverStandings sta
                       ON dri.StaffID = sta.DriverID
                     WHERE con.ContractType = 0
                       AND con.PosInTeam    <= 2
                       AND con.EndSeason     = ?
                       AND sta.Position     <= 10
                       AND sta.RaceFormula   = 1
                       AND sta.SeasonID      = ?
                       AND NOT EXISTS (
                           SELECT 1
                           FROM Staff_Contracts c3
                           JOIN Staff_DriverData d3
                             ON d3.StaffID = c3.StaffID
                           WHERE c3.TeamID      = con.TeamID
                             AND c3.PosInTeam   = con.PosInTeam
                             AND c3.ContractType = 3
                       );`, [season, season],
                    'allRows'
                );

                if (top10DriversExpiringContracts.length) {
                    let picked = randomPick(top10DriversExpiringContracts);
                    //if picked is already used try to pick another one up to 5 times
                    let attempts = 0;
                    while (usedDriverIdsGlobal.has(picked[2]) && attempts < 5) {
                        picked = randomPick(top10DriversExpiringContracts);
                        attempts++;
                    }
                    if (usedDriverIdsGlobal.has(picked[2])) {
                        picked = randomPick(drivers)
                    }


                    const [nameFormatted, driverId] = formatNamesSimple(picked);
                    randomDriver = {
                        name: nameFormatted,
                        driverId: driverId,
                        teamId: picked[3]
                    };
                    usedDriverIdsGlobal.add(randomDriver.driverId);
                    randomTeamId = picked[3];
                }
            }

            if (randomDriver) {
                usedDriverIdsGlobal.add(randomDriver.driverId);

                const nameFormatted = randomDriver.name;
                const driverId = randomDriver.driverId;

                const newData = {
                    drivers: [{
                        name: news_insert_space(nameFormatted),
                        driverId,
                        team: combined_dict[randomTeamId],
                        teamId: randomTeamId,
                        previouslyDrivenTeams: getPreviouslyDrivenTeams(driverId),
                    }],
                };

                const titleData = {
                    driver1: news_insert_space(nameFormatted),
                    team1: combined_dict[randomTeamId],
                };

                const title = generateTitle(titleData, 7);
                const image = getImagePath(randomTeamId, driverId, "transfer");

                newsList.push({
                    id: entryId,
                    type: "fake_transfer",
                    title,
                    date: excelDate,
                    image: image,
                    overlay: null,
                    data: newData,
                    text: null
                });
            }
        }
    });

    return newsList;
}


const randomPick = arr => arr[Math.floor(Math.random() * arr.length)];

export function generateBigConfirmedTransferNews(savedNews = {}, currentMonth) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const season = daySeason[1];
    const month = currentMonth > 9 ? 9 : currentMonth;

    const drivers = queryDB(
        `SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID
             FROM Staff_BasicData bas
             JOIN Staff_DriverData dri
               ON bas.StaffID = dri.StaffID
             JOIN Staff_Contracts con
               ON bas.StaffID = con.StaffID
             WHERE con.ContractType = 0
               AND con.PosInTeam <= 2`, [],
        'allRows'
    );

    const driversWithHighOverall = [];
    drivers.forEach(d => {
        const overall = getDriverOverall(d[2]);
        const name = formatNamesSimple(d);
        const teamId = d[3];
        const teamName = combined_dict[teamId] || "Unknown Team";
        let driver = {
            name: name[0],
            driverId: name[1],
            team: teamName,
            teamId: teamId,
            overall: overall
        };
        if (overall >= 88) {
            driversWithHighOverall.push(driver);
        }
    });

    let newsList = [];

    //iterate through each list
    driversWithHighOverall.forEach(driver => {
        const contract = queryDB(`SELECT TeamID, Salary, EndSeason FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 3 AND TeamID != ?`, [driver.driverId, driver.teamId], 'singleRow');
        if (!contract) return;
        const futureTeamId = contract[0]


        let titleData = {
            driver1: driver.name,
            driverId: driver.driverId,
            team1: driver.team,
            team2Id: futureTeamId,
            salary: contract[1],
            endSeason: contract[2],
            previouslyDrivenTeams: getPreviouslyDrivenTeams(driver.driverId),
            team2: combined_dict[futureTeamId],
            season_year: season
        }

        if (driver.overall < 90) {
            const entryId = `new_big_transfer_${driver.driverId}`;
            if (savedNews[entryId]) {
                newsList.push({ id: entryId, ...savedNews[entryId] });
                return;
            }

            const title = generateTitle(titleData, 6);
            const image = getImagePath(futureTeamId, driver.driverId, "transfer");
            const day = Math.floor(Math.random() * 30) + 1;
            const date = new Date(season, month - 1, day);
            const excelDate = dateToExcel(date);

            titleData.date = excelDate;

            newsList.push({
                id: entryId,
                type: "big_transfer",
                title,
                date: excelDate,
                image,
                overlay: null,
                data: titleData,
                text: null
            });
        }
        else {
            const entryId1 = `massive_exit_${driver.driverId}`;
            if (savedNews[entryId1]) {
                newsList.push({ id: entryId1, ...savedNews[entryId1] });
            }

            const title1 = generateTitle(titleData, 17);
            const image1 = getImagePath(driver.teamId, driver.driverId, "transfer");
            const day1 = Math.floor(Math.random() * 30) + 1;
            const date1 = new Date(season, month - 1, day1);

            const excelDate1 = dateToExcel(date1);
            titleData.date = excelDate1;
            titleData.team2Id = driver.teamId;
            newsList.push({
                id: entryId1,
                type: "massive_exit",
                title: title1,
                date: excelDate1,
                image: image1,
                overlay: null,
                data: titleData,
                text: null
            });

            const entryId2 = `massive_signing_${driver.driverId}`;
            if (savedNews[entryId2]) {
                newsList.push({ id: entryId2, ...savedNews[entryId2] });
                return;
            }

            const title2 = generateTitle(titleData, 18);
            const image2 = getImagePath(futureTeamId, driver.driverId, "transfer");
            const excelDate2 = excelDate1 + 1;
            titleData.date = excelDate2;
            titleData.team2Id = futureTeamId;
            newsList.push({
                id: entryId2,
                type: "massive_signing",
                title: title2,
                date: excelDate2,
                image: image2,
                overlay: null,
                data: titleData,
                text: null
            });
        }
    });


    return newsList;
}

function generateNextSeasonGridNews(savedNews = {}, currentMonth) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const season = daySeason[1];
    const newsList = [];
    const allRacesDone = queryDB(
        `SELECT COUNT(*) FROM Races WHERE SeasonID = ? AND State = 2`, [season],
        'singleValue'
    );
    const totalRaces = queryDB(
        `SELECT COUNT(*) FROM Races WHERE SeasonID = ?`, [season],
        'singleValue'
    );
    //if we are not in the last month or not all races done, return empty list
    if (currentMonth < 11 || allRacesDone < totalRaces) {
        return newsList;
    }
    const entryId = `next_season_grid`;

    if (savedNews[entryId]) {
        return [{ id: entryId, ...savedNews[entryId] }];
    }

    const globals = getGlobals();
    let teamIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    if (globals.isCreateATeam) {
        teamIds.push(32);
    }
    let teamsDict = {};
    teamIds.forEach(teamId => {
        const teamName = combined_dict[teamId] || "Unknown Team";
        let teamInfo = {
            "name": teamName,
            "teamId": teamId,
            "driversNextSeason": [],
            "driversThisSeason": []
        }
        const driversThisSeason = queryDB(
            `SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID, con.ContractType
                FROM Staff_BasicData bas
                JOIN Staff_DriverData dri
                  ON bas.StaffID = dri.StaffID
                JOIN Staff_Contracts con
                    ON bas.StaffID = con.StaffID
                WHERE con.TeamID = ?
                  AND con.PosInTeam <= 2
                  AND con.ContractType = 0
                  AND EndSeason >= ?`, [teamId, season],
            'allRows'
        );
        const driversNextSeason = queryDB(
            `SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID, con.ContractType
                FROM Staff_BasicData bas
                JOIN Staff_DriverData dri
                  ON bas.StaffID = dri.StaffID
                JOIN Staff_Contracts con
                    ON bas.StaffID = con.StaffID
                WHERE con.TeamID = ?
                  AND con.PosInTeam <= 2
                  AND con.ContractType IN (0,3)
                  AND EndSeason > ?`, [teamId, season],
            'allRows'
        );
        driversNextSeason.forEach(d => {
            const name = formatNamesSimple(d);
            const contractType = d[4];
            let driverInfo = {
                "name": news_insert_space(name[0]),
                "driverId": name[1],
                "isForNextSeason": contractType === 3
            }
            teamInfo.driversNextSeason.push(driverInfo);
        });
        driversThisSeason.forEach(d => {
            const name = formatNamesSimple(d);
            let driverInfo = {
                "name": news_insert_space(name[0]),
                "driverId": name[1]
            }
            teamInfo.driversThisSeason.push(driverInfo);
        });
        teamsDict[teamId] = teamInfo;
    });

    const title = generateTitle({ season_year: season + 1 }, 19);
    const image = getImagePath(null, null, "grid");
    const newsDate = new Date(season, 11, 15);
    const excelDate = dateToExcel(newsDate);

    newsList.push({
        id: entryId,
        type: "next_season_grid",
        title,
        date: excelDate,
        image,
        overlay: "next-season-grid",
        data: {
            season_year: season + 1,
            teams: teamsDict
        },
        text: null
    });

    return newsList;

}

export function generateContractRenewalsNews(savedNews = {}, contractRenewals = [], currentMonth) {
    const renewalMonths = [8, 9, 10].filter(m => m < currentMonth);
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const season = daySeason[1];


    const used = new Set(
        Object.values(savedNews)
            .filter(n => n?.type === "contract_renewal" && n?.data?.driverId != null)
            .map(n => n.data.driverId)
    );

    const newsList = [];
    //iterate through months done of renewalMonths
    for (const m of renewalMonths) {
        const entryId = `contract_renewal_${m}`;

        if (savedNews[entryId]) {
            newsList.push({ id: entryId, ...savedNews[entryId] });
            const dId = savedNews[entryId]?.data?.driverId;
            if (dId != null) used.add(dId);
            continue;
        }

        const pool = contractRenewals.filter(c => !used.has(c.driverId));
        if (!pool.length) continue;

        const contract = randomPick(pool);
        used.add(contract.driverId);

        const title = generateTitle(contract, 10);
        const image = getImagePath(contract.team1Id, contract.driverId, "transfer");

        // Generate a date from the current month
        const newsDate = new Date(season, m - 1, Math.floor(Math.random() * 28) + 1);
        const excelDate = dateToExcel(newsDate);

        newsList.push({
            id: entryId,
            type: "contract_renewal",
            title,
            date: excelDate,
            image,
            overlay: null,
            data: contract,
            text: null
        });
    }

    return newsList;

}

export function getContractExtensions() {
    const daySeason = queryDB(
        `SELECT Day, CurrentSeason FROM Player_State`, [],
        'singleRow'
    )
    const seasonYear = daySeason[1]

    let contractRenewals = queryDB(
        `
        SELECT 
        bas.FirstName,
        bas.LastName,
        con3.StaffID,
        con3.TeamID,
        con3.EndSeason,
        con3.Salary
        FROM Staff_Contracts con3
        JOIN Staff_DriverData dri ON con3.StaffID = dri.StaffID
        JOIN Staff_BasicData bas  ON con3.StaffID = bas.StaffID
        WHERE con3.ContractType = 3
        AND con3.PosInTeam <= 2
        AND EXISTS (
            SELECT 1
            FROM Staff_Contracts con0
            WHERE con0.StaffID = con3.StaffID
                AND con0.TeamID  = con3.TeamID
                AND con0.ContractType = 0
                AND con0.PosInTeam <= 2
        );
        `
        , [], 'allRows')

    // contractRenewals.forEach(contract => {
    //     let driverID = contract[2];
    //     const driverOverall = getDriverOverall(driverID);

    //     if (driverOverall < 88) {
    //         contractRenewals = contractRenewals.filter(c => c[2] !== driverID);
    //     }
    // });


    const formattedContracts = contractRenewals.map(contract => {
        const [nameFormatted, driverId, teamId] = formatNamesSimple(contract);
        const currentTeam = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0`, [driverId], 'singleValue');
        return {
            driver1: nameFormatted,
            driverId: driverId,
            team1: combined_dict[teamId],
            team2: combined_dict[currentTeam],
            team1Id: teamId,
            team2Id: currentTeam,
            previouslyDrivenTeams: getPreviouslyDrivenTeams(driverId),
            endSeason: contract[4],
            salary: contract[5]
        };
    });


    return formattedContracts;
}



export function getTrueTransferRumors() {
    const daySeason = queryDB(
        `SELECT Day, CurrentSeason FROM Player_State`, [],
        'singleRow'
    )
    const seasonYear = daySeason[1]

    const top5rows = queryDB(
        `SELECT DriverID 
     FROM Races_DriverStandings 
     WHERE RaceFormula = 1 
       AND SeasonID = ? 
     ORDER BY Position 
     LIMIT 5`, [seasonYear],
        'allRows'
    )
    const top5DriverIDs = top5rows.map(r => r[0])

    const sql = `
    SELECT 
        bas.FirstName, 
        bas.LastName, 
        dri.StaffID,
        ofe.TeamID as PotentialTeam,
        ofe.ContractState,
        ofe.PosInTeam,
        enu.Name as State,
        ofe.OfferDay,
        ofe.Salary,
        ofe.SalaryOpinion,
        ofe.EndSeason,
        ofe.LengthOpinion,
        ofe.ExpirationDay,
        con.TeamID
    FROM Staff_BasicData bas
    RIGHT JOIN Staff_DriverData dri
        ON bas.StaffID = dri.StaffID
    JOIN Staff_ContractOffers ofe
        ON bas.StaffID = ofe.StaffID
    JOIN Staff_Enum_ContractState enu
        ON ofe.ContractState = enu.Value
    JOIN Staff_Contracts con
        ON bas.StaffID = con.StaffID
    WHERE con.ContractType = 0
    AND ofe.PosInTeam <= 2
    `

    const rows = queryDB(sql, [], 'allRows')
        .filter(r => {
            const date = excelToDate(r[7])
            return date.getFullYear() === seasonYear
        })

    const formatted = rows.map(r => {
        const [nameFormatted, driverId] = formatNamesSimple(r)
        let actualTeam = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0`, [r[2]], 'singleValue')
        actualTeam = combined_dict[actualTeam]
        let driverAtRisk = queryDB(`SELECT bas.FirstName, bas.LastName, con.StaffID, con.TeamID FROM Staff_Contracts con JOIN Staff_BasicData bas ON bas.StaffID = con.StaffID RIGHT JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID WHERE con.TeamID = ? AND con.PosInTeam = ? AND con.ContractType = 0`, [r[3], r[5]], 'singleRow')
        //if driverAtRisk[2] is th same as r[2] then remove it
        if (driverAtRisk[2] === r[2]) return null
        driverAtRisk = formatNamesSimple(driverAtRisk)
        const driverAtRiskName = news_insert_space(driverAtRisk[0])
        return {
            name: news_insert_space(nameFormatted),
            driverId,
            actualTeam,
            actualTeamId: r[13],
            potentialTeam: combined_dict[r[3]],
            state: r[6],
            offerDay: excelToDate(r[7]),
            expirationDate: excelToDate(r[12]),
            posInTeam: r[5],
            driverAtRisk: driverAtRiskName,
            salary: r[8],
            salaryOpinion: opinionDict[r[9]],
            endSeason: r[10],
            lengthOpinion: opinionDict[r[11]],
            overall: getDriverOverall(driverId),
        }
    }).filter(r => r !== null);


    const seen = new Set()
    const uniqueFormatted = formatted.filter(item => {
        const key = JSON.stringify(item)
        if (seen.has(key)) {
            return false
        } else {
            seen.add(key)
            return true
        }
    })

    const tier1OrTop5 = []
    const others = []

    for (const rumor of uniqueFormatted) {
        const [tier] = getTier(rumor.driverId)
        const isTop5 = top5DriverIDs.includes(rumor.driverId)

        if (tier === 1 || isTop5) {
            tier1OrTop5.push(rumor)
        } else {
            others.push(rumor)
        }
    }


    return {
        tier1OrTop5,
        others
    }
}

export function getConfirmedTransfers(bestDrivers = false) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const day = daySeason[0];
    const seasonYear = daySeason[1];

    let futureContracts = queryDB(
        `SELECT DISTINCT
        bas.FirstName,
        bas.LastName,
        con3.StaffID,
        con3.TeamID,
        con3.EndSeason,
        con3.Salary
        FROM Staff_Contracts con3
        JOIN Staff_DriverData  dri ON con3.StaffID = dri.StaffID
        JOIN Staff_BasicData   bas ON con3.StaffID = bas.StaffID
        WHERE con3.ContractType = 3
        AND con3.PosInTeam <= 2
        AND EXISTS (
            SELECT 1
            FROM Staff_Contracts con0
            WHERE con0.StaffID = con3.StaffID
                AND con0.ContractType = 0
                AND con0.PosInTeam <= 2
                AND con0.TeamID <> con3.TeamID   -- equipos distintos
                -- Opcional: filtros por temporada si aplica, por ejemplo:
                -- AND con0.EndSeason = con3.EndSeason
        );`
        , [], 'allRows')

    if (bestDrivers) {
        futureContracts.forEach(contract => {
            let driverID = contract[2];
            const driverOverall = getDriverOverall(driverID);

            if (driverOverall < 88) {
                futureContracts = futureContracts.filter(c => c[2] !== driverID);
            }
        });
    }

    const formattedContracts = futureContracts.map(contract => {
        const [nameFormatted, driverId, teamId] = formatNamesSimple(contract);
        const currentTeam = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE StaffID = ? AND ContractType = 0`, [driverId], 'singleValue');
        return {
            driver1: nameFormatted,
            driverId: driverId,
            team1: combined_dict[teamId],
            team2: combined_dict[currentTeam],
            team1Id: teamId,
            team2Id: currentTeam,
            previouslyDrivenTeams: getPreviouslyDrivenTeams(driverId),
            endSeason: contract[4],
            salary: contract[5]
        };
    });


    return formattedContracts;
}

export function generateTransferRumorsNews(offers, savedNews) {
    if (!offers) return null;
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const day = daySeason[0];
    const seasonYear = daySeason[1];
    let newsList = [];

    const realDay = excelToDate(day);

    if (realDay.getMonth() + 1 < 8 || (realDay.getMonth() + 1 === 8 && realDay.getDate() < 10)) {
        return null;
    }

    const date = dateToExcel(new Date(seasonYear, 7, 10));

    const validOffers = offers.others.filter(item => item.state !== 'Signed');

    const driversDict = validOffers.reduce((acc, item) => {
        const previousResultsTeam = queryDB(`SELECT SeasonID, Points, Position FROM Races_TeamStandings WHERE TeamID = ?`, [item.actualTeamId], 'allRows')
            .map(r => {
                return {
                    season: r[0],
                    points: r[1],
                    position: r[2]
                }
            });
        const {
            driverId,
            name,
            overall,
            actualTeam,
            teamId,
            previouslyDrivenTeams,
            ...offerDetails
        } = item;

        if (!acc[driverId]) {
            acc[driverId] = {
                driverId,
                name,
                overall,
                actualTeam,
                teamId: item.actualTeamId,
                previouslyDrivenTeams: getPreviouslyDrivenTeams(driverId),
                previousResultsTeam: previousResultsTeam,
                offers: []
            };
        }

        acc[driverId].offers.push(offerDetails);
        return acc;
    }, {});

    const top3Drivers = Object
        .values(driversDict)
        .filter(driver => driver.offers.length > 0)
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 3);


    // Si no hay suficientes pilotos, no generamos la noticia
    if (top3Drivers.length < 3) {
        return null;
    }

    let titleData = {
        driver1: top3Drivers[0].name,
        driver2: top3Drivers[1].name,
        driver3: top3Drivers[2].name,
        team1: top3Drivers[0]["offers"][0].potentialTeam,
        team2: top3Drivers[1]["offers"][0].potentialTeam,
        team3: top3Drivers[2]["offers"][0].potentialTeam,
    }

    const title = generateTitle(titleData, 4);

    const sillySeasonRumorsId = `silly_season_${seasonYear}`;

    if (savedNews[sillySeasonRumorsId]) {
        newsList.push({ id: sillySeasonRumorsId, ...savedNews[sillySeasonRumorsId] });
        return newsList;
    }

    const driversArray = Object.values(driversDict);

    const image = getImagePath(top3Drivers[0].teamId, top3Drivers[0].driverId, "transfer_generic");

    const sillySeasonNew = {
        id: sillySeasonRumorsId,
        type: "silly_season_rumors",
        title: title,
        date: date,
        season: seasonYear,
        image: image,
        overlay: null,
        data: { drivers: driversArray },
        text: null
    };


    newsList.push(sillySeasonNew);

    return newsList

}

export function generateTeamsUpgradesNews(events, savednews) {
    //aparcado de momento
    const globals = getGlobals();
    let teamIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    if (globals.isCreateATeam) {
        teamIds.push(32);
    }

    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const seasonYear = daySeason[1];
    const parts = getAllPartsFromTeam(32);


    events.forEach(raceId => {
        const entryId = `${seasonYear}_upgrades_${raceId}`;

        if (savednews[entryId]) {
            newsList.push({ id: entryId, ...savednews[entryId] });
            return;
        }

        let nextRaceId = raceId + 1;
        let trackIdNextRace = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ?`, [nextRaceId], 'singleValue');
        let newParts = {};
        teamIds.forEach(teamId => {
            let teamName = combined_dict[teamId];
            newParts[teamId] = [];
            let parts = getAllPartsFromTeam(teamId);
            //iterate through the parts dictionary
            for (const part in parts) {
                let partsArray = parts[part]
                partsArray.forEach(partDetails => {
                    let trackDebutForPart = partDetails[3];
                    if (trackDebutForPart === trackIdNextRace) {
                        newParts[teamId].push(part);
                        return;
                    }
                });
            }
        });

    });
}

export function generateComparisonNews(comparisonMonths, savedNews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const season = daySeason[1];
    const currentDate = excelToDate(daySeason[0]);
    const currentMonth = currentDate.getMonth() + 1;

    let newsList = [];
    comparisonMonths.forEach(month => {
        if (month >= currentMonth) return; //only past months

        const randomDay1 = Math.floor(Math.random() * 31) + 1;

        const date = new Date(season, month - 1, randomDay1);
        const excelDate = dateToExcel(date);


        if (month % 2 !== 0) {
            let shifts = calculateTeamDropsByDate(season, date);
            //order by shift.drop
            shifts.sort((a, b) => a.drop - b.drop);
            const top3 = shifts.slice(0, 3);
            const bottom3 = shifts.slice(-3);

            //put together in the same array
            const combined = [...top3, ...bottom3];
            const teamToTalk = randomPick(combined);

            //create the new
            const entryId = `team_comparison_${season}_${month}`;

            if (savedNews[entryId]) {
                newsList.push({ id: entryId, ...savedNews[entryId] });
                return;
            }

            let newTypeId, compType;
            if (teamToTalk.drop > 0) {
                newTypeId = 11;
                compType = "bad"
            }
            else {
                newTypeId = 12;
                compType = "good";
            }

            const title = generateTitle({ teamId: combined_dict[teamToTalk.teamId], season }, newTypeId);
            const image = getImagePath(teamToTalk.teamId, teamToTalk.teamId, "teamComparison");

            const newsEntry = {
                id: entryId,
                type: "team_comparison",
                title: title,
                date: excelDate,
                image: image,
                overlay: null,
                data: {
                    team: teamToTalk,
                    season: season,
                    compType: compType
                },
                text: null
            };
            newsList.push(newsEntry);
        }
        else {
            const isCreateATeam = getGlobals().isCreateATeam;
            const teams = isCreateATeam ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 32] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const teamId = randomPick(teams);
            const teamName = combined_dict[teamId];

            const entryId = `driver_comparison_${season}_${month}`;

            if (savedNews[entryId]) {
                newsList.push({ id: entryId, ...savedNews[entryId] });
                return;
            }

            const drivers = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID FROM Staff_BasicData bas
                    JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID 
                    JOIN Staff_Contracts con ON bas.StaffID = con.StaffID
                    JOIN Races_DriverStandings sta ON dri.StaffID = sta.DriverID
                    WHERE sta.SeasonID = ? AND sta.RaceFormula = 1
                    AND con.TeamID = ? AND con.ContractType = 0 AND con.PosInTeam <= 2
                    ORDER BY sta.Position`, [season, teamId], 'allRows');
            if (drivers.length < 2) return;

            const formattedDrivers = drivers.map(driver => {
                const [nameFormatted, driverId] = formatNamesSimple(driver);
                return {
                    name: news_insert_space(nameFormatted),
                    driverId
                }
            });

            //for each driver, select randomlky if taking his entire name or only last name
            formattedDrivers.forEach(driver => {
                if (Math.random() < 0.5) {
                    const parts = driver.name.split(' ');
                    driver.name = parts[parts.length - 1]; //last name only
                }
            });


            let data = {
                team: teamName,
                driver1: formattedDrivers[0].name,
                driver2: formattedDrivers[1].name,
            }

            const title = generateTitle(data, 13);
            // const image = getImagePath(teamId, teamId, "driverComparison");
            const overlay = "driver-comparison-overlay";


            const newsEntry = {
                id: entryId,
                type: "driver_comparison",
                title: title,
                date: excelDate,
                image: null,
                overlay: overlay,
                data: {
                    teamId,
                    teamName,
                    drivers: formattedDrivers,
                    season
                },
                text: null
            };
            newsList.push(newsEntry);

        }


    });

    return newsList;
}

export function generateRaceResultsNews(events, savednews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const seasonYear = daySeason[1];
    let newsList = [];

    events.forEach(raceId => {
        const entryId = `${seasonYear}_race_${raceId}`;

        if (savednews[entryId]) {
            newsList.push({ id: entryId, ...savednews[entryId] });
            return;
        }

        const results = getOneRaceResults(raceId);

        const formatted = results.map(row => {
            const [nameFormatted, driverId, teamId] = formatNamesSimple(row);
            return {
                name: news_insert_space(nameFormatted),
                driverId,
                teamId,
                pos: row[4]
            };
        });

        const podium = formatted.filter(r => r.pos <= 3);

        const winnerEntry = podium.find(r => r.pos === 1);
        const winnerName = winnerEntry ? winnerEntry.name : "Unknown";

        let data = {
            raceId,
            seasonYear,
            winnerName: winnerName,
        }

        const title = generateTitle(data, 2);

        const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ?`, [raceId], 'singleRow');
        const code = races_names[parseInt(trackId)];

        const image = getImagePath(formatted[0].teamId, code, "raceQuali");

        const overlay = "race-overlay"

        const newsData = {
            first: formatted[0].name,
            second: formatted[1].name,
            third: formatted[2].name,
            firstTeam: formatted[0].teamId,
            secondTeam: formatted[1].teamId,
            thirdTeam: formatted[2].teamId,
            trackId: trackId,
            seasonYear: seasonYear,
        }

        const date = queryDB(`SELECT Day FROM Races WHERE RaceID = ?`, [raceId], 'singleValue');

        const newsEntry = {
            id: entryId,
            type: "race_result",
            title: title,
            date: date,
            image: image,
            overlay: overlay,
            data: newsData,
            text: null
        };
        newsList.push(newsEntry);

    });

    return newsList;
}

export function generateRaceReactionsNews(events, savednews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const seasonYear = daySeason[1];
    let newsList = [];

    events.forEach(raceId => {
        const entryId = `${seasonYear}_race_reaction_${raceId}`;

        if (savednews[entryId]) {
            newsList.push({ id: entryId, ...savednews[entryId] });
            return;
        }

        // //30% chance of not generating
        // if (Math.random() < 0.3) {
        //     return;
        // }

        const results = getOneRaceResults(raceId);

        const formatted = results.map(row => {
            const [nameFormatted, driverId, teamId] = formatNamesSimple(row);
            return {
                name: news_insert_space(nameFormatted),
                driverId,
                teamId,
                teamName: combined_dict[teamId],
                pos: row[4],
                rating: getDriverOverall(driverId)
            };
        });

        const unhappyDrivers = formatted.filter(r => r.rating >= 88 && r.pos > 6);
        if (unhappyDrivers.length === 0) {
            //get the lowest 88 or more overall driver
            const sortedByOverall = formatted.filter(r => r.rating >= 88).sort((a, b) => b.rating - a.rating);
            if (sortedByOverall.length > 0) {
                unhappyDrivers.push(sortedByOverall[sortedByOverall.length - 1]);
            }
        }
        if (unhappyDrivers.length === 0) {
            //ge tthe driver with 86 or more rating in the lowest position
            const sortedByOverall = formatted.filter(r => r.rating >= 86).sort((a, b) => b.rating - a.rating);
            if (sortedByOverall.length > 0) {
                unhappyDrivers.push(sortedByOverall[sortedByOverall.length - 1]);
            }
        }
        //if sitll no unhappyDrivers, get the last one
        if (unhappyDrivers.length === 0) {
            unhappyDrivers.push(formatted[formatted.length - 1]);
        }

        const randomUnHappyDriver = randomPick(unhappyDrivers);


        //get all drivers who finished in the top 4
        const happyDrivers = formatted.filter(r => r.pos <= 4);
        const randomHappyDriver = randomPick(happyDrivers);

        const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ?`, [raceId], 'singleRow');
        const code = races_names[parseInt(trackId)];

        let titleData = {
            raceId,
            allHappyDrivers: happyDrivers,
            allUnhappyDrivers: unhappyDrivers,
            randomHappyDriver,
            happyTeam: randomHappyDriver.teamName,
            unhappyTeam: randomUnHappyDriver.teamName,
            randomUnHappyDriver,
            seasonYear,
            trackId: trackId,
        }

        const title = generateTitle(titleData, 16);

        const image = getImagePath(randomHappyDriver.teamId, code, "reaction");

        const date = queryDB(`SELECT Day FROM Races WHERE RaceID = ?`, [raceId], 'singleValue');

        const newsEntry = {
            id: entryId,
            type: "race_reaction",
            title: title,
            date: date + 1,
            image: image,
            overlay: null,
            data: titleData,
            text: null
        };
        newsList.push(newsEntry);

    });

    return newsList;
}

export function generateQualifyingResultsNews(events, savednews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const seasonYear = daySeason[1];
    let newsList = [];

    events.forEach(raceId => {
        const entryId = `${seasonYear}_quali_${raceId}`;

        if (savednews[entryId]) {
            newsList.push({ id: entryId, ...savednews[entryId] });
            return;
        }

        const results = getOneQualifyingResults(raceId);

        const formatted = results.map(row => {
            const [nameFormatted, driverId, teamId] = formatNamesSimple(row);
            return {
                name: news_insert_space(nameFormatted),
                driverId,
                teamId,
                pos: row[4],
                fastestLap: row[5]
            };
        });

        const podium = formatted.filter(r => r.pos <= 3);

        const winnerEntry = podium.find(r => r.pos === 1);
        const poleDriver = winnerEntry ? winnerEntry.name : "Unknown";

        let data = {
            raceId,
            seasonYear,
            pole_driver: poleDriver,
        }

        const title = generateTitle(data, 1);

        const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ?`, [raceId], 'singleRow');
        const code = races_names[parseInt(trackId)];

        const image = getImagePath(formatted[0].teamId, `${code}_car`, "raceQuali");

        const overlay = "quali-overlay"

        const newsData = {
            first: formatted[0].name,
            second: formatted[1].name,
            third: formatted[2].name,
            firstTeam: formatted[0].teamId,
            secondTeam: formatted[1].teamId,
            thirdTeam: formatted[2].teamId,
            trackId: trackId,
            seasonYear: seasonYear,
        }

        const date = queryDB(`SELECT Day FROM Races WHERE RaceID = ?`, [raceId], 'singleValue') - 1;

        const newsEntry = {
            id: entryId,
            type: "quali_result",
            title: title,
            date: date,
            image: image,
            overlay: overlay,
            data: newsData,
            text: null
        };
        newsList.push(newsEntry);

    });

    return newsList;
}

export function generateSeasonReviewNews(savedNews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const nRaces = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ?`, [daySeason[1]], 'singleValue');
    let racesInterval = nRaces / 3;
    const racesCompleted = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ? AND State = 2`, [daySeason[1]], 'singleValue');
    let newsList = [];
    const firstRaceSeasonId = queryDB(`SELECT MIN(RaceID) FROM Races WHERE SeasonID = ?`, [daySeason[1]], 'singleValue');
    const seasonResults = fetchSeasonResults(daySeason[1]);


    let reviewPoints = [];
    if (racesCompleted >= racesInterval) {
        reviewPoints.push({ part: 1, totalParts: 3 });
    }
    if (racesCompleted >= racesInterval * 2) {
        reviewPoints.push({ part: 2, totalParts: 3 });
    }
    if (racesCompleted >= nRaces) {
        reviewPoints.push({ part: 3, totalParts: 3 });
    }

    reviewPoints.forEach(review => {
        const entryId = `season_review_${daySeason[1]}_${review.part}`;

        if (savedNews[entryId]) {
            newsList.push({ id: entryId, ...savedNews[entryId] });
            return;
        }

        const raceIdInPoint = firstRaceSeasonId + Math.floor(racesInterval * review.part) - 1;
        const nextRace = raceIdInPoint + 1;

        const dates = queryDB(`SELECT Day FROM Races WHERE RaceID IN (?, ?)`, [raceIdInPoint, nextRace], 'allRows');
        //pick a random date between those two dates
        let date;
        if (dates.length === 2) {
            const day1 = dates[0][0] + 1;
            const day2 = dates[1][0] - 1;
            date = Math.floor(Math.random() * (day2 - day1 + 1)) + day1;
        }

        if (review.part === 3 || !date) {
            date = dateToExcel(new Date(daySeason[1], 11, 10));
        }

        const excelDate = date

        const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, raceIdInPoint);
        const firstDriver = driverStandings[0];
        const firstTeam = teamStandings[0];
        const secondDriver = driverStandings[1];
        const secondTeam = teamStandings[1];
        const thirdDriver = driverStandings[2];
        const thirdTeam = teamStandings[2];

        let data = {
            season: daySeason[1],
            part: review.part,
            driver1: firstDriver.name,
            driver2: secondDriver.name,
        }

        let titleId;
        if (review.part === 3) titleId = 15;
        else titleId = 14;
        const title = generateTitle(data, titleId);
        const image = getImagePath(firstTeam ? firstTeam.id : 1, firstDriver ? firstDriver.id : 1, "season_review");

        let newsData = {
            season: daySeason[1],
            part: review.part,
            firstDriver,
            secondDriver,
            firstTeam,
            secondTeam
        }

        newsList.push({
            id: entryId,
            type: "season_review",
            title: title,
            date: excelDate,
            image: image,
            overlay: null,
            data: newsData,
            text: null
        });
    });

    return newsList;
}

export function news_insert_space(str) {
    return str
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/\s+/g, ' ');
}

export function getOneQualiDetails(raceId) {
    const results = getOneQualifyingResults(raceId);
    if (!results.length) return {};

    const season = queryDB(`SELECT SeasonID FROM Races WHERE RaceID = ?`, [raceId], 'singleRow');

    const seasonResults = fetchQualiResults(season);
    const seasonRaceResults = fetchSeasonResults(season, true); //to get standings

    const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, raceId - 1, true, true, true); //get championship standings before that race
    const { driverStandings: raceDriverStandings, teamStandings: raceTeamStandings, driversResults: driverRaceResults, racesNames: raceRacesNames } = rebuildStandingsUntil(seasonRaceResults, raceId - 1, true, true, false);


    // 1) Obtenemos time y laps del ganador (primera fila)
    const poleTime = results[0][5]; // índice 5 = res.FastestLap

    const poleDetails = results.map(row => {
        const [nameFormatted, driverId, teamId] = formatNamesSimple(row);
        const time = row[5];

        const gapToPole = time - poleTime;

        return {
            name: news_insert_space(nameFormatted),
            driverId,
            teamId,
            pos: row[4],
            gapToPole
        };
    });

    const champions = getLatestChampions(season);

    const numberOfRaces = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ?`, [season], 'singleRow')[0];

    const drivers = seasonResults.map(r => ({
        id: r.driverId,
        name: r.driverName ?? ""
    }));
    const enrichedAllTime = enrichDriversWithHistory(drivers);

    return {
        details: poleDetails,
        driverStandings,
        teamStandings,
        driverQualiResults: driversResults,
        racesNames,
        champions,
        nRaces: numberOfRaces,
        enrichedAllTime,
        driversResults: driverRaceResults
    }
}

export function getOneRaceDetails(raceId) {
    const results = getOneRaceResults(raceId);
    if (!results.length) return {};

    const sprintResults = getOneRaceResults(raceId, true);

    const season = queryDB(`SELECT SeasonID FROM Races WHERE RaceID = ?`, [raceId], 'singleRow');

    const seasonResults = fetchSeasonResults(season, true);
    const pointsSchema = fetchPointsRegulations();
    const maxPointsPerRace = pointsSchema.twoBiggestPoints[0]

    const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, raceId);

    const remainingRaces = queryDB(`SELECT RaceID, TrackID, WeekendType FROM Races WHERE SeasonID = ? AND RaceID > ? ORDER BY RaceID`, [season, raceId], 'allRows');
    //make an object that has raceid, trackId, and race track
    const remainingRacesDetails = remainingRaces.map(r => {
        return {
            raceId: r[0],
            trackId: r[1],
            sprint: r[2] === 1,
            trackName: countries_data[races_names[r[1]]].country
        }
    });


    // 1) Obtenemos time y laps del ganador (primera fila)
    const winnerTime = results[0][10]; // índice 10 = res.Time
    const winnerLaps = results[0][11]; // índice 11 = res.Laps

    const top3DoD = getDoDTopNForRace(season, raceId, 3);

    //for each of the top3, changen name for news_insert_space(name), and leave the rest the same
    const driverOfTheDayInfo = top3DoD.map((dod, index) => {
        const newName = news_insert_space(dod.name);
        return {
            name: newName,
            ...dod,
        };
    });

    const raceDetails = results.map(row => {
        const [nameFormatted, driverId, teamId] = formatNamesSimple(row);
        const time = row[10];
        const laps = row[11];

        const gapToWinner = time - winnerTime;
        const gapLaps = winnerLaps - laps;

        const base = {
            name: news_insert_space(nameFormatted),
            driverId,
            teamId,
            pos: row[4],
            grid: row[5],
            points: row[6],
            dnf: row[7],
            safetyCar: row[8],
            virtualSafetyCar: row[9],
            gapToWinner,
            gapLaps,
            overall: getDriverOverall(driverId),
            pointsGapToLeader: driverStandings.find(d => d.driverId === driverId)?.gapToLeader
        };

        return base;
    });

    let sprintDetails = [];

    if (sprintResults.length > 0) {
        const sprintWinnerTime = sprintResults[0][7];
        const sprintWinnerLaps = sprintResults[0][8];

        sprintDetails = sprintResults.map(row => {
            const [nameFormatted, driverId, teamId] = formatNamesSimple(row);
            const time = row[7];
            const laps = row[8];


            const gapToWinner = time - sprintWinnerTime;
            const gapLaps = sprintWinnerLaps - laps

            return {
                name: news_insert_space(nameFormatted),
                driverId,
                teamId,
                pos: row[4],
                points: row[5],
                dnf: row[6],
                gapToWinner,
                gapLaps,
            };
        });
    }

    const champions = getLatestChampions(season);

    const numberOfRaces = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ?`, [season], 'singleRow')[0];

    const drivers = seasonResults.map(r => ({
        id: r.driverId,
        name: r.driverName ?? ""
    }));
    const enrichedAllTime = enrichDriversWithHistory(drivers);

    return {
        details: raceDetails,
        driverStandings,
        teamStandings,
        driversResults,
        racesNames,
        champions,
        nRaces: numberOfRaces,
        sprintDetails,
        pointsSchema,
        remainingRaces: remainingRacesDetails,
        enrichedAllTime,
        driverOfTheDayInfo
    }
}


function getOneRaceResults(raceId, sprint = false) {
    const sql = `
    SELECT 
      bas.FirstName, 
      bas.LastName, 
      res.DriverID, 
      res.TeamID,
      res.FinishingPos,
      ${sprint ? "" : "res.StartingPos, "}
      ${sprint ? "res.ChampionshipPoints," : "res.Points, "}
      res.DNF,
      ${sprint ? "" : "res.SafetyCarDeployments, "}
      ${sprint ? "" : "res.VirtualSafetyCarDeployments, "}
      ${sprint ? "res.RaceTime," : "res.Time, "}
      ${sprint ? "res.LapCount" : "res.Laps"}
    FROM Staff_BasicData bas
    JOIN ${sprint ? "Races_SprintResults" : "Races_Results"} res 
      ON bas.StaffID = res.DriverID
    WHERE res.RaceID = ?
    ${sprint ? "AND res.RaceFormula = 1" : ""}
    ORDER BY res.FinishingPos
  `;
    const rows = queryDB(sql, [raceId], 'allRows');

    return rows;
}

function getOneQualifyingResults(raceId) {
    const sql = `
    SELECT 
        bas.FirstName, 
        bas.LastName, 
        res.DriverID,
        res.TeamID,
        res.FinishingPos,
        res.FastestLap
    FROM Staff_BasicData bas
    JOIN Races_QualifyingResults res
        ON bas.StaffID = res.DriverID
        WHERE res.RaceID = ?
        AND res.RaceFormula = 1
        AND res.QualifyingStage =
        (SELECT MAX(res2.QualifyingStage)
        FROM Races_QualifyingResults res2
        WHERE res2.RaceID = ? AND res2.DriverID = res.DriverID)
        AND SprintShootout = 0
        ORDER BY res.FinishingPos;
    `

    const rows = queryDB(sql, [raceId, raceId], 'allRows');

    return rows;
}

export function rebuildStandingsUntil(seasonResultsRaw, raceId, includeCurrentRacePrevResults = false, includeCurrentRacePoints = true, isQuali = false) {
    //includeCurrentRacePrevResults only limits previous reace results string, points are always summed up until raceId
    const seasonResults = (seasonResultsRaw || [])
        .map(d => (d?.data && typeof d.data === "object") ? d.data : d)
        .filter(d => d && typeof d.driverName === "string" && Array.isArray(d.races));

    const driverMap = {};
    const teamMap = {};
    let racesNames = [];
    const driversResults = [];
    let maxPoints = 0;

    seasonResults.forEach(driverRec => {
        const name = driverRec.driverName;
        let resultsString = "";
        let driverRaces = [];
        let nPodiums = 0;
        let nWins = 0;
        let nPointsFinishes = 0;

        const races = driverRec.races;

        // 2) Suma de puntos hasta raceId (incluye la actual; el detalle depende de includeCurrentRacePrevResults)
        const totalDriverPoints = races.reduce((sum, r) => {
            const thisRaceId = Number(r.raceId);
            if (thisRaceId <= raceId) {
                // if includeCurrentRacePrevResults is flase, don't add currentraceId to previous results string
                if (thisRaceId < raceId || includeCurrentRacePrevResults) {
                    driverRaces.push(getCircuitInfo(thisRaceId).country);
                    const fin = parseInt(r.finishingPos);
                    if (!isQuali) {
                        resultsString += (fin !== -1 ? `P${fin}` : "DNF") + ", ";
                    }
                    else {
                        resultsString += (r.qualifyingPos !== 99 ? `P${r.qualifyingPos}` : `P${r.startingPos}`) + ", ";
                    }
                    if (fin === 1) nWins++;
                    if (fin > 0 && fin <= 3) nPodiums++;
                    if ((parseInt(r.points) || 0) > 0) nPointsFinishes++;
                }
                // if includeCurrentRacePoints is true, sum points from current race
                if (thisRaceId < raceId || includeCurrentRacePoints) {
                    const pts = (Number(r.points) > 0) ? Number(r.points) : 0;
                    const sprintPts = (r.sprintPoints != null && Number(r.sprintPoints) !== -1) ? Number(r.sprintPoints) : 0;
                    return sum + pts + sprintPts;
                    maxPoints = Math.max(maxPoints, sum + pts + sprintPts);
                }
            }
            return sum;
        }, 0);

        // quita la coma y espacio final
        if (resultsString.endsWith(", ")) resultsString = resultsString.slice(0, -2);

        if (driverRaces.length > racesNames.length) {
            racesNames = driverRaces;
        }

        // 3) Clasificación de pilotos
        driverMap[name] = {
            name: news_insert_space(name),
            driverId: driverRec.driverId,
            points: totalDriverPoints,
            teamId: driverRec.latestTeamId,
            gapToLeader: 0,
        };

        driversResults.push({
            name: news_insert_space(name),
            resultsString,
            nPodiums,
            nWins,
            teamId: driverRec.latestTeamId,
            nPointsFinishes
        });

        // 4) Puntos por equipo por carrera
        races.forEach(r => {
            const thisRaceId = Number(r.raceId);
            if (thisRaceId <= raceId) {
                const teamId = Number(r.teamId); // <-- antes r[r.length-1]
                const pts = (Number(r.points) > 0) ? Number(r.points) : 0;
                const sprintPts = (r.sprintPoints != null && Number(r.sprintPoints) !== -1) ? Number(r.sprintPoints) : 0;
                teamMap[teamId] = (teamMap[teamId] || 0) + pts + sprintPts;
            }
        });
    });

    const driverStandings = Object.values(driverMap).sort((a, b) => b.points - a.points);
    //calcula gap to leader
    if (driverStandings.length > 0) {
        const leaderPoints = driverStandings[0].points;
        driverStandings.forEach(driver => {
            driver.gapToLeader = leaderPoints - driver.points;
        });
    }

    const teamStandings = Object.entries(teamMap)
        .map(([teamId, points]) => ({ teamId: Number(teamId), points }))
        .sort((a, b) => b.points - a.points);

    return { driverStandings, teamStandings, driversResults, racesNames };
}


function getLatestChampions(seasonId) {
    const sql = `
    SELECT 
      bas.FirstName, 
      bas.LastName, 
      sta.DriverID, 
      sta.Position,
      sta.SeasonID,
      sta.Points
    FROM Staff_BasicData bas
    JOIN Races_DriverStandings sta
        ON bas.StaffID = sta.DriverID
        WHERE sta.Position <= 3
        AND sta.RaceFormula = 1
        AND sta.SeasonID < ?
    `;
    const rows = queryDB(sql, [seasonId], 'allRows');

    let champions = rows.map(row => {
        const [nameFormatted, driverId] = formatNamesSimple(row);
        return {
            name: news_insert_space(nameFormatted),
            driverId,
            pos: row[3],
            season: row[4],
            points: row[5],
        };
    });

    //order champions by season descending and by position ascending
    champions.sort((a, b) => {
        if (a.season === b.season) {
            return a.pos - b.pos; // Ascending order by position
        }
        return b.season - a.season; // Descending order by season
    });

    return champions;

}

function getImagePath(teamId, code, type) {
    const maxImages = {
        'fe': 5, 'mc': 2, 'rb': 4, 'me': 4, 'al': 2, 'wi': 3,
        'ha': 2, 'at': 2, 'af': 2, 'as': 2, 'ct': 2, 'f2': 2, 'f3': 2
    };
    if (type === "raceQuali") {
        if (teamId === 32) {
            return `./assets/images/news/${code.toLowerCase()}.webp`;
        }

        // Decidir si usar el code o el teamId con 50% de probabilidad
        const useCode = Math.random() < 0.5;

        if (useCode) {
            return `./assets/images/news/${code.toLowerCase()}.webp`;
        }

        // Obtener el nombre del equipo desde el diccionario
        const teamName = team_dict[teamId];

        // Obtener el número aleatorio para el archivo
        const max = maxImages[teamName] || 1;
        const randomNum = getRandomInt(1, max);

        return `./assets/images/news/${teamName}${randomNum}.webp`;
    }
    else if (type === "transfer") {
        const useGeneric = Math.random() > 0.5;
        if (useGeneric) {
            const randomNum = getRandomInt(1, 12);
            return `./assets/images/news/con${randomNum}.webp`;
        }
        else {
            return `./assets/images/news/${code}_pad.webp`;
        }
    }
    else if (type === "transfer_generic") {
        const randomNum = getRandomInt(1, 9);
        return `./assets/images/news/con${randomNum}.webp`;
    }
    else if (type === "champion") {
        const useChamp = Math.random() < 0.5;
        if (useChamp) {
            const randomNum = getRandomInt(1, 5);
            return `./assets/images/news/champ${randomNum}.webp`;
        }
        else {
            return `./assets/images/news/${code}_tra.webp`;
        }

    }
    else if (type === "reaction") {
        const useTeam = Math.random() < 0.8;
        if (useTeam) {
            const options = [1, 2, 3, 4, 5, 6, 8, 9, 10]
            const randomNum = randomPick(options);
            return `./assets/images/news/${randomNum}_gar.webp`;
        }
        else {
            return `./assets/images/news/${code}_tra.webp`;
        }

    }
    else if (type === "teamComparison") {
        return `./assets/images/news/${team_dict[teamId]}_factory.webp`;
    }
    else if (type === "season_review") {
        //number bnetween 1 and 8 included 8
        const randomNum = getRandomInt(1, 8);
        return `./assets/images/news/${randomNum}_shot.webp`;
    }
    else if (type === "dsq") {
        const randomNum = getRandomInt(1, 8);
        return `./assets/images/news/dsq_${randomNum}.webp`;
    }
    else if (type === "technical") {
        const useGeneric = Math.random() < 0.4;
        if (useGeneric) {
            const randomNum = getRandomInt(1, 8);
            return `./assets/images/news/dsq_${randomNum}.webp`;
        }
        else {
            const randomNum = getRandomInt(1, 3);
            return `./assets/images/news/part_${code}_${randomNum}.webp`;
        }
    }
    else if (type === "investment") {
        return `./assets/images/news/${code}_inv.webp`;
    }
    else if (type === "race_substitution") {
        return `./assets/images/news/${code}_tra.webp`;
    }
    else if (type === "injury") {
        return `./assets/images/news/${code}_pad.webp`;
    }
    else if (type === "engine"){
        const randomNum = getRandomInt(1, 5);
        return `./assets/images/news/engine_${randomNum}.webp`;
    }
    else if (type === "grid"){
        const randomNum = getRandomInt(1, 4);
        return `./assets/images/news/grid_${randomNum}.webp`;
    }
    else if (type === "young"){
        const randomNum = getRandomInt(1, 9);
        return `./assets/images/news/young_${randomNum}.webp`;
    }
}

export function calculateTeamDropsByDate(season, date) {
    const excelDate = dateToExcel(date);

    // cachea el resultado completo de drops para esta fecha exacta
    const dropKey = `${season}:${excelDate}`;
    if (_dropsCache.has(dropKey)) return _dropsCache.get(dropKey);

    const racesDone = fetchEventsDoneBefore(season, excelDate);
    if (!racesDone.length) {
        _dropsCache.set(dropKey, []);
        return [];
    }


    const lastRaceId = racesDone[racesDone.length - 1];

    const racesCount = queryDB(
        `SELECT COUNT(*) FROM Races WHERE SeasonID = ? AND RaceID <= ?`, [season, lastRaceId],
        'singleValue'
    );
    const firstRacePrevSeason = queryDB(
        `SELECT MIN(RaceID) FROM Races WHERE SeasonID = ?`,
        [season - 1],
        'singleValue'
    );
    const lastYearEquivalent = firstRacePrevSeason + (racesCount - 1);

    // Usa versiones cacheadas
    const currentResults = fetchSeasonResultsCached(season);
    const lastYearResults = fetchSeasonResultsCached(season - 1);

    const currentStandings = rebuildStandingsUntil(currentResults, lastRaceId);
    const lastYearStandings = rebuildStandingsUntil(lastYearResults, lastYearEquivalent);

    const drops = currentStandings.teamStandings.map(team => {
        const prev = lastYearStandings.teamStandings.find(t => t.teamId === team.teamId);
        const prevPoints = prev ? prev.points : 0;
        return { teamId: team.teamId, drop: prevPoints - team.points };
    })

    _dropsCache.set(dropKey, drops);
    return drops;
}

export function getTransferDetails(drivers, date = null) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const driverMap = []
    drivers.forEach(d => {
        const previousResultsTeam = queryDB(`SELECT SeasonID, Points, Position FROM Races_TeamStandings WHERE TeamID = ?`, [d.teamId], 'allRows')
            .map(r => {
                return {
                    season: r[0],
                    points: r[1],
                    position: r[2]
                }
            });
        driverMap.push({
            driverId: d.driverId,
            name: d.name,
            previouslyDrivenTeams: getPreviouslyDrivenTeams(d.driverId),
            actualTeam: d.team,
            actualTeamPreviousResults: previousResultsTeam,
            potentialSalary: d.potentialSalary ? d.potentialSalary : null,
            potentialTeam: d.potentialTeam ? combined_dict[d.potentialTeam] : null,
            potentialYearEnd: d.potentialYearEnd ? d.potentialYearEnd : null
        })

    })

    let objRace;

    if (date === null) {
        const lastRaceIdThisSeason = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ? AND State = 2`, [daySeason[1]], 'singleValue');
        objRace = lastRaceIdThisSeason
    }
    else {
        objRace = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ? AND State = 2 AND Day <= ?`, [daySeason[1], date], 'singleValue');
    }

    const seasonResults = fetchSeasonResults(daySeason[1], true);
    const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, objRace);
    const driversForRecords = seasonResults.map(r => ({
        id: r.driverId,
        name: r.driverName ?? ""
    }));
    const enrichedAllTime = enrichDriversWithHistory(driversForRecords);

    return {
        driverMap,
        driverStandings,
        teamStandings,
        driversResults,
        racesNames,
        enrichedAllTime,
        season: daySeason[1]
    }
}

export function getTeamComparisonDetails(teamId, season, date) {
    const lastRaceBeforeDate = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ? AND Day < ?`, [season, date], 'singleValue');
    const seasonResults = fetchSeasonResults(season, true);
    const lastSeasonResults = fetchSeasonResults(season - 1);
    const {
        driverStandings: currentDriverStandings,
        teamStandings: currentTeamStandings,
        driversResults: currentDriversResults,
        racesNames: currentRacesNames
    } = rebuildStandingsUntil(seasonResults, lastRaceBeforeDate, true);

    const racesCount = queryDB(
        `SELECT COUNT(*) FROM Races WHERE SeasonID = ? AND RaceID <= ?`, [season, lastRaceBeforeDate],
        'singleValue'
    );

    const firstRacePrevSeason = queryDB(
        `SELECT MIN(RaceID) FROM Races WHERE SeasonID = ?`, [season - 1],
        'singleValue'
    );

    const lastYearEquivalent = firstRacePrevSeason + (racesCount - 1);

    const {
        driverStandings: oldDriverStandings,
        teamStandings: oldTeamStandings,
        driversResults: oldDriversResults,
        racesNames: oldRacesNames
    } = rebuildStandingsUntil(lastSeasonResults, lastYearEquivalent, true);

    const previousResultsTeam = queryDB(`SELECT SeasonID, Points, Position FROM Races_TeamStandings WHERE TeamID = ?`, [teamId], 'allRows')
        .map(r => {
            return {
                season: r[0],
                points: r[1],
                position: r[2]
            }
        });

    const drivers = seasonResults.map(r => ({
        id: r.driverId,
        name: r.driverName ?? ""
    }));
    const enrichedAllTime = enrichDriversWithHistory(drivers);

    return {
        currentDriverStandings,
        currentTeamStandings,
        currentDriversResults,
        oldDriverStandings,
        oldTeamStandings,
        oldDriversResults,
        currentRacesNames,
        oldRacesNames,
        previousResultsTeam,
        enrichedAllTime
    };
}


export function getFullChampionSeasonDetails(season) {
    const seasonResults = fetchSeasonResults(season, true);
    const qualiResults = fetchQualiResults(season);
    const lastRaceId = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ? AND State = 2`, [season], 'singleValue');
    const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, lastRaceId, true);
    const { driverStandings: qualiDriverStandings, teamStandings: qualiTeamStandings, driversResults: driverQualiResults, racesNames: qualiRacesNames } = rebuildStandingsUntil(qualiResults, lastRaceId, true, true, true);
    const champions = getLatestChampions(season);

    const racesCompleted = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ? AND State = 2`, [season], 'singleValue');
    const drivers = seasonResults.map(r => ({
        id: r.driverId,
        name: r.driverName ?? ""
    }));
    const enrichedAllTime = enrichDriversWithHistory(drivers);

    const isCreateATeam = getGlobals().isCreateATeam;

    const performances = getPerformanceAllTeamsSeason(isCreateATeam);

    let performanceEvolution = performances[0].slice(1, -1);
    const remapped = performanceEvolution.map(obj => {
        const newObj = {};
        Object.entries(obj).forEach(([teamId, value]) => {
            const teamName = combined_dict[teamId] ?? teamId; // fallback al id
            newObj[teamName] = value;
        });
        return newObj;
    });

    return {
        driverStandings,
        teamStandings,
        driversResults,
        driverQualiResults,
        racesNames,
        champions,
        carsPerformance: remapped,
        enrichedAllTime: enrichedAllTime,
    }

}

export function getPreviouslyDrivenTeams(driverId) {
    //select distinct from every race that is not raceID 122 or raceID 124
    const sql = `
        SELECT DISTINCT TeamID, Season
        FROM Races_Results
        WHERE DriverID = ? AND RaceID NOT IN (122, 124, 100, 101)
    `
    const rows = queryDB(sql, [driverId], 'allRows');
    const teams = rows.map(r => {
        return {
            teamId: r[0],
            season: r[1],
            teamName: combined_dict[r[0]],
        }
    });

    return teams;
}

function buildPointsTable(positionAndPointsRows) {
    // rows: [RacePos, Points]
    const tbl = new Map();
    for (const [pos, pts] of positionAndPointsRows) {
        tbl.set(Number(pos), Number(pts) || 0);
    }
    return tbl;
}

function getBasePointsForPos(pos, pointsTable, doublePoints, isLastRace = false) {
    const base = pointsTable.get(pos) ?? 0;
    return doublePoints && isLastRace ? base * 2 : base;
}

// ---- Fastest Lap (FastestLap en segundos) ----
function getFastestLapHolderBySeconds(raceId, queryDB) {
    const row = queryDB(`
    SELECT DriverID 
    FROM Races_Results
    WHERE RaceID = ? AND FastestLap IS NOT NULL AND FastestLap > 0
    ORDER BY FastestLap ASC
    LIMIT 1
  `, [raceId], 'singleRow');
    return row ? Number(row[0]) : null;
}

export function checkDoublePointsBug(turningPointState){
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    let wasBugged = {result : false, raceId: null};
    const ilegalRaces = turningPointState.ilegalRaces
    if (ilegalRaces.length === 0) return wasBugged;

    for (let i = 0; i < ilegalRaces.length; i++) {
        let raceId = ilegalRaces[i].race_id;
        let winnerRow = queryDB(`
            SELECT DriverID, Points FROM Races_Results
            WHERE RaceID = ? AND FinishingPos = 1
        `, [raceId], 'singleRow');
        console.log("Winner row race " + raceId + ": ", winnerRow);
        
        let winnerRowPrevRace = queryDB(`
            SELECT DriverID, Points FROM Races_Results
            WHERE RaceID = ? AND FinishingPos = 1 AND Season = ?
        `, [raceId - 1, daySeason[1]], 'singleRow');
        console.log("Winner row previous race " + (raceId - 1) + ": ", winnerRowPrevRace);
        //if it doesnt existe then take the next race
        if (!winnerRowPrevRace) {
            winnerRowPrevRace = queryDB(`
                SELECT DriverID, Points FROM Races_Results
                WHERE RaceID = ? AND FinishingPos = 1 AND Season = ?
            `, [raceId + 1, daySeason[1]], 'singleRow');
        }

        //if points are more than double, then bug happened
        if (winnerRow && winnerRowPrevRace) {
            if (Number(winnerRow[1]) >= Number(winnerRowPrevRace[1]) * 2) {
                wasBugged = {result : true, raceId: raceId};
                return wasBugged;
            }
        }

    }

    return wasBugged;
}

export function fixDoublePointsBug(raceId) {
    const rows = queryDB(`
        SELECT DriverID, Points 
        FROM Races_Results
        WHERE RaceID = ? AND Points > 0
    `, [raceId], 'allRows');

    for (let i = 0; i < rows.length; i++) {
        let driverId = rows[i][0];
        let champPoints = Number(rows[i][1]);
        let fixedPoints = Math.floor(champPoints / 2);
        queryDB(`
            UPDATE Races_Results SET Points = ?
            WHERE RaceID = ? AND DriverID = ?
        `, [fixedPoints, raceId, driverId], 'run');
    }
    
}

/**
 * Descalifica al equipo y recalcula todo lo necesario (pilotos + constructores + vuelta rápida).
 *
 * @param {Object} params
 * @param {number} params.raceId
 * @param {number} params.teamId
 * @param {Function} params.queryDB
 * @param {Object} params.pointsReg - objeto de fetchPointsRegulations()
 */
function disqualifyTeamInRace({
    raceId,
    teamId,
    queryDB,
    pointsReg,
}) {
    // 0) Contexto temporada
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, [], 'singleRow');
    const seasonId = daySeason?.[1];

    // 1) Config de puntos
    const pointsTable = buildPointsTable(pointsReg.positionAndPoints);
    const flEnabled = Number(pointsReg.fastestLapBonusPoint) === 1;
    const doublePts = pointsReg.isLastraceDouble ? true : false; //falta añadir que si la regulacion esta activa Y ES LA ULTIMA CARRERA

    // 2) Estado inicial de la carrera
    const allRes = queryDB(`
    SELECT DriverID, TeamID, FinishingPos, Points, IFNULL(DNF,0) AS DNF, FastestLap
    FROM Races_Results
    WHERE RaceID = ?
    ORDER BY FinishingPos ASC
  `, [raceId], 'allRows') || [];
    if (!allRes.length) return;

    const prevRacePoints = new Map(); // DriverID -> puntos antes
    const driverTeam = new Map(); // DriverID -> TeamID
    for (const r of allRes) {
        prevRacePoints.set(Number(r[0]), Number(r[3]) || 0);
        driverTeam.set(Number(r[0]), Number(r[1]));
    }

    // Identifica DSQ del teamId
    const dsqRows = allRes.filter(r => Number(r[1]) === Number(teamId));
    if (!dsqRows.length) return;
    const dsqIds = new Set(dsqRows.map(r => Number(r[0])));

    // 1) Offset temporal a TODA la carrera para no violar UNIQUE
    queryDB(`
    UPDATE Races_Results
    SET FinishingPos = FinishingPos + 1000
    WHERE RaceID = ?
  `, [raceId], 'run');

    // 2) Construye el nuevo orden completo
    const classified = allRes
        .filter(r => r[4] === 0 && !dsqIds.has(Number(r[0])))
        .sort((a, b) => a[2] - b[2]); // por FinishingPos original

    const dnfsOther = allRes
        .filter(r => r[4] === 1 && !dsqIds.has(Number(r[0])))
        .sort((a, b) => a[2] - b[2]); // conserva su orden relativo

    const dsqSorted = dsqRows.slice().sort((a, b) => a[2] - b[2]); // el que estaba más arriba primero

    // 3) Reasignar FinishingPos secuencialmente y puntos base
    let pos = 1;
    const afterRacePoints = new Map(); // DriverID -> puntos tras recálculo (sin FL aún)

    const lastRace = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ?`, [seasonId], 'singleValue');
    const isLastRace = Number(raceId) === Number(lastRace);

    // Clasificados: posiciones 1..K + puntos
    for (const r of classified) {
        const driverId = Number(r[0]);
        const pts = getBasePointsForPos(pos, pointsTable, doublePts, isLastRace);
        afterRacePoints.set(driverId, pts);
        queryDB(`
      UPDATE Races_Results
      SET FinishingPos = ?, Points = ?, DNF = 0
      WHERE RaceID = ? AND DriverID = ?
    `, [pos, pts, raceId, driverId], 'run');
        pos++;
    }

    // DNFs no DSQ: van detrás de clasificados, sin puntos
    for (const r of dnfsOther) {
        const driverId = Number(r[0]);
        afterRacePoints.set(driverId, 0);
        queryDB(`
      UPDATE Races_Results
      SET FinishingPos = ?, Points = 0, DNF = 1
      WHERE RaceID = ? AND DriverID = ?
    `, [pos, raceId, driverId], 'run');
        pos++;
    }

    // DSQ del equipo: los dos últimos
    for (let i = 0; i < dsqSorted.length; i++) {
        const driverId = Number(dsqSorted[i][0]);
        afterRacePoints.set(driverId, 0);
        queryDB(`
      UPDATE Races_Results
      SET FinishingPos = ?, Points = 0, DNF = 1
      WHERE RaceID = ? AND DriverID = ?
    `, [pos, raceId, driverId], 'run');
        pos++;
    }

    // 4) BONUS VUELTA RÁPIDA (si habilitado y el portador queda top-10 y DNF=0)
    if (flEnabled) {
        const flDriver = getFastestLapHolderBySeconds(raceId, queryDB);
        if (flDriver != null && !dsqIds.has(flDriver)) {
            const row = queryDB(`
        SELECT FinishingPos, IFNULL(DNF,0)
        FROM Races_Results
        WHERE RaceID = ? AND DriverID = ?
      `, [raceId, flDriver], 'singleRow');
            const fPos = Number(row?.[0] ?? 9999);
            const fDNF = Number(row?.[1] ?? 0);

            if (fDNF === 0 && fPos <= 10) {
                const bonus = 1;
                const base = afterRacePoints.get(flDriver) ?? 0;
                const withBonus = base + bonus;
                afterRacePoints.set(flDriver, withBonus);
                queryDB(`
                    UPDATE Races_Results
                    SET Points = ?
                    WHERE RaceID = ? AND DriverID = ?
                `, [withBonus, raceId, flDriver], 'run');
            }
        }
    }

    if (Number(pointsReg.poleBonusPoint) === 1) {
        const poleDriverId = queryDB(`
        SELECT DriverID
        FROM Races_Results
        WHERE RaceID = ? AND StartingPos = 1
    `, [raceId], 'singleValue');

        if (poleDriverId != null) {
            const poleId = Number(poleDriverId);
            if (!dsqIds.has(poleId)) {
                // Si tu normativa NO duplica la pole, fija bonus = 1.
                const bonus = 1;
                const base = afterRacePoints.get(poleId) ?? 0;
                const withBonus = base + bonus;
                afterRacePoints.set(poleId, withBonus);

                queryDB(`
                UPDATE Races_Results
                SET Points = ?
                WHERE RaceID = ? AND DriverID = ?
            `, [withBonus, raceId, poleId], 'run');
            }
        }
    }

    // 5) Deltas campeonato (pilotos) + acumulado por equipo (constructores)
    const teamDelta = new Map(); // TeamID -> delta total
    for (const r of allRes) {
        const driverId = Number(r[0]);
        const team = driverTeam.get(driverId);
        const before = prevRacePoints.get(driverId) || 0;
        const after = afterRacePoints.get(driverId) ?? 0;
        const delta = after - before;

        if (delta !== 0 && seasonId != null) {
            queryDB(`
        UPDATE Races_DriverStandings
        SET Points = Points + ?
        WHERE SeasonID = ? AND DriverID = ?
      `, [delta, seasonId, driverId], 'run');
        }
        teamDelta.set(team, (teamDelta.get(team) || 0) + delta);
    }

    if (seasonId != null) {
        for (const [team, delta] of teamDelta.entries()) {
            if (delta !== 0) {
                queryDB(`
          UPDATE Races_TeamStandings
          SET Points = Points + ?
          WHERE SeasonID = ? AND TeamID = ?
        `, [delta, seasonId, team], 'run');
            }
        }
        queryDB(`
        WITH ranked AS (
            SELECT
                DriverID,
                ROW_NUMBER() OVER (PARTITION BY SeasonID ORDER BY Points DESC, DriverID ASC) AS pos
            FROM Races_DriverStandings
            WHERE SeasonID = ?
            AND RaceFormula = 1
        )
        UPDATE Races_DriverStandings
        SET Position = (
            SELECT pos
            FROM ranked
            WHERE ranked.DriverID = Races_DriverStandings.DriverID
              AND RaceFormula = 1
        )
        WHERE SeasonID = ?
        AND RaceFormula = 1;
    `, [seasonId, seasonId], 'run');

        // Recalcular posición en la clasificación de constructores
        queryDB(`
        WITH ranked AS (
            SELECT
                TeamID,
                ROW_NUMBER() OVER (PARTITION BY SeasonID ORDER BY Points DESC, TeamID ASC) AS pos
            FROM Races_TeamStandings
            WHERE SeasonID = ?
            AND RaceFormula = 1
        )
        UPDATE Races_TeamStandings
        SET Position = (
            SELECT pos
            FROM ranked
            WHERE ranked.TeamID = Races_TeamStandings.TeamID
            AND RaceFormula = 1
        )
        WHERE SeasonID = ?
        AND RaceFormula = 1;
    `, [seasonId, seasonId], 'run');
    }
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// SAVING NEWS
const encodeJSON = (obj) =>
    USE_COMPRESSION ? LZString.compressToUTF16(JSON.stringify(obj)) : JSON.stringify(obj);

const decodeJSON = (txt) => {
    if (!txt) return {};
    const raw = USE_COMPRESSION ? LZString.decompressFromUTF16(txt) : txt;
    try { return JSON.parse(raw || "{}"); } catch { return {}; }
};

// --- DB helpers ---
export function ensureEditorStateTable() {
    const exists = queryDB(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='Custom_News_State'`,
        [],
        "singleRow"
    );
    if (!exists) queryDB(`CREATE TABLE Custom_News_State (key TEXT PRIMARY KEY, value TEXT)`, [], 'run');
}

export function getEditorState(key) {
    ensureEditorStateTable();
    const row = queryDB(`SELECT value FROM Custom_News_State WHERE key = ?`, [key], "singleRow");
    return row ? row[0] : null;
}

export function setEditorState(key, valueText) {
    ensureEditorStateTable();
    queryDB(`
    INSERT INTO Custom_News_State (key,value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value
  `, [key, valueText], 'run');
}

// --- computeStableKey compartido (mismo algoritmo en front y worker) ---
export function computeStableKey(n) {
    if (n.id != null && n.id !== "") return String(n.id);
    // ajusta por tipo si quieres; fallback seguro:
    return `h:${n.type}|${n.title}|${n.date}`;
}

// --- NEWS: load/save/upsert ---
export function loadNewsMapFromDB(season = null) {
    const globals = getGlobals();
    if (season == null) {
        season = globals?.currentDate[1];
    }
    const key = `${season}_news`;
    return decodeJSON(getEditorState(key)) || {};
}

export function saveNewsToDBMap(map) {
    const globals = getGlobals();
    const year = globals?.currentDate[1]
    const key = `${year}_news`;
    setEditorState(key, encodeJSON(map));
}

export function deleteNews() {
    const globals = getGlobals();
    const year = globals?.currentDate[1]
    const key = `${year}_news`;
    setEditorState(key, encodeJSON({}));
}

export function deleteTurningPoints() {
    const globals = getGlobals();
    const year = globals?.currentDate[1]
    const key = `${year}_turning_points`;
    setEditorState(key, encodeJSON({}));
}

export function upsertNews(newsList = []) {
    const prev = loadNewsMapFromDB();
    const out = { ...prev };
    for (const n of newsList) {
        const key = n.stableKey ?? computeStableKey(n);
        const old = out[key] || {};
        out[key] = {
            ...old,
            title: n.title,
            type: n.type,
            date: n.date,
            image: n.image,
            overlay: n.overlay,
            data: n.data,
            text: n.text ?? old.text,
            turning_point_type: n.turning_point_type ?? old.turning_point_type,
            nonReadable: n.nonReadable ?? old.nonReadable,
            hiddenByAvailability: n.hiddenByAvailability ?? old.hiddenByAvailability,
            hiddenReason: n.hiddenReason ?? old.hiddenReason,
            stableKey: key,
        };
    }
    saveNewsToDBMap(out);
    return out; // por si quieres devolver el estado
}

// --- TP: load/save/upsert (simple: arrays -> replace, objetos -> merge, primitivos -> replace) ---
export function loadTPFromDB(season = null) {
    const globals = getGlobals();
    if (season == null) {
        season = globals?.currentDate[1];
    }
    const key = `${season}_turning_points`;
    return decodeJSON(getEditorState(key)) || {};
}

export function saveTPToDBMap(map) {
    const globals = getGlobals();
    const year = globals?.currentDate[1]
    const key = `${year}_turning_points`;
    setEditorState(key, encodeJSON(map));
}

export function upsertTurningPoints(tpPartial = {}) {
    const prev = loadTPFromDB();
    const out = { ...prev };
    for (const [k, v] of Object.entries(tpPartial)) {
        const old = out[k];
        if (Array.isArray(v)) out[k] = v.slice();
        else if (v && typeof v === "object") out[k] = { ...(old || {}), ...v };
        else out[k] = v;
    }
    saveTPToDBMap(out);
    return out;
}

export function updateNewsFields(stableKey, patch) {
    const map = loadNewsMapFromDB();
    const old = map[stableKey] || null;
    if (!old) return false; // o lanzar error si prefieres

    // Solo actualiza los campos permitidos
    const allowed = ["text", "turning_point_type", "nonReadable", "hiddenByAvailability", "hiddenReason", "overlay", "image", "title"];
    const next = { ...old };
    for (const k of allowed) {
        if (patch[k] !== undefined) next[k] = patch[k];
    }
    map[stableKey] = next;
    saveNewsToDBMap(map);
    return true;
}

export function deleteNewByKey(stableKey) {
    const map = loadNewsMapFromDB();
    if (map[stableKey]) {
        delete map[stableKey];
        saveNewsToDBMap(map);
        return true;
    }
    return false;
}

export function isMigrationDone() {
    return getEditorState("_migration_v1_done") === "1";
}
export function markMigrationDone() {
    setEditorState("_migration_v1_done", "1");
}

// util segura
function safeParse(txt, fallback) {
    try { return JSON.parse(txt); } catch { return fallback; }
}

function mergeNewsMaps(dbMap, lsMap) {
    // preferimos LS para no perder artículos generados/ediciones locales
    return { ...dbMap, ...lsMap };
}
function mergeTPMaps(dbMap, lsMap) {
    const out = { ...dbMap };
    for (const [k, v] of Object.entries(lsMap)) {
        const old = out[k];
        if (Array.isArray(v)) out[k] = v.slice();                 // arrays -> replace
        else if (v && typeof v === "object") out[k] = { ...(old || {}), ...v }; // objetos -> merge
        else out[k] = v;                                          // primitivos/null -> replace
    }
    return out;
}

export function migrateLegacyData(lsNewsTxt, lsTPTxt) {
    if (isMigrationDone()) return "already"; // idempotente

    if (lsNewsTxt) {
        const lsNewsMap = safeParse(lsNewsTxt, {});
        const dbNewsMap = loadNewsMapFromDB();
        const outNews = mergeNewsMaps(dbNewsMap, lsNewsMap);
        saveNewsToDBMap(outNews);
    }

    if (lsTPTxt) {
        const lsTPMap = safeParse(lsTPTxt, {});
        const dbTPMap = loadTPFromDB();
        const outTP = mergeTPMaps(dbTPMap, lsTPMap);
        saveTPToDBMap(outTP);
    }

    markMigrationDone();
    return "migrated";
}

export function ensureTurningPointsStructure() {
    const globals = getGlobals?.(); // si lo tienes disponible
    const year = globals?.currentDate?.[1];
    const key = `${year}_tps`;

    let data = loadTPFromDB();
    if (data && Object.keys(data).length > 0) {
        return data;
    }

    // Estructura por defecto
    const defaultStructure = {
        checkedRaces: [],
        ilegalRaces: [],
        transfers: { 5: null, 6: null, 7: null },
        technicalDirectives: { 6: null, 9: null },
        investmentOpportunities: {
            4: null, 5: null, 6: null, 7: null,
            8: null, 9: null, 10: null, 11: null
        },
        raceSubstitutionOpportunities: {
            4: null, 5: null, 6: null, 7: null,
            8: null, 9: null, 10: null, 11: null
        },
        youngDrivers: null
    };

    // guarda en DB si no existía
    saveTPToDBMap(defaultStructure);

    return defaultStructure;
}

export function getNewsAndTpYearsAvailable() {
    const yearsSet = new Set();
    const editorStateRows = queryDB(
        `SELECT key FROM Custom_News_State WHERE key LIKE '%_news' OR key LIKE '%_turning_points'`,
        [],
        'allRows'
    );
    for (const [key] of editorStateRows) {
        const match = key.match(/^(\d{4})_(news|turning_points)$/);
        if (match) {
            const year = Number(match[1]);
            yearsSet.add(year);
        }
    }
    const years = Array.from(yearsSet);
    years.sort((a, b) => b - a);
    return years;
}

export function getNewsFromSeason(season) {
    const newsMap = loadNewsMapFromDB(season);
    const tpMap = loadTPFromDB(season);
    return { newsList: Object.values(newsMap).sort((a, b) => new Date(b.date) - new Date(a.date)), turningPointState: tpMap };
}

// DRIVER INJURY

export function ensureInjurySwapInfrastructure() {
    queryDB(`
        CREATE TABLE IF NOT EXISTS Custom_Injury_Swaps (
        id                   INTEGER PRIMARY KEY AUTOINCREMENT,
        season_id            INTEGER NOT NULL,
        start_day            INTEGER NOT NULL,
        end_day              INTEGER NOT NULL,
        injured_id           INTEGER NOT NULL,
        reserve_id           INTEGER NOT NULL,
        injured_team_id      INTEGER,
        injured_pos          INTEGER,
        injured_car_number   INTEGER,
        reserve_team_id      INTEGER,
        reserve_pos          INTEGER,
        reserve_car_number   INTEGER,
        injured_engineer_id  INTEGER,
        reserve_engineer_id  INTEGER,
        processed            INTEGER NOT NULL DEFAULT 0
        )
    `, [], 'run');

}

export function startInjurySwap(injuredId, reserveData, endDay) {
    const [dayNow, seasonId] = queryDB(`
        SELECT Day, CurrentSeason
        FROM Player_State
    `, [], 'singleRow');
    let reserveId = reserveData.id;

    // Foto del estado original (equipo/pos/coche)
    const injTeam = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE ContractType = 0 AND StaffID = ?`, [injuredId], 'singleValue');
    const injPos = queryDB(`SELECT PosInTeam FROM Staff_Contracts WHERE ContractType = 0 AND StaffID = ?`, [injuredId], 'singleValue');
    const injCar = queryDB(`SELECT AssignedCarNumber FROM Staff_DriverData WHERE StaffID = ?`, [injuredId], 'singleValue');

    const resTeam = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE ContractType = 0 AND StaffID = ?`, [reserveId], 'singleValue');
    const resPos = queryDB(`SELECT PosInTeam FROM Staff_Contracts WHERE ContractType = 0 AND StaffID = ?`, [reserveId], 'singleValue');
    const resCar = queryDB(`SELECT AssignedCarNumber FROM Staff_DriverData WHERE StaffID = ?`, [reserveId], 'singleValue');

    // 🔸 Foto de ingenieros actuales (ANTES del swap)
    const injEngineer = queryDB(`
    SELECT RaceEngineerID
    FROM Staff_RaceEngineerDriverAssignments
    WHERE DriverID = ? AND IsCurrentAssignment = 1
    ORDER BY DaysTogether DESC, ROWID DESC
    LIMIT 1
  `, [injuredId], 'singleValue');

    const resEngineer = queryDB(`
    SELECT RaceEngineerID
    FROM Staff_RaceEngineerDriverAssignments
    WHERE DriverID = ? AND IsCurrentAssignment = 1
    ORDER BY DaysTogether DESC, ROWID DESC
    LIMIT 1
  `, [reserveId], 'singleValue');

    if (reserveData.isFreeAgent) {
        let teamId = reserveData.futureTeamId
        hireDriver("auto", reserveId, teamId, 10);
    }
    // Aplica el cambio (tu función gestiona engineers/car numbers en este momento)
    swapDrivers(injuredId, reserveId);

    // Registrar TODO para revertir exactamente en endDay
    queryDB(`
    INSERT INTO Custom_Injury_Swaps (
      season_id, start_day, end_day,
      injured_id, reserve_id,
      injured_team_id, injured_pos, injured_car_number,
      reserve_team_id, reserve_pos, reserve_car_number,
      injured_engineer_id, reserve_engineer_id,
      processed
    ) VALUES (
      ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?,
      ?,
      0
    )
  `, [seasonId, dayNow, endDay, injuredId, reserveId, injTeam, injPos, injCar, resTeam, resPos, resCar, injEngineer, resEngineer], 'run');

    return { seasonId, dayNow };
}


export function createInjuryRevertTrigger({ seasonId, monthNumber, injuredId, reserveId, endDay }) {
    if (!seasonId || !monthNumber || !injuredId || !reserveId || endDay === undefined || endDay === null) {
        throw new Error('createInjuryRevertTrigger: faltan parámetros obligatorios.');
    }

    // Validate numeric parameters to prevent SQL injection
    const validSeasonId = Number(seasonId);
    const validInjuredId = Number(injuredId);
    const validEndDay = Number(endDay);

    if (!Number.isInteger(validSeasonId) || !Number.isInteger(validInjuredId) || !Number.isInteger(validEndDay)) {
        throw new Error('createInjuryRevertTrigger: seasonId, injuredId, and endDay must be integers.');
    }

    const trigName = `trg_injury_revert_${validSeasonId}_${validInjuredId}`;

    // Por si re-generas, dejamos el nombre libre
    // Note: SQL doesn't support parameterized trigger names in DROP/CREATE statements
    // validSeasonId, validInjuredId, and validEndDay are validated as integers above (lines 4482-4488)
    // and cannot be parameterized in CREATE TRIGGER syntax, so they are safely interpolated
    queryDB(`DROP TRIGGER IF EXISTS "${trigName}"`, [], 'run');

    // Trigger con igualdad estricta en el día objetivo
    // Note: Trigger definition uses validated integers directly as they cannot be parameterized in CREATE TRIGGER
    const sql = `
    CREATE TRIGGER "${trigName}"
    AFTER UPDATE OF Day ON Player_State
    WHEN NEW.Day = ${validEndDay} AND NEW.CurrentSeason = ${validSeasonId}
    BEGIN
      -- Restaurar lesionado
      UPDATE Staff_Contracts
      SET TeamID = (
            SELECT injured_team_id
            FROM Custom_Injury_Swaps s
            WHERE s.injured_id = Staff_Contracts.StaffID
              AND s.processed = 0
              AND s.season_id = ${validSeasonId}
              AND s.end_day = ${validEndDay}
            ORDER BY s.id DESC
            LIMIT 1
          ),
          PosInTeam = (
            SELECT injured_pos
            FROM Custom_Injury_Swaps s
            WHERE s.injured_id = Staff_Contracts.StaffID
              AND s.processed = 0
              AND s.season_id = ${validSeasonId}
              AND s.end_day = ${validEndDay}
            ORDER BY s.id DESC
            LIMIT 1
          )
      WHERE ContractType = 0
        AND StaffID IN (
          SELECT injured_id FROM Custom_Injury_Swaps
          WHERE processed = 0 AND season_id = ${validSeasonId} AND end_day = ${validEndDay}
        );

      UPDATE Staff_DriverData
      SET AssignedCarNumber = (
            SELECT injured_car_number
            FROM Custom_Injury_Swaps s
            WHERE s.injured_id = Staff_DriverData.StaffID
              AND s.processed = 0
              AND s.season_id = ${validSeasonId}
              AND s.end_day = ${validEndDay}
            ORDER BY s.id DESC
            LIMIT 1
          )
      WHERE StaffID IN (
        SELECT injured_id FROM Custom_Injury_Swaps
        WHERE processed = 0 AND season_id = ${validSeasonId} AND end_day = ${validEndDay}
      );

      -- Restaurar reserva
      UPDATE Staff_Contracts
      SET TeamID = (
            SELECT reserve_team_id
            FROM Custom_Injury_Swaps s
            WHERE s.reserve_id = Staff_Contracts.StaffID
              AND s.processed = 0
              AND s.season_id = ${validSeasonId}
              AND s.end_day = ${validEndDay}
            ORDER BY s.id DESC
            LIMIT 1
          ),
          PosInTeam = (
            SELECT reserve_pos
            FROM Custom_Injury_Swaps s
            WHERE s.reserve_id = Staff_Contracts.StaffID
              AND s.processed = 0
              AND s.season_id = ${validSeasonId}
              AND s.end_day = ${validEndDay}
            ORDER BY s.id DESC
            LIMIT 1
          )
      WHERE ContractType = 0
        AND StaffID IN (
          SELECT reserve_id FROM Custom_Injury_Swaps
          WHERE processed = 0 AND season_id = ${validSeasonId} AND end_day = ${validEndDay}
        );

      UPDATE Staff_DriverData
      SET AssignedCarNumber = (
            SELECT reserve_car_number
            FROM Custom_Injury_Swaps s
            WHERE s.reserve_id = Staff_DriverData.StaffID
              AND s.processed = 0
              AND s.season_id = ${validSeasonId}
              AND s.end_day = ${validEndDay}
            ORDER BY s.id DESC
            LIMIT 1
          )
      WHERE StaffID IN (
        SELECT reserve_id FROM Custom_Injury_Swaps
        WHERE processed = 0 AND season_id = ${validSeasonId} AND end_day = ${validEndDay}
      );

      UPDATE Staff_RaceEngineerDriverAssignments
      SET IsCurrentAssignment = 0
      WHERE DriverID IN (
        SELECT injured_id FROM Custom_Injury_Swaps
        WHERE processed = 0 AND season_id = ${validSeasonId} AND end_day = ${validEndDay}
        UNION
        SELECT reserve_id FROM Custom_Injury_Swaps
        WHERE processed = 0 AND season_id = ${validSeasonId} AND end_day = ${validEndDay}
      );

      -- 2) Poner a 0 cualquier asignación actual de los ingenieros originales (evita conflictos)
      UPDATE Staff_RaceEngineerDriverAssignments
      SET IsCurrentAssignment = 0
      WHERE RaceEngineerID IN (
        SELECT injured_engineer_id FROM Custom_Injury_Swaps
        WHERE processed = 0 AND season_id = ${validSeasonId} AND end_day = ${validEndDay}
        UNION
        SELECT reserve_engineer_id FROM Custom_Injury_Swaps
        WHERE processed = 0 AND season_id = ${validSeasonId} AND end_day = ${validEndDay}
      );

      -- 3) Asegurar que existen filas (si no existen, crearlas), y marcar como actuales

      -- Lesionado ↔ su ingeniero original
      INSERT OR IGNORE INTO Staff_RaceEngineerDriverAssignments
        (RaceEngineerID, DriverID, DaysTogether, IsCurrentAssignment)
      SELECT s.injured_engineer_id, s.injured_id, 0, 0
      FROM Custom_Injury_Swaps s
      WHERE s.processed = 0 AND s.season_id = ${validSeasonId} AND s.end_day = ${validEndDay}
        AND s.injured_engineer_id IS NOT NULL;

      UPDATE Staff_RaceEngineerDriverAssignments
      SET IsCurrentAssignment = 1
      WHERE (DriverID, RaceEngineerID) IN (
        SELECT s.injured_id, s.injured_engineer_id
        FROM Custom_Injury_Swaps s
        WHERE s.processed = 0 AND s.season_id = ${validSeasonId} AND s.end_day = ${validEndDay}
          AND s.injured_engineer_id IS NOT NULL
      );

      -- Reserva ↔ su ingeniero original (del equipo de origen del reserva)
      INSERT OR IGNORE INTO Staff_RaceEngineerDriverAssignments
        (RaceEngineerID, DriverID, DaysTogether, IsCurrentAssignment)
      SELECT s.reserve_engineer_id, s.reserve_id, 0, 0
      FROM Custom_Injury_Swaps s
      WHERE s.processed = 0 AND s.season_id = ${validSeasonId} AND s.end_day = ${validEndDay}
        AND s.reserve_engineer_id IS NOT NULL;

      UPDATE Staff_RaceEngineerDriverAssignments
      SET IsCurrentAssignment = 1
      WHERE (DriverID, RaceEngineerID) IN (
        SELECT s.reserve_id, s.reserve_engineer_id
        FROM Custom_Injury_Swaps s
        WHERE s.processed = 0 AND s.season_id = ${validSeasonId} AND s.end_day = ${validEndDay}
          AND s.reserve_engineer_id IS NOT NULL
      );

      -- Marcar como procesado
      UPDATE Custom_Injury_Swaps
      SET processed = 1
      WHERE processed = 0
        AND season_id = ${validSeasonId}
        AND end_day = ${validEndDay};
    END;
  `;

    queryDB(sql, [], 'run');

    return trigName; // por si quieres guardarlo para limpieza futura
}


function applyDriverInjury(turningPointData) {
    ensureInjurySwapInfrastructure();

    // 1) Aplicar lesión y registrar
    const injuredId = turningPointData.driver_affected.id;
    const reserveData = turningPointData.reserve_driver
    const endDay = turningPointData.condition.end_date;
    let reserveId = reserveData.id;
    const { seasonId } = startInjurySwap(injuredId, reserveData, endDay);

    // 2) Crear trigger con nombre que incluya el mes actual
    const monthNumber = turningPointData.month; // por ejemplo, noviembre
    const triggerName = createInjuryRevertTrigger({
        seasonId,
        monthNumber,
        injuredId,
        reserveId,
        endDay
    });

}
