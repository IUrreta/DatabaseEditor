import { fetchEventsDoneFrom, formatNamesSimple } from "./dbUtils";
import { races_names, countries_dict } from "../../frontend/config";
import newsTitleTemplates from "../../../data/news/news_titles_templates.json";
import { queryDB } from "../dbManager";
import { data } from "autoprefixer";
import { track } from "@vercel/analytics";




export function generate_news(savednews) {
    const daySeason = queryDB(`SELECT Day, CurrentSeason FROM Player_State`, 'singleRow');
    const racesDone = fetchEventsDoneFrom(daySeason[1]);
    const raceNews = generateRaceResultsNews(racesDone, savednews);
    return raceNews;
}


export function getCircuitName(raceId) {
    const trackId = queryDB(`SELECT TrackID FROM Races WHERE RaceID = ${raceId}`, 'singleRow');
    const code = races_names[parseInt(trackId)];
    if (!code) return "Unknown Circuit";
    const key = code.toLowerCase() + "0";
    return countries_dict[key] || code;
}


function generateRaceResultTitle(raceId, seasonYear, winnerName) {
    const templateObj = newsTitleTemplates.find(t => t.id === "race_result");
    if (!templateObj || !Array.isArray(templateObj.titles) || templateObj.titles.length === 0) {
        // fallback
        return `${winnerName} wins the ${seasonYear} ${getCircuitName(raceId)} Grand Prix`;
    }

    const titles = templateObj.titles;
    const idx = Math.floor(Math.random() * titles.length);
    const tpl = titles[idx];

    return tpl
        .replace(/{{\s*winner\s*}}/g, winnerName)
        .replace(/{{\s*season_year\s*}}/g, seasonYear)
        .replace(/{{\s*circuit\s*}}/g, getCircuitName(raceId));
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
    if (!results.length) return [];

    // 1) Obtenemos time y laps del ganador (primera fila)
    const winnerTime = results[0][10]; // índice 10 = res.Time
    const winnerLaps = results[0][11]; // índice 11 = res.Laps

    // 2) Mappeamos incluyendo gapToWinner
    return results.map(row => {
        const [nameFormatted, driverId, teamId] = formatNamesSimple(row);
        const time = row[10];
        const laps = row[11];


        const gapToWinner = time - winnerTime;
        const gapLaps = winnerLaps - laps

        return {
            name: nameFormatted,
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