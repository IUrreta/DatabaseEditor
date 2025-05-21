import { fetchEventsDoneFrom, formatNamesSimple, fetchEventsDoneBefore } from "./dbUtils";
import { races_names, countries_dict, countries_data, getParamMap, team_dict, combined_dict, opinionDict } from "../../frontend/config";
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
    console.log("Silly Season News", sillySeasonNews);
    const fakeTransferNews = generateFakeTransferNews(monthsDone, savednews);

    let newsList = [...raceNews, ...qualiNews, ...fakeTransferNews];

    if (sillySeasonNews) {
        sillySeasonNews.forEach((entry) => 
            newsList.push(entry)
        );
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
    const paramMap = getParamMap(data);

    const titles = templateObj.titles;
    const idx = Math.floor(Math.random() * titles.length);
    const tpl = titles[idx];

    return tpl.replace(/{{\s*(\w+)\s*}}/g, (_, key) => paramMap[new_type][key] || '');
}

export function generateFakeTransferNews(monthsDone, savedNews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const season = daySeason[1];

    let newsList = [];

    monthsDone.forEach(m => {
        const entryId = `fake_transfer_${m}`;

        if (savedNews[entryId]) {
            newsList.push({ id: entryId, ...savedNews[entryId] });
            return;
        }

        const day = Math.floor(Math.random() * 30) + 1;
        const date = new Date(season, m, day);
        const excelDate = dateToExcel(date);

        const worsened = calculateTeamDropsByDate(season, date);
        if (!worsened.length) return;

        const randomTeamId = worsened[
            Math.floor(Math.random() * worsened.length)
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


        const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];

        const [nameFormatted, driverId] = formatNamesSimple(randomDriver);


        const newData = {
            drivers: [{
                name: news_insert_space(nameFormatted),
                driverId,
                team: combined_dict[randomTeamId],
                teamId: randomTeamId,
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
            overlay: "fake_transfer",
            data: newData,
            text: null
        });
    });

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

export function generateTransferRumorsNews(offers, savedNews) {
    if (!offers) return null;
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const day = daySeason[0];
    const seasonYear = daySeason[1];
    let newsList = [];

    const realDay = excelToDate(day);

    if (realDay.getMonth() + 1 < 8  || (realDay.getMonth() + 1 === 8  && realDay.getDate() < 10)) {
        return null;
    }

    const date = dateToExcel(new Date(seasonYear, 8, 10));

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

    const driversArray = Object.values(driversDict);

    const image = getImagePath(top3Drivers[0].teamId, top3Drivers[0].driverId, "transfer_generic");

    const sillySeasonNew = {
        id: sillySeasonRumorsId,
        type: "silly_season_rumors",
        title: title,
        date: date,
        season: seasonYear,
        image: image,
        overlay: "silly_season",
        data: {drivers: driversArray},
        text: null
    };


    newsList.push(sillySeasonNew);

    //if 6th september has passed
    if (realDay.getMonth() + 1 < 9 || (realDay.getMonth() + 1 === 9 && realDay.getDate() < 6)) {
       return newsList;
    }

    return newsList
    
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

function getImagePath(teamId, code, type) {
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
    else if (type === "transfer"){
        const useGeneric = Math.random() > 0.35;
        if (useGeneric){
            const randomNum = getRandomInt(1, 9);
            return `./assets/images/news/con${randomNum}.webp`;
        }
        else{
            return `./assets/images/news/${code}_pad.webp`;
        }
    }
    else if (type === "transfer_generic"){
        const randomNum = getRandomInt(1, 9);
        return `./assets/images/news/con${randomNum}.webp`;
    }
}

export function calculateTeamDropsByDate(season, date) {
    const excelDate = dateToExcel(date);

    const racesDone = fetchEventsDoneBefore(season, excelDate);
    if (!racesDone.length) return [];

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

    const currentResults = fetchSeasonResults(season);
    const lastYearResults = fetchSeasonResults(season - 1);

    const currentStandings = rebuildStandingsUntil(currentResults, lastRaceId);
    const lastYearStandings = rebuildStandingsUntil(lastYearResults, lastYearEquivalent);

    const drops = currentStandings.teamStandings.map(team => {
        const prev = lastYearStandings.teamStandings.find(t => t.teamId === team.teamId);
        const prevPoints = prev ? prev.points : 0;
        return {
            teamId: team.teamId,
            drop: prevPoints - team.points
        };
    });

    return drops.filter(x => x.drop > 0);
}

export function getTransferDetails(drivers) {
    console.log("Drivers", drivers);
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
            potentialTeam: d.potentialTeam ? combined_dict[d.potentialTeam] : null
        })

    })

    const lastRaceIdThisSeason = queryDB(`SELECT MAX(RaceID) FROM Races WHERE SeasonID = ${daySeason[1]} AND State = 2`, 'singleValue');
    const seasonResults = fetchSeasonResults(daySeason[1]);
    const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, lastRaceIdThisSeason);

    return {
        driverMap,
        driverStandings,
        teamStandings
    }
}

export function getPreviouslyDrivenTeams(driverId) {
    const sql = `
        SELECT DISTINCT TeamID, Season
        FROM Races_Results
        WHERE DriverID = ${driverId}
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



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}