import { fetchEventsDoneFrom, formatNamesSimple, fetchEventsDoneBefore } from "./dbUtils";
import { races_names, countries_dict, countries_data, getParamMap, team_dict, combined_dict, opinionDict, getUpdatedName } from "../../frontend/config";
import newsTitleTemplates from "../../../data/news/news_titles_templates.json";
import { fetchSeasonResults, fetchQualiResults } from "./dbUtils";
import { queryDB } from "../dbManager";
import { excelToDate, dateToExcel } from "./eidtStatsUtils";
import { getTier, getDriverOverall } from "./transferUtils";




export function generate_news(savednews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const racesDone = fetchEventsDoneFrom(daySeason[1]);
    const currentDate = excelToDate(daySeason[0]);
    const currentMonth = currentDate.getMonth() + 1;
    const rumorMonths = [2, 3, 4, 5, 6, 7];
    const monthsDone = rumorMonths.filter(m => m < currentMonth);

    const raceNews = generateRaceResultsNews(racesDone, savednews);
    const qualiNews = generateQualifyingResultsNews(racesDone, savednews);


    const sillySeasonNews = generateTransferRumorsNews(getTrueTransferRumors(), savednews);
    const fakeTransferNews = getFakeTransferNews(monthsDone, savednews);

    let newsList = [...raceNews, ...qualiNews, ...fakeTransferNews];
    if (sillySeasonNews) {
        newsList.push(sillySeasonNews);
    }
    //order by date descending
    newsList.sort((a, b) => b.date - a.date);
    return newsList;
}


export function getCircuitInfo(raceId) {
    const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ${raceId}`, 'singleRow');
    const code = races_names[parseInt(trackId)];
    if (!code) return "Unknown Circuit";
    return countries_data[code] || code;
}


function generateTitle(data, new_type) {
    const templateObj = newsTitleTemplates.find(t => t.new_type === new_type);
    let raceInfo = null;
    if (data.raceId) {
        raceInfo = getCircuitInfo(data.raceId);
        data.circuit = raceInfo.circuit;
        data.country = raceInfo.country;
        data.adjective = raceInfo.adjective;
    }
    console.log("Data", data);
    const paramMap = getParamMap(data);

    const titles = templateObj.titles;
    const idx = Math.floor(Math.random() * titles.length);
    const tpl = titles[idx];

    return tpl.replace(/{{\s*(\w+)\s*}}/g, (_, key) => paramMap[new_type][key] || '');
}

export function getFakeTransferNews(monthsDone, savedNews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const seasonResults = fetchSeasonResults(daySeason[1]);
    const firstRaceIdLastyear = queryDB(`SELECT MIN(RaceID) FROM Races WHERE SeasonID = ${daySeason[1] - 1}`, 'singleValue');

    const lastYearResults = fetchSeasonResults(daySeason[1] - 1);

    let newsList = [];
    monthsDone.forEach(m => {
        const entryId = `fake_transfer_${m}`;

        const day = Math.floor(Math.random() * 30) + 1;
        const date = new Date(daySeason[1], m, day);
        const excelDate = dateToExcel(date);
        const racesDone = fetchEventsDoneBefore(daySeason[1], excelDate);
        if (!racesDone.length) return;
        const lastRaceId = racesDone[racesDone.length - 1];

        const nraceInCalendar = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ${daySeason[1]} AND RaceID <= ${lastRaceId}`, 'singleValue');
        const lastYearEquivalent = firstRaceIdLastyear + (nraceInCalendar - 1);

        
        const actualStandings = rebuildStandingsUntil(seasonResults, lastRaceId);
        const lastYearStandings = rebuildStandingsUntil(lastYearResults, lastYearEquivalent);

        console.log(actualStandings.teamStandings);
        console.log(lastYearStandings.teamStandings);


        const drops = actualStandings.teamStandings.map((team, i) => {
            //lastYearTeam is the team with the same TeamId
            const lastYearTeam = lastYearStandings.teamStandings.find(t => t.teamId === team.teamId);
            const drop = lastYearTeam
                ? lastYearTeam.points - team.points
                : 0;
            return {
                teamId: team.teamId,
                drop: drop
            }
        });

        const worsened = drops.filter(x => x.drop > 0);

        //from the 3 teams that drop if a higher number of points, get a random one
        const sortedDrops = worsened.sort((a, b) => b.drop - a.drop)
        if (sortedDrops.length === 0) return;
        const randomTeamId = sortedDrops[Math.floor(Math.random() * sortedDrops.length)].teamId;

        //get drivers from the team
        const drivers = actualStandings.driverStandings.filter(d => d.teamId === randomTeamId);
        const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];

        console.log("Random Driver", randomDriver);

        const titleData = {
            driver1: randomDriver.name,
            team1: getUpdatedName(randomDriver.teamId),
        }

        const title = generateTitle(titleData, 7);

        const newsEntry = {
            id: entryId,
            type: "fake_transfer",
            title: title,
            date: date,
            image: null,
            overlay: "fake_transfer",
            data: null,
            text: null
        };

        newsList.push(newsEntry);
    })

    return newsList;
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
        ofe.ExpirationDay
    FROM Staff_BasicData bas
    RIGHT JOIN Staff_DriverData dri
        ON bas.StaffID = dri.StaffID
    JOIN Staff_ContractOffers ofe
        ON bas.StaffID = ofe.StaffID
    JOIN Staff_Enum_ContractState enu
        ON ofe.ContractState = enu.Value
    WHERE ofe.PosInTeam <= 2
    `

    const rows = queryDB(sql, 'allRows')
        .filter(r => {
            const date = excelToDate(r[7])
            return date.getFullYear() === seasonYear
        })

    const formatted = rows.map(r => {
        const [nameFormatted, driverId] = formatNamesSimple(r)
        let actualTeam = queryDB(`SELECT TeamID FROM Staff_Contracts WHERE StaffID = ${[r[2]]} AND ContractType = 0`, 'singleValue')
        actualTeam = getUpdatedName(actualTeam)
        return {
            name: news_insert_space(nameFormatted),
            driverId,
            actualTeam,
            potentialTeam: getUpdatedName(r[3]),
            state: r[6],
            offerDay: excelToDate(r[7]),
            expirationDate: excelToDate(r[12]),
            posInTeam: r[5],
            salary: r[8],
            salaryOpinion: opinionDict[r[9]],
            endSeason: r[10],
            lengthOpinion: opinionDict[r[11]],
            overall: getDriverOverall(driverId),
        }
    })


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

    console.log("RUMORES ÚNICOS TIER 1 / TOP 5:", tier1OrTop5)
    console.log("RUMORES ÚNICOS RESTANTES:", others)

    return {
        tier1OrTop5,
        others
    }
}

export function generateTransferRumorsNews(offers, savedNews) {
    if (!offers) return null;
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const day = daySeason[0];
    const seasonYear = daySeason[1];

    //get excelDate from 10th august with dateToExcel
    const date = dateToExcel(new Date(seasonYear, 8, 10));

    const validOffers = offers.others.filter(item => item.state !== 'Signed');

    const driversDict = validOffers.reduce((acc, item) => {
        const {
            driverId,
            name,
            overall,
            actualTeam,
            ...offerDetails
        } = item;

        if (!acc[driverId]) {
            acc[driverId] = {
                driverId,
                name,
                overall,
                actualTeam,
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

    console.log("TOP 3 DRIVERS", top3Drivers)

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



    const sillySeasonNew = {
        id: sillySeasonRumorsId,
        type: "silly_season_rumors",
        title: title,
        date: date,
        image: null,
        overlay: null,
        data: driversDict,
        text: null
    };


    return sillySeasonNew;
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

        const image = getImagePath(formatted[0].teamId, code);

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

        const image = getImagePath(formatted[0].teamId, `${code}_car`);

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

function news_insert_space(str) {
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
        ORDER BY res.FinishingPos;
    `

    const rows = queryDB(sql, 'allRows');

    return rows;
}

function rebuildStandingsUntil(seasonResults, raceId) {
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
                if (thisRaceId < raceId) {
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
            teamId: driverRec[1]
        };

        driversResults.push({
            name: news_insert_space(name),
            resultsString,
            nPodiums,
            nWins,
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

function getImagePath(teamId, code) {
    // Si el teamId es 32, usar directamente el code
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

    // Definir la cantidad máxima de imágenes por equipo
    const maxImages = {
        'fe': 5, 'mc': 2, 'rb': 4, 'me': 4, 'al': 2, 'wi': 3,
        'ha': 2, 'at': 2, 'af': 2, 'as': 2, 'ct': 2, 'f2': 2, 'f3': 2
    };

    // Obtener el número aleatorio para el archivo
    const max = maxImages[teamName] || 1;
    const randomNum = getRandomInt(1, max);

    return `./assets/images/news/${teamName}${randomNum}.webp`;
}



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}