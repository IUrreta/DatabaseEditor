import { fetchEventsDoneFrom, formatNamesSimple, fetchEventsDoneBefore, fetchPointsRegulations } from "./dbUtils";
import { races_names, countries_dict, countries_data, getParamMap, team_dict, combined_dict, opinionDict } from "../../frontend/config";
import newsTitleTemplates from "../../../data/news/news_titles_templates.json";
import turningPointsTitleTemplates from "../../../data/news/turning_points_titles_templates.json";
import { fetchSeasonResults, fetchQualiResults } from "./dbUtils";
import { queryDB } from "../dbManager";
import { excelToDate, dateToExcel } from "./eidtStatsUtils";
import { getTier, getDriverOverall } from "./transferUtils";
import { getPerformanceAllTeamsSeason, getAllPartsFromTeam } from "./carAnalysisUtils";
import { getGlobals } from "../commandGlobals";

const _seasonResultsCache = new Map();
const _standingsCache = new Map();
const _dropsCache = new Map();

function fetchSeasonResultsCached(season) {
    if (_seasonResultsCache.has(season)) return _seasonResultsCache.get(season);
    const res = fetchSeasonResults(season);
    _seasonResultsCache.set(season, res);
    return res;
}

function rebuildStandingsUntilCached(season, seasonResults, raceId) {
    const key = `${season}:${raceId}`;
    if (_standingsCache.has(key)) return _standingsCache.get(key);
    const res = rebuildStandingsUntil(seasonResults, raceId);
    _standingsCache.set(key, res);
    return res;
}

export function generate_news(savednews, turningPointState) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const racesDone = fetchEventsDoneFrom(daySeason[1]);

    // const potentialChampionTestRaceId = 216; // Set to null for normal operation.

    const potentialChampionNewsList = generateChampionMilestones(racesDone, savednews);

    const currentDate = excelToDate(daySeason[0]);
    const currentMonth = currentDate.getMonth() + 1;
    const rumorMonths = [4, 5, 6, 7];
    const comparisonMonths = [4, 5, 6, 7, 8, 9, 10];
    const monthsDone = rumorMonths.filter(m => m < currentMonth);

    const raceNews = generateRaceResultsNews(racesDone, savednews);
    const qualiNews = generateQualifyingResultsNews(racesDone, savednews);

    const comparisonNews = generateComparisonNews(comparisonMonths, savednews);

    const transferRumors = getTrueTransferRumors();

    const sillySeasonNews = generateTransferRumorsNews(transferRumors, savednews);

    const bigConfirmedTransfers = getConfirmedTransfers(true);
    const contractRenewals = getContractExtensions();

    const fakeTransferNews = generateFakeTransferNews(monthsDone, savednews);
    const bigConfirmedTransfersNews = generateBigConfirmedTransferNews(savednews, bigConfirmedTransfers, currentMonth);
    const contractRenewalsNews = generateContractRenewalsNews(savednews, contractRenewals, currentMonth);

    const seasonReviews = generateSeasonReviewNews(savednews);

    const dsqTurningPointNews = generateDSQTurningPointNews(racesDone, savednews, turningPointState);

    const midSeasonTransfersTurningPointNews = generateMidSeasonTransfersTurningPointNews(monthsDone, currentMonth, savednews, turningPointState);

    let newsList = [...raceNews || [], ...qualiNews || [], ...fakeTransferNews || [], ...bigConfirmedTransfersNews || [], ...contractRenewalsNews || [], ...comparisonNews || [], ...seasonReviews || [], ...potentialChampionNewsList || [], ...sillySeasonNews || [], ...dsqTurningPointNews || [], ...midSeasonTransfersTurningPointNews || []];

    //order by date descending
    newsList.sort((a, b) => b.date - a.date);
    return {
        newsList,
        turningPointState
    };
}

export function generateTurningResponse(turningPointData, type, originalDate, outcome) {
    let newEntry;
    if (type === "turning_point_transfer") {
        //manage the transfer
    } else if (type === "turning_point_dsq") {
        const pointsReg = fetchPointsRegulations();

        disqualifyTeamInRace({
            raceId: turningPointData.race_id,
            teamId: turningPointData.teamId,
            queryDB,
            pointsReg
        });

        const entryId = `turning_point_outcome_dsq_${turningPointData.race_id}`;
        const title = generateTurningPointTitle(turningPointData, 103, outcome);
        const image = null;

        newEntry = {
            id: entryId,
            title,
            image,
            data: turningPointData,
            date: originalDate + 2,
            turning_point_type: outcome,
            type: "turning_point_outcome_dsq"
        }

    }

    return newEntry;
}


function generateMidSeasonTransfersTurningPointNews(monthsDone, currentMonth, savednews = {}, turningPointState = {}) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');

    //   if (![6, 7, 8].includes(currentMonth)) return [];

    //   // 50% chance
    //   if (Math.random() >= 0.5){
    //       turningPointState.transfers[currentMonth] = "None";
    //       return [];
    //   }

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
    WHERE res.SeasonID = ${daySeason[1]}
      AND res.RaceFormula = 1
  `);


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


    console.log('teamsById:', teamsById);
    console.log('teamsWithImbalance (>70%):', teamsWithImbalance);

    const randomTeam = randomPick(teamsWithImbalance);
    const randomTeamName = combined_dict[randomTeam] || "Unknown Team";

    const entryId = `turning_point_transfer_${currentMonth}`;

    if (savednews[entryId]) {
        return [savednews[entryId]];
    }

    console.log("Selected team for mid-season transfer TP:", randomTeamName);

    //the driver from the randomteam with less points
    let driverOut = teamsById[randomTeam] ? Object.entries(teamsById[randomTeam].drivers).sort((a, b) => a[1] - b[1])[0] : null;
    let driverIn, driverSubstitute;

    if (randomTeam === 3) {
        if (combined_dict[8] === "Alpha Tauri" || combined_dict[8] === "Visa Cashapp RB") { //red bull special case
            //select the driver with most points contracted with team 8
            driverIn = Object.entries(teamsById[8].drivers).sort((a, b) => b[1] - a[1])[0];
        }
        else {
            const freeAgents = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID
                    FROM Staff_BasicData bas
                    JOIN Drivers dri ON bas.StaffID = dri.StaffID
                    JOIN Staff_GameData gd ON bas.StaffID = gd.StaffID
                    WHERE dri.StaffID NOT IN (SELECT StaffID FROM Staff_Contracts)
                    AND gd.Retired = 0`, 'allRows');
            if (freeAgents.length) {
                for (const fa of freeAgents) {
                    const overall = getDriverOverall(fa[2]);
                    fa.push(overall);
                }
                freeAgents.sort((a, b) => b[3] - a[3]);
                driverIn = [freeAgents[0][2], freeAgents[0][3]];
                console.log("Driver OUT:", driverOut, "Driver IN (free agent):", driverIn);
            }
        }
    }
    else {
        //if its one of the 3 teams with less points
        const teamsByTotalPoints = Object.entries(teamsById).sort((a, b) => a[1].total - b[1].total);
        const bottom3Teams = teamsByTotalPoints.slice(0, 3).map(entry => entry[0]);
        const top4Teams = teamsByTotalPoints.slice(-4).map(entry => entry[0]);
        console.log("Bottom 3 teams:", bottom3Teams.map(tid => combined_dict[tid] || tid));
        console.log("Top 4 teams:", top4Teams.map(tid => combined_dict[tid] || tid));

        if (bottom3Teams.includes(randomTeam)) {
            //sign a reserve driver
            const reserveDrivers = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID
                FROM Staff_Contracts con
                JOIN Staff_BasicData bas ON con.StaffID = bas.StaffID
                JOIN Staff_DriverData dri ON con.StaffID = dri.StaffID
                WHERE con.TeamID = ${randomTeam} AND con.ContractType = 1 AND con.PosInTeam > 2`, 'allRows');
            if (reserveDrivers.length) {
                const randomReserve = randomPick(reserveDrivers);
                const [nameFormatted, driverId] = formatNamesSimple(randomReserve);
                driverIn = [nameFormatted, driverId];
                console.log("Driver OUT:", driverOut, "Driver IN (reserve):", driverIn);
            }
        }
        else if (top4Teams.includes(randomTeam)) {
            //sign the best free agent available (drivers that are in driverData but not appear in contracts)
            const freeAgents = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID
                    FROM Staff_BasicData bas
                    JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID
                    JOIN Staff_GameData gd ON bas.StaffID = gd.StaffID
                    WHERE dri.StaffID NOT IN (SELECT StaffID FROM Staff_Contracts)
                    AND gd.Retired = 0`, 'allRows');
            if (freeAgents.length) {
                for (const fa of freeAgents) {
                    const overall = getDriverOverall(fa[2]);
                    fa.push(overall);
                }
                freeAgents.sort((a, b) => b[3] - a[3]);
                driverIn = [freeAgents[0][2], freeAgents[0][3]];
                console.log("Driver OUT:", driverOut, "Driver IN (free agent):", driverIn);
            }
        }
        else {
            //get the driver from the bottom 3 teams with most points (can't be from the same team as driverOut)
            const candidates = [];
            for (const tId of bottom3Teams.filter(tid => tid != randomTeam)) {
                if (teamsById[tId]) {
                    for (const [dId, pts] of Object.entries(teamsById[tId].drivers)) {
                        candidates.push({ driverId: dId, points: pts, teamId: tId });
                    }
                }
            }
            candidates.sort((a, b) => b.points - a.points);
            driverIn = candidates[0] ? [candidates[0].driverId, candidates[0].points] : null;
            console.log("Driver OUT:", driverOut, "Driver IN (bottom 3 teams):", driverIn);
            //get the team of the driverIN
            const teamId = candidates[0].teamId;

            //sign a reserve driver from that team
            const reserveDrivers = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID
                FROM Staff_Contracts con
                JOIN Staff_BasicData bas ON con.StaffID = bas.StaffID
                JOIN Staff_DriverData dri ON con.StaffID = dri.StaffID
                WHERE con.TeamID = ${teamId} AND con.ContractType = 1 AND con.PosInTeam > 2`, 'allRows');
            if (reserveDrivers.length) {
                const randomReserve = randomPick(reserveDrivers);
                const [nameFormatted, driverId] = formatNamesSimple(randomReserve);
                driverSubstitute = [nameFormatted, driverId];
                console.log("Driver SUBSTITUTE for driver IN:", driverSubstitute);
            }
            else {
                const freeAgents = queryDB(`SELECT bas.FirstName, bas.LastName, dri.StaffID
                    FROM Staff_BasicData bas
                    JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID
                    JOIN Staff_GameData gd ON bas.StaffID = gd.StaffID
                    WHERE dri.StaffID NOT IN (SELECT StaffID FROM Staff_Contracts)
                    AND gd.Retired = 0`, 'allRows');
                if (freeAgents.length) {
                    for (const fa of freeAgents) {
                        const overall = getDriverOverall(fa[2]);
                        fa.push(overall);
                    }
                    freeAgents.sort((a, b) => b[3] - a[3]);
                    driverSubstitute = [freeAgents[0][2], freeAgents[0][3]];
                    console.log("Driver SUBSTITUTE for driver IN:", driverSubstitute);
                }
            }
        }
    }

    //random day of the currentMonth
    const date = new Date();
    date.setDate(Math.floor(Math.random() * 28) + 1);
    const excelDate = dateToExcel(date);

    let driverOutName = driverOut ? queryDB(`SELECT FirstName, LastName FROM Staff_BasicData WHERE StaffID = ${driverOut[0]}`, 'singleRow') : null;
    driverOutName.push(driverOut[0], driverOut[1]);
    driverOutName = formatNamesSimple(driverOutName || ["Unknown", "Driver"]);

    let driverInName = driverIn ? queryDB(`SELECT FirstName, LastName FROM Staff_BasicData WHERE StaffID = ${driverIn[0]}`, 'singleRow') : null;
    driverInName.push(driverIn[0], driverIn[1]);
    driverInName = formatNamesSimple(driverInName || ["Unknown", "Driver"]);

    let driverSubstituteName = [];
    if (driverSubstitute) {
        console.log("Fetching name for substitute driver:", driverSubstitute);
        driverSubstituteName = queryDB(`SELECT FirstName, LastName FROM Staff_BasicData WHERE StaffID = ${driverSubstitute[0]}`, 'singleRow');
        driverSubstituteName.push(driverSubstitute[0], driverSubstitute[1]);
        driverSubstituteName = formatNamesSimple(driverSubstituteName || ["Unknown", "Driver"]);
    }

    const newData = {
        team: randomTeamName,
        teamId: randomTeam,
        driver_out: driverOutName[0],
        driver_out_id: driverOutName[1],
        driver_in: driverInName[0],
        driver_in_id: driverInName[1],
        driver_substitute: driverSubstituteName ? driverSubstituteName[0] : null,
        driver_substitute_id: driverSubstituteName ? driverSubstituteName[1] : null
    }

    turningPointState.transfers[6] = newData; //tendria que ser currentMonth, pero para pruebas lo dejo fijo en junio

    const title = generateTurningPointTitle(newData, 101, "original");

    const newEntry = {
        id: entryId,
        title,
        image: null,
        data: newData,
        date: excelDate,
        turning_point_type: "original",
        type: "turning_point_transfer"
    };



    return [newEntry];
}

function generateDSQTurningPointNews(racesDone, savednews = {}, turningPointState = {}) {
    const last3Races = racesDone.slice(-3);

    //if the last 3 races are not in turningPointState.checkedRaces, add them, if they all are, return the rray with ilegal races news
    if (turningPointState.checkedRaces && last3Races.every(r => turningPointState.checkedRaces.includes(r))) {
        //for every ilegal race, get savedNews entry
        const ilegalRacesNewsArray = turningPointState.ilegalRaces.map(raceData => {
            const entryId = `turning_point_dsq_${raceData.race_id}`;
            if (savednews[entryId]) {
                return { id: entryId, ...savednews[entryId] };
            }
        });

        return ilegalRacesNewsArray;

    }

    for (const r of last3Races) {
        if (!turningPointState.checkedRaces.includes(r)) {
            turningPointState.checkedRaces.push(r);
        }
    }

    // if (Math.random() > 0.05) return [];

    const raceId = randomPick(last3Races);
    const raceDate = queryDB(`SELECT Day FROM Races WHERE RaceID = ${raceId}`, 'singleValue');
    const teamsWithPoints = queryDB(`SELECT TeamID, SUM(Points) FROM Races_Results WHERE RaceID = ${raceId} AND Points > 0 GROUP BY TeamID`, 'allRows');

    if (!teamsWithPoints.length) return [];
    const teamRow = randomPick(teamsWithPoints);

    const teamId = teamRow[0];
    const teamName = combined_dict[teamId] || "Unknown Team";
    const teamPoints = teamRow[1];

    const entryId = `turning_point_dsq_${raceId}`;
    if (savednews[entryId]) {
        return [{ id: entryId, ...savednews[entryId] }];
    }

    const components = ["Engine brake map", "Fuel flow", "Front wing", "Rear wing", "Diffuser", "Floor", "Brake ducts", "Suspension", "Gearbox", "Cooling system", "Hydraulics", "Clutch", "Turbo", "Battery", "Control electronics"];
    const component = randomPick(components);

    const titleData = {
        team: teamName,
        race_name: getCircuitInfo(raceId).adjective,
        race_id: raceId,
        component: component,
        teamId: teamId
    }

    turningPointState.ilegalRaces.push(titleData);

    const title = generateTurningPointTitle(titleData, 103, "original");
    const image = null;

    const newEntry = {
        id: entryId,
        title,
        image,
        data: titleData,
        date: raceDate + 2,
        turning_point_type: "original",
        type: "turning_point_dsq"
    }


    return [newEntry];
}

function getMaxPointsForRace(raceId, pointsSchema, seasonId = null) {
    let maxPoints = parseInt(pointsSchema.twoBiggestPoints[0])
    let fastestLapPoint = parseInt(pointsSchema.fastestLapBonusPoint)
    let polePositionPoint = parseInt(pointsSchema.polePositionBonusPoint)
    let isLastraceDouble = parseInt(pointsSchema.isLastraceDouble)
    const isSprint = queryDB(`SELECT WeekendType FROM Races WHERE RaceID = ${raceId}`, 'singleValue') === 1;
    const maxSprintPoints = 8;
    const isLastRaceOfSeason = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ${seasonId}`, 'singleValue') === raceId;

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

    const ps = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    if (!ps) return [];
    const currentSeason = ps[1];

    const allSeasonRacesQuery = queryDB(
        `SELECT RaceID, Day, TrackID FROM Races WHERE SeasonID = ${currentSeason} ORDER BY Day ASC`,
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

    for (let i = iStart; i <= lastDoneIdx; i++) {
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

                if (statusAtRace?.clinchThisRace) {
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
    const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ${raceId}`, 'singleRow');
    const code = races_names[parseInt(trackId)];
    if (!code) return "Unknown Circuit";
    return countries_data[code] || code;
}

function randomRemovalOfNames(data) {
    let paramsWithName = ["winnerName", "pole_driver", "driver1", " driver2", "driver3", "driver_name"];
    //if data has any of these params, 50% chance to do split(" ").pop() to retain only last name
    paramsWithName.forEach(param => {
        if (data[param]) {
            if (Math.random() < 0.3) {
                data[param] = data[param].split(" ").pop();
            }
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

export function generateFakeTransferNews(monthsDone, savedNews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const season = daySeason[1];

    fetchSeasonResultsCached(season);
    fetchSeasonResultsCached(season - 1);

    let newsList = [];

    monthsDone.forEach(m => {
        const entryId = `fake_transfer_${m}`;

        if (savedNews[entryId]) {
            newsList.push({ id: entryId, ...savedNews[entryId] });
            return;
        }

        const day = Math.floor(Math.random() * 30) + 1;
        const date = new Date(season, m - 1, day);
        const excelDate = dateToExcel(date);

        let randomDriver, randomTeamId;

        if (Math.random() < 0.5) { //half of the times we randomPick a driver from a worsened team
            let worsened = calculateTeamDropsByDate(season, date);
            let pool = worsened;
            // let worsened = {};
            if (!pool.length) {
                const results = fetchSeasonResults(season);
                const bottomDriversTeams = results.filter(driver => driver[2] > 14).map(driver => driver[1]);
                pool = bottomDriversTeams.map(teamId => ({ teamId }));
            }


            randomTeamId = pool[
                Math.floor(Math.random() * pool.length)
            ].teamId;


            const drivers = queryDB(
                `SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID
                FROM Staff_BasicData bas
                JOIN Staff_DriverData dri
                ON bas.StaffID = dri.StaffID
                JOIN Staff_Contracts con
                ON bas.StaffID = con.StaffID
                WHERE con.TeamID = ${randomTeamId}
                AND con.ContractType = 0
                AND con.PosInTeam <= 2
                `,
                'allRows'
            );
            if (!drivers.length) return;


            randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
        }
        else {
            const top6DriversExpiringContracts = queryDB(
                `SELECT bas.FirstName, bas.LastName, dri.StaffID, con.TeamID
                FROM Staff_BasicData bas
                JOIN Staff_DriverData dri
                ON bas.StaffID = dri.StaffID
                JOIN Staff_Contracts con
                ON bas.StaffID = con.StaffID
                JOIN Races_DriverStandings sta
                ON dri.StaffID = sta.DriverID
                WHERE con.ContractType = 0
                AND con.PosInTeam <= 2
                AND con.EndSeason = ${season}
                AND sta.Position <= 6
                AND sta.RaceFormula = 1
                AND sta.SeasonID = ${season}
                AND NOT EXISTS (
                    SELECT 1
                    FROM Staff_Contracts c3
                    JOIN Staff_DriverData d3
                    ON d3.StaffID = c3.StaffID
                    WHERE c3.TeamID   = con.TeamID
                    AND c3.PosInTeam = con.PosInTeam
                    AND c3.ContractType = 3
                );
                `,
                'allRows'
            );

            if (top6DriversExpiringContracts.length) {
                randomDriver = randomPick(top6DriversExpiringContracts);
                randomTeamId = randomDriver[3];
            }

        }


        if (randomDriver) {
            const [nameFormatted, driverId] = formatNamesSimple(randomDriver);

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
            }

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
    });


    return newsList;
}

const randomPick = arr => arr[Math.floor(Math.random() * arr.length)];

export function generateBigConfirmedTransferNews(savedNews = {}, contracts = [], currentMonth) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const season = daySeason[1];

    const months = [7, 8, 9].filter(m => m < currentMonth);
    const newsList = [];
    if (!months.length || !contracts.length) return newsList;

    // 1) Pilotos ya usados en big transfers guardados
    const used = new Set(
        Object.values(savedNews)
            .filter(n => n?.type === "big_transfer" && n?.data?.driverId != null)
            .map(n => n.data.driverId)
    );



    for (const m of months) {
        const entryId = `big_transfer_${m}`;

        if (savedNews[entryId]) {
            newsList.push({ id: entryId, ...savedNews[entryId] });
            const dId = savedNews[entryId]?.data?.driverId;
            if (dId != null) used.add(dId);
            continue;
        }

        const pool = contracts.filter(c => !used.has(c.driverId));
        if (!pool.length) continue;

        const contract = randomPick(pool);
        used.add(contract.driverId);

        const title = generateTitle(contract, 6);
        const image = getImagePath(contract.teamId, contract.driverId, "transfer");

        //generate a date from the month of the news
        const newsDate = new Date(season, m - 1, Math.floor(Math.random() * 28) + 1);
        const excelDate = dateToExcel(newsDate);

        newsList.push({
            id: entryId,
            type: "big_transfer",
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

export function generateContractRenewalsNews(savedNews = {}, contractRenewals = [], currentMonth) {
    const renewalMonths = [8, 9, 10].filter(m => m < currentMonth);
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
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
        `SELECT Day, CurrentSeason FROM Player_State`,
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
        , 'allRows')

    // contractRenewals.forEach(contract => {
    //     let driverID = contract[2];
    //     const driverOverall = getDriverOverall(driverID);

    //     if (driverOverall < 88) {
    //         contractRenewals = contractRenewals.filter(c => c[2] !== driverID);
    //     }
    // });


    const formattedContracts = contractRenewals.map(contract => {
        const [nameFormatted, driverId, teamId] = formatNamesSimple(contract);
        const currentTeam = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE StaffID = ${driverId} AND ContractType = 0`, 'singleValue');
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
        `SELECT Day, CurrentSeason FROM Player_State`,
        'singleRow'
    )
    const seasonYear = daySeason[1]

    const top5rows = queryDB(
        `SELECT DriverID 
     FROM Races_DriverStandings 
     WHERE RaceFormula = 1 
       AND SeasonID = ${seasonYear} 
     ORDER BY Position 
     LIMIT 5`,
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

    const rows = queryDB(sql, 'allRows')
        .filter(r => {
            const date = excelToDate(r[7])
            return date.getFullYear() === seasonYear
        })

    const formatted = rows.map(r => {
        const [nameFormatted, driverId] = formatNamesSimple(r)
        let actualTeam = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE StaffID = ${[r[2]]} AND ContractType = 0`, 'singleValue')
        actualTeam = combined_dict[actualTeam]
        let driverAtRisk = queryDB(`SELECT bas.FirstName, bas.LastName, con.StaffID, con.TeamID FROM Staff_Contracts con JOIN Staff_BasicData bas ON bas.StaffID = con.StaffID RIGHT JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID WHERE con.TeamID = ${r[3]} AND con.PosInTeam = ${r[5]} AND con.ContractType = 0`, 'singleRow')
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
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
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
        , 'allRows')

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
        const currentTeam = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE StaffID = ${driverId} AND ContractType = 0`, 'singleValue');
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
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const day = daySeason[0];
    const seasonYear = daySeason[1];
    let newsList = [];

    const realDay = excelToDate(day);

    if (realDay.getMonth() + 1 < 8 || (realDay.getMonth() + 1 === 8 && realDay.getDate() < 10)) {
        return null;
    }

    const date = dateToExcel(new Date(seasonYear, 9, 10));

    const validOffers = offers.others.filter(item => item.state !== 'Signed');

    const driversDict = validOffers.reduce((acc, item) => {
        const previousResultsTeam = queryDB(`SELECT SeasonID, Points, Position FROM Races_TeamStandings WHERE TeamID = ${item.actualTeamId}`)
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

    //if 6th september has passed
    if (realDay.getMonth() + 1 < 9 || (realDay.getMonth() + 1 === 9 && realDay.getDate() < 6)) {
        return newsList;
    }

    return newsList

}

export function generateTeamsUpgradesNews(events, savednews) {
    //aparcado de momento
    const globals = getGlobals();
    let teamIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    if (globals.isCreateATeam) {
        teamIds.push(32);
    }

    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const seasonYear = daySeason[1];
    const parts = getAllPartsFromTeam(32);


    events.forEach(raceId => {
        const entryId = `${seasonYear}_upgrades_${raceId}`;

        if (savednews[entryId]) {
            newsList.push({ id: entryId, ...savednews[entryId] });
            return;
        }

        let nextRaceId = raceId + 1;
        let trackIdNextRace = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ${nextRaceId}`, 'singleValue');
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
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
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
                    WHERE sta.SeasonID = ${season} AND sta.RaceFormula = 1
                    AND con.TeamID = ${teamId} AND con.ContractType = 0 AND con.PosInTeam <= 2
                    ORDER BY sta.Position`, 'allRows');
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
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
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

        const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ${raceId}`, 'singleRow');
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

        const date = queryDB(`SELECT Day FROM Races WHERE RaceID = ${raceId}`, 'singleValue');

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

export function generateQualifyingResultsNews(events, savednews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
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

        const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ${raceId}`, 'singleRow');
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

        const date = queryDB(`SELECT Day FROM Races WHERE RaceID = ${raceId}`, 'singleValue') - 1;

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
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const nRaces = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ${daySeason[1]}`, 'singleValue');
    let racesInterval = nRaces / 3;
    const racesCompleted = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ${daySeason[1]} AND State = 2`, 'singleValue');
    let newsList = [];
    const firstRaceSeasonId = queryDB(`SELECT MIN(RaceID) FROM Races WHERE SeasonID = ${daySeason[1]}`, 'singleValue');
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

        const dates = queryDB(`SELECT Day FROM Races WHERE RaceID IN (${raceIdInPoint}, ${nextRace})`, 'allRows');
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

    const season = queryDB(`SELECT SeasonID FROM Races WHERE RaceID = ${raceId}`, 'singleRow');

    const seasonResults = fetchQualiResults(season, true);

    const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, raceId);

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

    const numberOfRaces = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ${season}`, 'singleRow')[0];

    return {
        details: poleDetails,
        driverStandings,
        teamStandings,
        driversResults,
        racesNames,
        champions,
        nRaces: numberOfRaces
    }
}

export function getOneRaceDetails(raceId) {
    const results = getOneRaceResults(raceId);
    if (!results.length) return {};

    const sprintResults = getOneRaceResults(raceId, true);

    const season = queryDB(`SELECT SeasonID FROM Races WHERE RaceID = ${raceId}`, 'singleRow');

    const seasonResults = fetchSeasonResults(season);

    const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, raceId);

    // 1) Obtenemos time y laps del ganador (primera fila)
    const winnerTime = results[0][10]; // índice 10 = res.Time
    const winnerLaps = results[0][11]; // índice 11 = res.Laps

    const raceDetails = results.map(row => {
        const [nameFormatted, driverId, teamId] = formatNamesSimple(row);
        const time = row[10];
        const laps = row[11];


        const gapToWinner = time - winnerTime;
        const gapLaps = winnerLaps - laps

        return {
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
        };
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

    const numberOfRaces = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ${season}`, 'singleRow')[0];

    return {
        details: raceDetails,
        driverStandings,
        teamStandings,
        driversResults,
        racesNames,
        champions,
        nRaces: numberOfRaces,
        sprintDetails
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
    WHERE res.RaceID = ${raceId}
    ${sprint ? "AND res.RaceFormula = 1" : ""}
    ORDER BY res.FinishingPos
  `;
    const rows = queryDB(sql, 'allRows');

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
        WHERE res.RaceID = ${raceId}
        AND res.RaceFormula = 1
        AND res.QualifyingStage =
        (SELECT MAX(res2.QualifyingStage)
        FROM Races_QualifyingResults res2
        WHERE res2.RaceID = ${raceId} AND res2.DriverID = res.DriverID)
        AND SprintShootout = 0
        ORDER BY res.FinishingPos;
    `

    const rows = queryDB(sql, 'allRows');

    return rows;
}

function rebuildStandingsUntil(seasonResults, raceId, includeCurrentRace = false) {
    // 4) Acumulamos puntos por piloto y por equipo
    const driverMap = {};
    const teamMap = {};
    let racesNames = []
    const driversResults = []

    seasonResults.forEach(driverRec => {
        const name = driverRec[0];
        let resultsString = ""
        let driverRaces = []
        let nPodiums = 0;
        let nWins = 0;
        let nPointsFinishes = 0;

        // obtenemos sólo las carreras hasta esta (de la 3ª columna en adelante)
        const races = driverRec.slice(3);

        // sumatorio de puntos (+fastLapPoint) si r[0] <= raceId
        const totalDriverPoints = races.reduce((sum, r) => {
            const thisRaceId = Number(r[0]);
            if (thisRaceId <= raceId) {
                if (thisRaceId < raceId || includeCurrentRace) {
                    driverRaces.push(getCircuitInfo(thisRaceId).country);
                    resultsString += `${parseInt(r[1]) !== -1 ? `P${r[1]}` : "DNF"}, `;
                    if (parseInt(r[1]) === 1) nWins++;
                    if (parseInt(r[1]) <= 3 && parseInt(r[1]) > 0) nPodiums++;
                    if (parseInt(r[2]) > 0) nPointsFinishes++;
                }
                const pts = r[2] > 0 ? r[2] : 0;
                const sprintPts = r.length >= 9 ? r[7] : 0;
                return sum + pts + sprintPts;
            }


            return sum;
        }, 0);

        //remove the last comma and space from resultsString
        if (resultsString.length > 0) {
            resultsString = resultsString.slice(0, -2);
        }

        if (driverRaces.length > racesNames.length) {
            racesNames = driverRaces;
        }

        driverMap[name] = {
            name: news_insert_space(name),
            points: totalDriverPoints,
            teamId: driverRec[1],
        };

        driversResults.push({
            name: news_insert_space(name),
            resultsString,
            nPodiums,
            nWins,
            teamId: driverRec[1],
            nPointsFinishes
        });

        // por cada carrera sumo también al equipo que corrió esa carrera
        races.forEach(r => {
            const thisRaceId = Number(r[0]);
            if (thisRaceId <= raceId) {
                const teamId = r[r.length - 1];
                const pts = r[2] > 0 ? r[2] : 0;
                const sprintPts = r.length >= 9 ? r[7] : 0;
                teamMap[teamId] = (teamMap[teamId] || 0) + pts + sprintPts;
            }
        });
    });

    const driverStandings = Object.values(driverMap)
        .sort((a, b) => b.points - a.points);

    const teamStandings = Object.entries(teamMap)
        .map(([teamId, points]) => ({ teamId: Number(teamId), points }))
        .sort((a, b) => b.points - a.points);

    return {
        driverStandings,
        teamStandings,
        driversResults,
        racesNames
    }
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
        AND sta.SeasonID < ${seasonId}
    `;
    const rows = queryDB(sql, 'allRows');

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
        const useGeneric = Math.random() > 0.35;
        if (useGeneric) {
            const randomNum = getRandomInt(1, 9);
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
    else if (type === "teamComparison") {
        return `./assets/images/news/${team_dict[teamId]}_factory.webp`;
    }
    else if (type === "season_review") {
        //number bnetween 1 and 8 included 8
        const randomNum = getRandomInt(1, 8);
        return `./assets/images/news/${randomNum}_shot.webp`;
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
        `SELECT COUNT(*) FROM Races WHERE SeasonID = ${season} AND RaceID <= ${lastRaceId}`,
        'singleValue'
    );
    const firstRacePrevSeason = queryDB(
        `SELECT MIN(RaceID) FROM Races WHERE SeasonID = ${season - 1}`,
        'singleValue'
    );
    const lastYearEquivalent = firstRacePrevSeason + (racesCount - 1);

    // Usa versiones cacheadas
    const currentResults = fetchSeasonResultsCached(season);
    const lastYearResults = fetchSeasonResultsCached(season - 1);

    const currentStandings = rebuildStandingsUntilCached(season, currentResults, lastRaceId);
    const lastYearStandings = rebuildStandingsUntilCached(season - 1, lastYearResults, lastYearEquivalent);

    const drops = currentStandings.teamStandings.map(team => {
        const prev = lastYearStandings.teamStandings.find(t => t.teamId === team.teamId);
        const prevPoints = prev ? prev.points : 0;
        return { teamId: team.teamId, drop: prevPoints - team.points };
    })

    _dropsCache.set(dropKey, drops);
    return drops;
}

export function getTransferDetails(drivers, date = null) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const driverMap = []
    drivers.forEach(d => {
        const previousResultsTeam = queryDB(`SELECT SeasonID, Points, Position FROM Races_TeamStandings WHERE TeamID = ${d.teamId}`)
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
        const lastRaceIdThisSeason = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ${daySeason[1]} AND State = 2`, 'singleValue');
        objRace = lastRaceIdThisSeason
    }
    else {
        objRace = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ${daySeason[1]} AND State = 2 AND Day <= '${date}'`, 'singleValue');
    }

    const seasonResults = fetchSeasonResults(daySeason[1]);
    const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, objRace);

    return {
        driverMap,
        driverStandings,
        teamStandings
    }
}

export function getTeamComparisonDetails(teamId, season, date) {
    const lastRaceBeforeDate = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ${season} AND Day < '${date}'`, 'singleValue');
    const seasonResults = fetchSeasonResults(season);
    const lastSeasonResults = fetchSeasonResults(season - 1);
    const {
        driverStandings: currentDriverStandings,
        teamStandings: currentTeamStandings,
        driversResults: currentDriversResults,
        racesNames: currentRacesNames
    } = rebuildStandingsUntil(seasonResults, lastRaceBeforeDate, true);

    const racesCount = queryDB(
        `SELECT COUNT(*) FROM Races WHERE SeasonID = ${season} AND RaceID <= ${lastRaceBeforeDate}`,
        'singleValue'
    );

    const firstRacePrevSeason = queryDB(
        `SELECT MIN(RaceID) FROM Races WHERE SeasonID = ${season - 1}`,
        'singleValue'
    );

    const lastYearEquivalent = firstRacePrevSeason + (racesCount - 1);

    const {
        driverStandings: oldDriverStandings,
        teamStandings: oldTeamStandings,
        driversResults: oldDriversResults,
        racesNames: oldRacesNames
    } = rebuildStandingsUntil(lastSeasonResults, lastYearEquivalent, true);

    const previousResultsTeam = queryDB(`SELECT SeasonID, Points, Position FROM Races_TeamStandings WHERE TeamID = ${teamId}`)
        .map(r => {
            return {
                season: r[0],
                points: r[1],
                position: r[2]
            }
        });

    return {
        currentDriverStandings,
        currentTeamStandings,
        currentDriversResults,
        oldDriverStandings,
        oldTeamStandings,
        oldDriversResults,
        currentRacesNames,
        oldRacesNames,
        previousResultsTeam
    };
}

export function getFullChampionSeasonDetails(season) {
    const seasonResults = fetchSeasonResults(season);
    const qualiResults = fetchQualiResults(season);
    const lastRaceId = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ${season} AND State = 2`, 'singleValue');
    const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, lastRaceId, true);
    const { driverStandings: qualiDriverStandings, teamStandings: qualiTeamStandings, driversResults: driverQualiResults, racesNames: qualiRacesNames } = rebuildStandingsUntil(qualiResults, lastRaceId, true);
    const champions = getLatestChampions(season);

    const racesCompleted = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ${season} AND State = 2`, 'singleValue');

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
        carsPerformance: remapped
    }

}

export function getPreviouslyDrivenTeams(driverId) {
    //select distinct from every race that is not raceID 122 or raceID 124
    const sql = `
        SELECT DISTINCT TeamID, Season
        FROM Races_Results
        WHERE DriverID = ${driverId} AND RaceID NOT IN (122, 124, 100, 101)
    `
    const rows = queryDB(sql, 'allRows');
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

function getBasePointsForPos(pos, pointsTable, doublePoints) {
    const base = pointsTable.get(pos) ?? 0;
    return doublePoints ? base * 2 : base;
}

// ---- Fastest Lap (FastestLap en segundos) ----
function getFastestLapHolderBySeconds(raceId, queryDB) {
    const row = queryDB(`
    SELECT DriverID 
    FROM Races_Results
    WHERE RaceID = ${raceId} AND FastestLap IS NOT NULL AND FastestLap > 0
    ORDER BY FastestLap ASC
    LIMIT 1
  `, 'singleRow');
    return row ? Number(row[0]) : null;
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
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const seasonId = daySeason?.[1];

    // 1) Config de puntos
    const pointsTable = buildPointsTable(pointsReg.positionAndPoints);
    const flEnabled = Number(pointsReg.fastestLapBonusPoint) === 1;
    const doublePts = pointsReg.isLastraceDouble ? true : false; //falta añadir que si la regulacion esta activa Y ES LA ULTIMA CARRERA

    // 2) Estado inicial de la carrera
    const allRes = queryDB(`
    SELECT DriverID, TeamID, FinishingPos, Points, IFNULL(DNF,0) AS DNF, FastestLap
    FROM Races_Results
    WHERE RaceID = ${raceId}
    ORDER BY FinishingPos ASC
  `, 'allRows') || [];
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
    WHERE RaceID = ${raceId}
  `);

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

    // Clasificados: posiciones 1..K + puntos
    for (const r of classified) {
        const driverId = Number(r[0]);
        const pts = getBasePointsForPos(pos, pointsTable, doublePts);
        afterRacePoints.set(driverId, pts);
        queryDB(`
      UPDATE Races_Results
      SET FinishingPos = ${pos}, Points = ${pts}, DNF = 0
      WHERE RaceID = ${raceId} AND DriverID = ${driverId}
    `);
        pos++;
    }

    // DNFs no DSQ: van detrás de clasificados, sin puntos
    for (const r of dnfsOther) {
        const driverId = Number(r[0]);
        afterRacePoints.set(driverId, 0);
        queryDB(`
      UPDATE Races_Results
      SET FinishingPos = ${pos}, Points = 0, DNF = 1
      WHERE RaceID = ${raceId} AND DriverID = ${driverId}
    `);
        pos++;
    }

    // DSQ del equipo: los dos últimos
    for (let i = 0; i < dsqSorted.length; i++) {
        const driverId = Number(dsqSorted[i][0]);
        afterRacePoints.set(driverId, 0);
        queryDB(`
      UPDATE Races_Results
      SET FinishingPos = ${pos}, Points = 0, DNF = 1
      WHERE RaceID = ${raceId} AND DriverID = ${driverId}
    `);
        pos++;
    }

    // 4) BONUS VUELTA RÁPIDA (si habilitado y el portador queda top-10 y DNF=0)
    if (flEnabled) {
        const flDriver = getFastestLapHolderBySeconds(raceId, queryDB);
        if (flDriver != null && !dsqIds.has(flDriver)) {
            const row = queryDB(`
        SELECT FinishingPos, IFNULL(DNF,0)
        FROM Races_Results
        WHERE RaceID = ${raceId} AND DriverID = ${flDriver}
      `, 'singleRow');
            const fPos = Number(row?.[0] ?? 9999);
            const fDNF = Number(row?.[1] ?? 0);

            if (fDNF === 0 && fPos <= 10) {
                const bonus = doublePts ? 2 : 1; // si en tu norma el bonus no dobla, pon 1 fijo
                const base = afterRacePoints.get(flDriver) ?? 0;
                const withBonus = base + bonus;
                afterRacePoints.set(flDriver, withBonus);
                queryDB(`
          UPDATE Races_Results
          SET Points = ${withBonus}
          WHERE RaceID = ${raceId} AND DriverID = ${flDriver}
        `);
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
        SET Points = Points + ${delta}
        WHERE SeasonID = ${seasonId} AND DriverID = ${driverId}
      `);
        }
        teamDelta.set(team, (teamDelta.get(team) || 0) + delta);
    }

    if (seasonId != null) {
        for (const [team, delta] of teamDelta.entries()) {
            if (delta !== 0) {
                queryDB(`
          UPDATE Races_TeamStandings
          SET Points = Points + ${delta}
          WHERE SeasonID = ${seasonId} AND TeamID = ${team}
        `);
            }
        }
    }
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
