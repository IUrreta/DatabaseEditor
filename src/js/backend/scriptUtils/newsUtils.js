import { fetchEventsDoneFrom, formatNamesSimple } from "./dbUtils";
import { races_names, countries_dict, countries_data, getParamMap, team_dict } from "../../frontend/config";
import newsTitleTemplates from "../../../data/news/news_titles_templates.json";
import { fetchSeasonResults } from "./dbUtils";
import { queryDB } from "../dbManager";





export function generate_news(savednews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const racesDone = fetchEventsDoneFrom(daySeason[1]);
    const raceNews = generateRaceResultsNews(racesDone, savednews);
    const qualiNews = generateQualifyingResultsNews(racesDone, savednews);
    console.log("QUALI NEWS")
    console.log(qualiNews);
    const newsList = [...raceNews, ...qualiNews];
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
    const raceInfo = getCircuitInfo(data.raceId);
    const paramMap = getParamMap(data, raceInfo);

    const titles = templateObj.titles;
    const idx = Math.floor(Math.random() * titles.length);
    const tpl = titles[idx];

    return tpl.replace(/{{\s*(\w+)\s*}}/g, (_, key) => paramMap[new_type][key] || '');
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

        const newsEntry = {
            id: entryId,
            type: "race_result",
            title: title,
            date: daySeason[0],
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

        const newsEntry = {
            id: entryId,
            type: "race_result",
            title: title,
            date: daySeason[0],
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