import { fetchEventsDoneFrom, formatNamesSimple } from "./dbUtils";
import { races_names, countries_dict, countries_data } from "../../frontend/config";
import newsTitleTemplates from "../../../data/news/news_titles_templates.json";
import { fetchSeasonResults } from "./dbUtils";
import { queryDB } from "../dbManager";
import { data } from "autoprefixer";
import { track } from "@vercel/analytics";




export function generate_news(savednews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const racesDone = fetchEventsDoneFrom(daySeason[1]);
    const raceNews = generateRaceResultsNews(racesDone, savednews);
    return raceNews;
}


export function getCircuitInfo(raceId) {
    const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ${raceId}`, 'singleRow');
    const code = races_names[parseInt(trackId)];
    if (!code) return "Unknown Circuit";
    return countries_data[code] || code;
}


function generateRaceResultTitle(raceId, seasonYear, winnerName) {
    const templateObj = newsTitleTemplates.find(t => t.id === "race_result");
    const raceInfo = getCircuitInfo(raceId);
    if (!templateObj || !Array.isArray(templateObj.titles) || templateObj.titles.length === 0) {
        // fallback
        return `${winnerName} wins the ${seasonYear} ${raceInfo.country} Grand Prix`;
    }

    const titles = templateObj.titles;
    const idx = Math.floor(Math.random() * titles.length);
    const tpl = titles[idx];

    console.log
    return tpl
        .replace(/{{\s*winner\s*}}/g, winnerName)
        .replace(/{{\s*season_year\s*}}/g, seasonYear)
        .replace(/{{\s*circuit\s*}}/g, raceInfo.circuit)
        .replace(/{{\s*country\s*}}/g, raceInfo.country)
        .replace(/{{\s*adjective\s*}}/g, raceInfo.adjective);
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

        console.log("Formatted")
        console.log(formatted);

        const podium = formatted.filter(r => r.pos <= 3);

        const winnerEntry = podium.find(r => r.pos === 1);
        const winnerName = winnerEntry ? winnerEntry.name : "Unknown";

        const title = generateRaceResultTitle(raceId, seasonYear, winnerName);

        const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ${raceId}`, 'singleRow');
        const code = races_names[parseInt(trackId)];

        const image = `./assets/images/news/${code.toLowerCase()}.webp`;

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

    const season = queryDB(`SELECT SeasonID FROM Races WHERE RaceID = ${raceId}`, 'singleRow');

    const seasonResults = fetchSeasonResults(season);

    const { driverStandings, teamStandings, driversResults, racesNames } = rebuildStandingsUntil(seasonResults, raceId);

    // 1) Obtenemos time y laps del ganador (primera fila)
    const winnerTime = results[0][10]; // índice 10 = res.Time
    const winnerLaps = results[0][11]; // índice 11 = res.Laps

    const details = results.map(row => {
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

    const champions = getLatestChampions(season);

    const numberOfRaces = queryDB(`SELECT COUNT(*) FROM Races WHERE SeasonID = ${season}`, 'singleRow')[0];

    return {
        details,
        driverStandings,
        teamStandings,
        driversResults,
        racesNames,
        champions,
        nRaces : numberOfRaces,
    }
}


function getOneRaceResults(raceId) {
    const sql = `
    SELECT 
      bas.FirstName, 
      bas.LastName, 
      res.DriverID, 
      res.TeamID,
      res.FinishingPos,
      res.StartingPos,
      res.Points,
      res.DNF,
      res.SafetyCarDeployments,
      res.VirtualSafetyCarDeployments,
      res.Time,
      res.Laps
    FROM Staff_BasicData bas
    JOIN Races_Results res 
      ON bas.StaffID = res.DriverID
    WHERE res.RaceID = ${raceId}
    ORDER BY res.FinishingPos
  `;
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

        // obtenemos sólo las carreras hasta esta (de la 3ª columna en adelante)
        const races = driverRec.slice(3);

        // sumatorio de puntos (+fastLapPoint) si r[0] <= raceId
        const totalDriverPoints = races.reduce((sum, r) => {
            const thisRaceId = Number(r[0]);
            if (thisRaceId <= raceId) {
                if (thisRaceId < raceId) {
                    driverRaces.push(getCircuitInfo(thisRaceId).country);
                    resultsString += `${parseInt(r[1]) !== -1 ? `P${r[1]}` : "DNF"}, `;
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
            resultsString        
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