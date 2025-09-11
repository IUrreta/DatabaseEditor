import { team_dict, combined_dict, races_names, names_full, countries_data, logos_disc, lightColors } from "./config";
import { Command } from "../backend/command";
import { GoogleGenAI } from "@google/genai";
import { getCircuitInfo } from "../backend/scriptUtils/newsUtils";
import newsPromptsTemaplates from "../../data/news/news_prompts_templates.json";
import { currentSeason } from "./transfers";
import { colors_dict } from "./head2head";
import { excelToDate } from "../backend/scriptUtils/eidtStatsUtils";
import { getSaveName } from "./renderer";

const newsGrid = document.querySelector('.news-grid');

let ai = null;
let interval2 = null;

export function initAI(apiKeyParam) {
  if (!apiKeyParam) {
    console.warn("No API key configured yet");
    return null;
  }
  ai = new GoogleGenAI({ apiKey: apiKeyParam });
  return ai;
}

export function getAI() {
  return ai;
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));
const onTransitionEnd = (el, propName, timeoutMs) =>
  new Promise(resolve => {
    let done = false;
    const handler = (e) => {
      if (!propName || e.propertyName === propName) {
        done = true;
        el.removeEventListener('transitionend', handler);
        resolve();
      }
    };
    el.addEventListener('transitionend', handler, { once: true });
    if (timeoutMs != null) {
      setTimeout(() => { if (!done) { el.removeEventListener('transitionend', handler); resolve(); } }, timeoutMs);
    }
  });

async function finishGeneralLoader() {
  const pageLoaderDiv = document.querySelector('.general-news-loader');
  if (!pageLoaderDiv) return;

  const pageProgressDiv =
    pageLoaderDiv.querySelector('.general-news-progress-div') ||
    document.querySelector('.general-news-progress-div');

  const id = pageProgressDiv?._progressIntervalId;
  if (id) {
    clearInterval(id);
    pageProgressDiv._progressIntervalId = null;
  }

  if (pageProgressDiv) {
    await new Promise(requestAnimationFrame);     // asegura estado inicial
    pageProgressDiv.style.width = '100%';
    await Promise.race([
      onTransitionEnd(pageProgressDiv, 'width', 220),
      wait(200)
    ]);
  }

  pageLoaderDiv.style.opacity = '0';
  await Promise.race([
    onTransitionEnd(pageLoaderDiv, 'opacity', 150),
    wait(100)
  ]);

  pageLoaderDiv.remove();
}

export async function place_news(newsList) {
  console.log("Placing news:", newsList);

  await finishGeneralLoader();

  saveNews(newsList);
  newsGrid.innerHTML = '';

  newsList.forEach((news, index) => {
    const newsItem = document.createElement('div');
    newsItem.classList.add('news-item', 'fade-in');
    newsItem.setAttribute('style', '--order: ' + (index + 1));

    const newwsBody = document.createElement('div');
    newwsBody.classList.add('news-body');
    const titleAndArticle = document.createElement('div');
    titleAndArticle.classList.add('title-and-article');

    const newsTitle = document.createElement('span');
    newsTitle.classList.add('news-title', 'bold-font');
    newsTitle.textContent = news.title;

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('news-image-container');

    manage_overlay(imageContainer, news.overlay, news.data);

    const image = document.createElement('img');
    image.classList.add('news-image');
    image.setAttribute('data-src', news.image);
    image.src = news.image;

    const readbuttonContainer = document.createElement('div');
    readbuttonContainer.classList.add('read-button-container');

    const readButton = document.createElement('div');
    readButton.classList.add('read-button');
    const readButtonSpan = document.createElement('span');
    readButtonSpan.classList.add('gradient-text');
    readButtonSpan.innerText = "Read";
    readButton.appendChild(readButtonSpan);

    readButton.addEventListener('click', async () => {
      const clone = animateToCenter(newsItem);

      const bodyEl = clone.querySelector('.news-body');
      const titleEl = bodyEl.querySelector('.news-title');
      const articleEl = document.createElement('div');
      articleEl.classList.add('news-article');

      const dateDiv = document.createElement('div');
      dateDiv.classList.add('news-article-date');
      const calendarIcon = document.createElement('i');
      calendarIcon.classList.add('bi', 'bi-calendar-event',);
      const dateSpan = document.createElement('span');
      const date = excelToDate(news.date);


      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      dateSpan.textContent = `${day}/${month}/${year}`;
      dateDiv.appendChild(calendarIcon);
      dateDiv.appendChild(dateSpan);

      articleEl.style.whiteSpace = 'pre-wrap';

      //first title, then date, then article
      titleEl.insertAdjacentElement('afterend', dateDiv);
      dateDiv.insertAdjacentElement('afterend', articleEl);

      const loaderDiv = document.createElement('div');
      loaderDiv.classList.add('loader-div');
      const loadingSpan = document.createElement('span');
      loadingSpan.textContent = "Generating";
      const loadingDots = document.createElement('span');
      loadingDots.textContent = "."
      loadingDots.classList.add('loading-dots');
      loadingSpan.appendChild(loadingDots);

      setInterval(() => {
        if (loadingDots.textContent.length >= 3) {
          loadingDots.textContent = ".";
        } else {
          loadingDots.textContent += ".";
        }
      }, 500);

      const progressBar = document.createElement('div');
      progressBar.classList.add('ai-progress-bar');
      const progressDiv = document.createElement('div');
      progressDiv.classList.add('progress-div');

      progressBar.appendChild(progressDiv);
      loaderDiv.appendChild(loadingSpan);
      loaderDiv.appendChild(progressBar);

      articleEl.insertAdjacentElement('afterend', loaderDiv);

      //start progress div moving every 100ms to 30%
      let progress = 0;
      const interval = setInterval(() => {
        progress += 3;
        if (progressDiv) {
          progressDiv.style.width = progress + '%';
        }
        if (progress >= 30) {
          clearInterval(interval);
        }
      }, 150);

      try {
        const articleText = await manageRead(news, newsList, progressDiv, interval);

        clearInterval(interval);
        clearInterval(interval2);
        progressDiv.style.width = '100%';

        setTimeout(() => {
          loaderDiv.style.opacity = '0';

          setTimeout(() => {
            loaderDiv.remove();
            typeWriterWordByWord(articleEl, articleText, 15);
          }, 150);

        }, 200);

      }

      catch (err) {
        console.error("Error generating article:", err);
        clearInterval(interval);
      }
    });

    imageContainer.appendChild(image);
    newsItem.appendChild(imageContainer);
    titleAndArticle.appendChild(newsTitle);
    newwsBody.appendChild(titleAndArticle);
    readbuttonContainer.appendChild(readButton);
    newwsBody.appendChild(readbuttonContainer);
    newsItem.appendChild(newwsBody);

    if(news.type === "race_result" || news.type === "quali_result") {
      newsItem.dataset.type = news.type;
    }
    else if(news.type === "fake_transfer" || news.type === "big_transfer" || news.type === "contract_renewal" || news.type === "silly_season_rumors") {
      newsItem.dataset.type = "driver_transfers";
    }
    else if(news.type === "potential_champion" || news.type === "world_champion" || news.type === "season_review" || news.type === "team_comparison" || news.type === "driver_comparison") {
      newsItem.dataset.type = "others";
    }

    newsGrid.appendChild(newsItem);
    setTimeout(() =>
    {
      newsItem.classList.remove('fade-in');
      newsItem.style.removeProperty('--order');
      newsItem.style.opacity = '1';
    }, 300);


  });
}

async function manageRead(newData, newsList, barProgressDiv, interval) {
  let articleText, prompt;

  if (newData.type === "race_result") {
    prompt = await contextualizeRaceResults(newData);
  }
  else if (newData.type === "quali_result") {
    prompt = await contextualizeQualiResults(newData);
  }
  else if (newData.type === "fake_transfer") {
    prompt = await contextualizeFakeTransferNews(newData);
  }
  else if (newData.type === "silly_season_rumors") {
    prompt = await contextualizeSillySeasonTransferNews(newData);
  }
  else if (newData.type === "potential_champion") {
    prompt = await contextualizePotentialChampion(newData);
  }
  else if (newData.type === "world_champion") {
    prompt = await contextualizeWorldChampion(newData);
  }
  else if (newData.type === "big_transfer") {
    prompt = await contextualizeBigTransferConfirm(newData);
  }
  else if (newData.type === "contract_renewal") {
    prompt = await contextualizeRenewalNews(newData);
  }
  else if (newData.type === "team_comparison") {
    prompt = await contextualizeTeamComparison(newData);
  }
  else if (newData.type === "driver_comparison") {
    prompt = await contextualizeDriverComparison(newData);
  }
  else if (newData.type === "season_review") {
    prompt = await contextualizeSeasonReview(newData);
  }

  clearInterval(interval);


  if (barProgressDiv) {
    barProgressDiv.style.width = '50%';
  }


  let progress = 50;
  interval2 = setInterval(() => {
    progress += 1;
    if (barProgressDiv) {
      barProgressDiv.style.width = progress + '%';
    }
    if (progress >= 98) {
      clearInterval(interval2);
    }
  }, 350);

  console.log("Final prompt:", prompt);

  if (newData.text) {
    articleText = newData.text;
  }
  else {
    articleText = await askGenAI(prompt);
    newData.text = articleText;
    saveNews(newsList);

  }

  return articleText;
}

async function contextualizeWorldChampion(newData) {
  const promptTemplateEntry = newsPromptsTemaplates.find(t => t.new_type === 9);
  if (!promptTemplateEntry) {
    console.error("Prompt template for new_type 8 not found!");
    return "Error: Prompt template not found.";
  }
  let prompt = promptTemplateEntry.prompt;

  prompt = prompt.replace(/{{\s*driver_name\s*}}/g, newData.data.driver_name || 'The leading driver');
  prompt = prompt.replace(/{{\s*season_year\s*}}/g, newData.data.season_year || 'the current season');
  prompt = prompt.replace(/{{\s*circuit\s*}}/g, newData.data.circuit_name || 'the upcoming circuit');
  prompt = prompt.replace(/{{\s*rival_driver_name\s*}}/g, newData.data.rival_driver_name || 'their closest rival');
  prompt = prompt.replace(/{{\s*driver_points\s*}}/g, newData.data.driver_points !== undefined ? newData.data.driver_points.toString() : 'current');
  prompt = prompt.replace(/{{\s*rival_points\s*}}/g, newData.data.rival_points !== undefined ? newData.data.rival_points.toString() : 'current');

  const command = new Command("raceDetailsRequest", {
    raceid: newData.data.raceId,
  });

  let standingsResp, previousRaces = '';
  try {
    standingsResp = await command.promiseExecute();
    if (standingsResp && standingsResp.content) {

      const raceNumber = standingsResp.content.racesNames.length + 1;

      const numberOfRace = `The title was sealed after race ${raceNumber} out of ${standingsResp.content.nRaces} in this season.`;

      prompt += `\n\n${numberOfRace}`;

      const previousResults = standingsResp.content.driversResults.map((d, i) => {
        return `${d.name} (${d.nWins > 0 ? d.nWins + " wins" : ""}${d.nPodiums > 0 ? (d.nWins > 0 ? ", " : "") + d.nPodiums + " podiums" : ""}${d.nWins === 0 && d.nPodiums === 0 ? d.nPointsFinishes + " points finishes" : ""}) ${d.resultsString}`;
      }).join("\n");

      if (standingsResp.content.racesNames.length > 0) {

        prompt += `\n\nHere are the previous results for each driver the PREVIOUS races:\n${previousRaces}`;

        prompt += `\n\n${previousResults}`;

      }


      const driversChamp = standingsResp.content.driverStandings
        .map((d, i) => `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`)
        .join("\n");
      prompt += `\n\nCurrent Drivers' Championship standings (after this race):\n${driversChamp}`;

      const teamsChamp = standingsResp.content.teamStandings
        .map((t, i) => {
          const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
          return `${i + 1}. ${teamName} — ${t.points} pts`;
        })
        .join("\n");
      prompt += `\n\nCurrent Constructors' Championship standings (after this race):\n${teamsChamp}`;

      const previousChampions = Object.values(
        standingsResp.content.champions.reduce((acc, { season, pos, name, points }) => {
          if (!acc[season]) acc[season] = { season, drivers: [] };
          acc[season].drivers.push(`${pos}. ${name} ${points}pts`);
          return acc;
        }, {})
      )
        .sort((a, b) => b.season - a.season)
        .map(({ season, drivers }) => `${season}\n${drivers.join('\n')}`)
        .join('\n\n');

      prompt += `\n\nIf you want to mention that someone is the reigning champion, here are the last F1 world champions and runner ups:\n${previousChampions}`;
    } else {
      prompt += "\n\nCould not retrieve current championship standings.";
    }
  } catch (err) {
    console.error("Error fetching standings for potential champion news:", err);
    prompt += "\n\nError fetching championship standings.";
  }

  return prompt;
}

async function contextualizePotentialChampion(newData) {
  const promptTemplateEntry = newsPromptsTemaplates.find(t => t.new_type === 8);
  if (!promptTemplateEntry) {
    console.error("Prompt template for new_type 8 not found!");
    return "Error: Prompt template not found.";
  }
  let prompt = promptTemplateEntry.prompt;


  prompt = prompt.replace(/{{\s*driver_name\s*}}/g, newData.data.driver_name || 'The leading driver');
  prompt = prompt.replace(/{{\s*season_year\s*}}/g, newData.data.season_year || 'the current season');
  prompt = prompt.replace(/{{\s*circuit\s*}}/g, newData.data.circuit_name || 'the upcoming circuit');
  prompt = prompt.replace(/{{\s*rival_driver_name\s*}}/g, newData.data.rival_driver_name || 'their closest rival');
  prompt = prompt.replace(/{{\s*driver_points\s*}}/g, newData.data.driver_points !== undefined ? newData.data.driver_points.toString() : 'current');
  prompt = prompt.replace(/{{\s*rival_points\s*}}/g, newData.data.rival_points !== undefined ? newData.data.rival_points.toString() : 'current');



  const command = new Command("raceDetailsRequest", {
    raceid: parseInt(newData.data.raceId) - 1,
  });

  let standingsResp, previousRaces = '';
  try {
    standingsResp = await command.promiseExecute();
    if (standingsResp && standingsResp.content) {

      const raceNumber = standingsResp.content.racesNames.length + 1;

      const numberOfRace = `The title could be sealed sealed after race ${raceNumber} out of ${standingsResp.content.nRaces} in this season.`;

      prompt += `\n\n${numberOfRace}`;

      const previousResults = standingsResp.content.driversResults.map((d, i) => {
        return `${d.name} (${d.nWins > 0 ? d.nWins + " wins" : ""}${d.nPodiums > 0 ? (d.nWins > 0 ? ", " : "") + d.nPodiums + " podiums" : ""}${d.nWins === 0 && d.nPodiums === 0 ? d.nPointsFinishes + " points finishes" : ""}) ${d.resultsString}`;
      }).join("\n");

      if (standingsResp.content.racesNames.length > 0) {

        prompt += `\n\nHere are the previous results for each driver the PREVIOUS races:\n${previousRaces}`;

        prompt += `\n\n${previousResults}`;

      }

      const driversChamp = standingsResp.content.driverStandings
        .map((d, i) => `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`)
        .join("\n");
      prompt += `\n\nCurrent Drivers' Championship standings (before this race):\n${driversChamp}`;

      const teamsChamp = standingsResp.content.teamStandings
        .map((t, i) => {
          const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
          return `${i + 1}. ${teamName} — ${t.points} pts`;
        })
        .join("\n");
      prompt += `\n\nCurrent Constructors' Championship standings (before this race):\n${teamsChamp}`;

      const previousChampions = Object.values(
        standingsResp.content.champions.reduce((acc, { season, pos, name, points }) => {
          if (!acc[season]) acc[season] = { season, drivers: [] };
          acc[season].drivers.push(`${pos}. ${name} ${points}pts`);
          return acc;
        }, {})
      )
        .sort((a, b) => b.season - a.season)
        .map(({ season, drivers }) => `${season}\n${drivers.join('\n')}`)
        .join('\n\n');

      prompt += `\n\nIf you want to mention that someone is the reigning champion, here are the last F1 world champions and runner ups:\n${previousChampions}`;
    } else {
      prompt += "\n\nCould not retrieve current championship standings.";
    }
  } catch (err) {
    console.error("Error fetching standings for potential champion news:", err);
    prompt += "\n\nError fetching championship standings.";
  }

  return prompt;
}

async function contextualizeSillySeasonTransferNews(newData) {
  let season = newData.season;
  const date = newData.date || null;

  let prompt = newsPromptsTemaplates.find(t => t.new_type === 4).prompt;
  prompt = prompt.replace(/{{\s*season\s*}}/g, season);

  const command = new Command("transferRumorRequest", {
    drivers: newData.data.drivers,
    date: date
  }
  );

  let resp;
  try {
    resp = await command.promiseExecute();
  } catch (err) {
    console.error("Error fetching race details:", err);
    return;
  }

  prompt += `\n\nHere are the transfers that you have to talk about:\n`;

  newData.data.drivers.forEach((d) => {
    prompt += `${d.name} could be leaving ${d.actualTeam}\n`;

    prompt += `\n\nHere are the offers that ${d.name} has:\n`;
    d.offers.forEach((o) => {
      prompt += `${o.potentialTeam} with an expected salary of around ${o.salary}€ per year until ${o.endSeason}, targettint ${o.driverAtRisk}'s seat. ${d.name}'s opinion on salary is ${o.salaryOpinion} and on length is ${o.lengthOpinion}\n`;
    });

    prompt += `\n\nHere are the previous results of ${d.actualTeam} in recent years:\n`;
    d.previousResultsTeam.forEach((t) => {
      prompt += `${t.season} - ${getOrdinalSuffix(t.position)} ${t.points}pts\n`;
    })

    prompt += `\n\nHere are the teams that ${d.name} has drivern for in recent years:\n`;
    d.previouslyDrivenTeams.forEach((t) => {
      prompt += `${t.season} - ${t.teamName}\n`;
    });
  });

  const driversChamp = resp.content.driverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Drivers' Championship standings:\n${driversChamp}`;

  const teamsChamp = resp.content.teamStandings
    .map((t, i) => {
      const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
      return `${i + 1}. ${teamName} — ${t.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Constructors' Championship standings:\n${teamsChamp}`;

  return prompt;
}

async function contextualizeFakeTransferNews(newData) {
  let driverName = newData.data.drivers[0].name;
  let teamName = newData.data.drivers[0].team;
  const date = newData.date || null;

  let prompt = newsPromptsTemaplates.find(t => t.new_type === 7).prompt;
  prompt = prompt.replace(/{{\s*driver1\s*}}/g, driverName)
    .replace(/{{\s*team1\s*}}/g, teamName);

  const command = new Command("transferRumorRequest", {
    drivers: newData.data.drivers,
    date: date
  }
  );

  let resp;
  try {
    resp = await command.promiseExecute();
  } catch (err) {
    console.error("Error fetching race details:", err);
    return;
  }

  prompt += `\n\nHere are the transfers that you have to talk about:\n`;

  resp.content.driverMap.forEach((d) => {
    prompt += `${d.name} could be leaving ${d.actualTeam} ${d.potentialTeam ? " for " + d.potentialTeam : ""} ${d.potentialSalary ? "with an expected salary of around " + d.potentialSalary : ""}\n`;

    prompt += `\n\nHere are the previous results of ${d.actualTeam} in recent years:\n`;
    d.actualTeamPreviousResults.forEach((t) => {
      prompt += `${t.season} - ${getOrdinalSuffix(t.position)} ${t.points}pts\n`;
    })

    prompt += `\n\nHere are the teams that ${d.name} has driven for in recent years:\n`;
    d.previouslyDrivenTeams.forEach((t) => {
      prompt += `${t.season} - ${t.teamName}\n`;
    });
  });


  const driversChamp = resp.content.driverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Drivers' Championship standings (after this race):\n${driversChamp}`;

  const teamsChamp = resp.content.teamStandings
    .map((t, i) => {
      const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
      return `${i + 1}. ${teamName} — ${t.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Constructors' Championship standings (after this race):\n${teamsChamp}`;

  return prompt;
}

async function contextualizeBigTransferConfirm(newData) {
  let driverName = newData.data.driver1
  let potentialTeam = newData.data.team1
  let originalTeam = newData.data.team2
  const date = newData.date || null;

  let prompt = newsPromptsTemaplates.find(t => t.new_type === 6).prompt;
  prompt = prompt.replace(/{{\s*driver1\s*}}/g, driverName)
    .replace(/{{\s*team1\s*}}/g, potentialTeam)
    .replace(/{{\s*team2\s*}}/g, originalTeam);


  let drivers = [{
    driverId: newData.data.driverId,
    name: driverName,
    team: originalTeam,
    teamId: newData.data.team2Id,
    previouslyDrivenTeams: newData.data.previouslyDrivenTeams,
    potentialSalary: newData.data.salary,
    potentialYearEnd: newData.data.endSeason
  }]

  const command = new Command("transferRumorRequest", {
    drivers: drivers,
    date: date
  }
  );

  let resp;
  try {
    resp = await command.promiseExecute();
  } catch (err) {
    console.error("Error fetching race details:", err);
    return;
  }

  prompt += `\n\nHere is the confirmed transfer that you have to talk about:\n`;

  resp.content.driverMap.forEach((d) => {
    prompt += `${d.name} will be leaving ${d.actualTeam} ${d.potentialTeam ? " for " + d.potentialTeam : ""} ${d.potentialSalary ? "with an expected salary of around " + d.potentialSalary : ""}\n`;

    prompt += `\n\nHere are the previous results of ${d.actualTeam} in recent years:\n`;
    d.actualTeamPreviousResults.forEach((t) => {
      prompt += `${t.season} - ${getOrdinalSuffix(t.position)} ${t.points}pts\n`;
    })

    prompt += `\n\nHere are the teams that ${d.name} has driven for in recent years:\n`;
    d.previouslyDrivenTeams.forEach((t) => {
      prompt += `${t.season} - ${t.teamName}\n`;
    });
  });


  const driversChamp = resp.content.driverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Drivers' Championship standings (after this race):\n${driversChamp}`;

  const teamsChamp = resp.content.teamStandings
    .map((t, i) => {
      const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
      return `${i + 1}. ${teamName} — ${t.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Constructors' Championship standings (after this race):\n${teamsChamp}`;

  return prompt;
}

async function contextualizeRenewalNews(newData) {
  let driverName = newData.data.driver1
  let potentialTeam = newData.data.team1
  let originalTeam = newData.data.team2

  let prompt = newsPromptsTemaplates.find(t => t.new_type === 10).prompt;
  prompt = prompt.replace(/{{\s*driver1\s*}}/g, driverName)
    .replace(/{{\s*team1\s*}}/g, potentialTeam);


  let drivers = [{
    driverId: newData.data.driverId,
    name: driverName,
    team: originalTeam,
    teamId: newData.data.team2Id,
    previouslyDrivenTeams: newData.data.previouslyDrivenTeams,
    potentialSalary: newData.data.salary,
    potentialYearEnd: newData.data.endSeason
  }]

  const date = newData.date || null;

  const command = new Command("transferRumorRequest", {
    drivers: drivers,
    date: date
  }
  );

  let resp;
  try {
    resp = await command.promiseExecute();
    console.log("Renewal Offer:", resp);
  } catch (err) {
    console.error("Error fetching race details:", err);
    return;
  }

  prompt += `\n\nHere is the confirmed contract renewal that you have to talk about:\n`;

  resp.content.driverMap.forEach((d) => {
    prompt += `${d.name} will be staying at ${d.actualTeam} ${d.potentialSalary ? "with an expected salary of around " + d.potentialSalary + "€" : ""} ${d.potentialYearEnd ? "until the end of " + d.potentialYearEnd : ""}\n`;

    prompt += `\n\nHere are the previous results of ${d.actualTeam} in recent years:\n`;
    d.actualTeamPreviousResults.forEach((t) => {
      prompt += `${t.season} - ${getOrdinalSuffix(t.position)} ${t.points}pts\n`;
    })

    prompt += `\n\nHere are the teams that ${d.name} has driven for in recent years:\n`;
    d.previouslyDrivenTeams.forEach((t) => {
      prompt += `${t.season} - ${t.teamName}\n`;
    });
  });


  const driversChamp = resp.content.driverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Drivers' Championship standings (after this race):\n${driversChamp}`;

  const teamsChamp = resp.content.teamStandings
    .map((t, i) => {
      const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
      return `${i + 1}. ${teamName} — ${t.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Constructors' Championship standings (after this race):\n${teamsChamp}`;

  return prompt;
}

async function contextualizeTeamComparison(newData) {
  let team1 = combined_dict[newData.data.team.teamId];
  let seasonYear = newData.data.season;
  let compType = newData.data.compType;
  let ptsDif = Math.abs(newData.data.team.drop);
  let promptId;
  if (compType === "good") {
    promptId = 12
  }
  else {
    promptId = 11
  }


  let prompt = newsPromptsTemaplates.find(t => t.new_type === promptId).prompt;
  prompt = prompt.replace(/{{\s*team1\s*}}/g, team1)
    .replace(/{{\s*actualSeason\s*}}/g, seasonYear)
    .replace(/{{\s*lastSeason\s*}}/g, seasonYear - 1);

  const command = new Command("teamComparisonRequest", {
    team: newData.data.team.teamId,
    season: seasonYear,
    date: newData.date
  }
  );

  if (compType === "good") {
    prompt += `\n\n${team1} has scored ${ptsDif} more points compared to last season at the same point of the season.`;
  }
  else {
    prompt += `\n\n${team1} has scored ${ptsDif} fewer points compared to last season at the same point of the season.`;
  }

  let resp;
  try {
    resp = await command.promiseExecute();
    console.log("Team comparison:", resp);
  } catch (err) {
    console.error("Error fetching race details:", err);
    return;
  }

  const driversChamp = resp.content.currentDriverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Drivers' Championship standings:\n${driversChamp}`;

  const teamsChamp = resp.content.currentTeamStandings
    .map((t, i) => {
      const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
      return `${i + 1}. ${teamName} — ${t.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Constructors' Championship standings:\n${teamsChamp}`;

  let previousRaces = '';
  resp.content.currentRacesNames.forEach((r) => {
    previousRaces += `${r}, `;
  });
  previousRaces = previousRaces.slice(0, -2);

  const previousResults = resp.content.currentDriversResults.filter(d => d.teamId === newData.data.team.teamId).map((d, i) => {
    return `${d.name} - ${d.resultsString}`;
  }).join("\n");


  prompt += `\n\nHere are the results from ${team1}'s drivers in ${seasonYear}: ${previousRaces}\n`;
  prompt += `\n\n${previousResults}`;


  previousRaces = '';
  resp.content.oldRacesNames.forEach((r) => {
    previousRaces += `${r}, `;
  });
  previousRaces = previousRaces.slice(0, -2);

  const oldSeasonResults = resp.content.oldDriversResults.filter(d => d.teamId === newData.data.team.teamId).map((d, i) => {
    return `${d.name} - ${d.resultsString}`;
  }).join("\n");

  prompt += `\n\nHere are the results from ${team1}'s drivers in ${seasonYear - 1}: ${previousRaces}\n`;
  prompt += `\n\n${oldSeasonResults}`;

  prompt += `\n\nHere are the previous results of ${team1} in recent years:\n`;
  resp.content.previousResultsTeam.forEach((t) => {
    if (t.season !== seasonYear) {
      prompt += `${t.season} - ${getOrdinalSuffix(t.position)} ${t.points}pts\n`;
    }
  });

  return prompt;
}

async function contextualizeQualiResults(newData) {
  let poleName = newData.data.first;
  let seasonYear = newData.data.seasonYear
  let circuit = countries_data[races_names[parseInt(newData.data.trackId)]].country;

  let prompt = newsPromptsTemaplates.find(t => t.new_type === 1).prompt;
  prompt = prompt.replace(/{{\s*pole_driver\s*}}/g, poleName)
    .replace(/{{\s*season_year\s*}}/g, seasonYear)
    .replace(/{{\s*circuit\s*}}/g, circuit);


  const raceId = newData.id.split("_")[2];

  const command = new Command("qualiDetailsRequest", {
    raceid: raceId,
  }
  );

  let resp;
  try {
    resp = await command.promiseExecute();
  } catch (err) {
    console.error("Error fetching race details:", err);
    return;
  }

  const raceNumber = resp.content.racesNames.length + 1;

  let previousRaces = '';
  resp.content.racesNames.forEach((r) => {
    previousRaces += `${r}, `;
  });
  previousRaces = previousRaces.slice(0, -2);

  const numberOfRace = `This was qualifying ${raceNumber} out of ${resp.content.nRaces} in this season.`;

  prompt += `\n\n${numberOfRace}`;

  const qualiResults = resp.content.details.map(row => {
    return `${row.pos}. ${row.name} (${combined_dict[row.teamId]}) +${row.gapToPole.toFixed(3)} seconds`;
  }).join("\n");

  prompt += "\n\nHere are the full qualifying results:\n" + qualiResults;

  const previousResults = resp.content.driversResults.map((d, i) => {
    return `${d.name} - ${d.resultsString}`;
  }).join("\n");

  if (resp.content.racesNames.length > 0) {

    prompt += `\n\nHere are the previous results for each driver the PREVIOUS quaifyings:\n${previousRaces}`;

    prompt += `\n\n${previousResults}`;

  }

  const driversChamp = resp.content.driverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Drivers' Championship standings (before this race):\n${driversChamp}`;

  const teamsChamp = resp.content.teamStandings
    .map((t, i) => {
      const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
      return `${i + 1}. ${teamName} — ${t.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Constructors' Championship standings (before this race):\n${teamsChamp}`;

  const previousChampions = Object.values(
    resp.content.champions.reduce((acc, { season, pos, name, points }) => {
      if (!acc[season]) acc[season] = { season, drivers: [] };
      acc[season].drivers.push(`${pos}. ${name} ${points}pts`);
      return acc;
    }, {})
  )
    .sort((a, b) => b.season - a.season)
    .map(({ season, drivers }) => `${season}\n${drivers.join('\n')}`)
    .join('\n\n');

  prompt += `\n\nIf you want to mention that someone is the reigning champion, here are the last F1 world champions and runner ups:\n${previousChampions}`;


  return prompt;

}


async function contextualizeRaceResults(newData) {
  let winnerName = newData.data.first;
  let seasonYear = newData.data.seasonYear
  let circuit = countries_data[races_names[parseInt(newData.data.trackId)]].country;

  let prompt = newsPromptsTemaplates.find(t => t.new_type === 2).prompt;
  prompt = prompt.replace(/{{\s*winner\s*}}/g, winnerName)
    .replace(/{{\s*season_year\s*}}/g, seasonYear)
    .replace(/{{\s*circuit\s*}}/g, circuit);

  const raceId = newData.id.split("_")[2];
  const command = new Command("raceDetailsRequest", {
    raceid: raceId,
  }
  );

  let resp;
  try {
    resp = await command.promiseExecute();
  } catch (err) {
    console.error("Error fetching race details:", err);
    return;
  }

  const raceNumber = resp.content.racesNames.length + 1;

  let previousRaces = '';
  resp.content.racesNames.forEach((r) => {
    previousRaces += `${r}, `;
  });
  previousRaces = previousRaces.slice(0, -2);

  const safetyCars = resp.content.details[0].safetyCar;
  const virtualSafetyCars = resp.content.details[0].virtualSafetyCar;

  const numberOfRace = `This was race ${raceNumber} out of ${resp.content.nRaces} in this season.`;

  prompt += `\n\n${numberOfRace}`;

  const safetyCarPhrase = `\n\nThere were ${safetyCars} safety car${safetyCars > 1 ? "s" : ""} and ${virtualSafetyCars} virtual safety car${virtualSafetyCars > 1 ? "s" : ""} during the race.`

  prompt += safetyCarPhrase;


  if (resp.content.sprintDetails.length > 0) {
    prompt += `\n\nThere was a sprint race held on Saturday, which was won by ${resp.content.sprintDetails[0].name} (${combined_dict[resp.content.sprintDetails[0].teamId]}). Dedicate a paragraph discussing the sprint results`;

    const sprintResults = resp.content.sprintDetails.map(row => {
      return `${row.pos}. ${row.name} (${combined_dict[row.teamId]}) +${row.gapToWinner.toFixed(3)} seconds (+${row.points} pts)`;
    }).join("\n");

    prompt += `\n\nHere are the sprint results:\n${sprintResults}`;
  }

  const raceResults = resp.content.details.map(row => {
    const gapStr =
      row.gapToWinner > 0
        ? `${Number(row.gapToWinner.toFixed(3))} seconds`
        : row.gapLaps > 0
          ? `${row.gapLaps} laps`
          : `0 seconds`;
    return `${row.pos}. ${row.name} (${combined_dict[row.teamId]}) (Started P${row.grid}) +${gapStr} (+${row.points} pts)`;
  }).join("\n");


  prompt += "\n\nHere are the full race results:\n" + raceResults;



  const previousResults = resp.content.driversResults.map((d, i) => {
    return `${d.name} (${d.nWins > 0 ? d.nWins + " wins" : ""}${d.nPodiums > 0 ? (d.nWins > 0 ? ", " : "") + d.nPodiums + " podiums" : ""}${d.nWins === 0 && d.nPodiums === 0 ? d.nPointsFinishes + " points finishes" : ""}) ${d.resultsString}`;
  }).join("\n");

  if (resp.content.racesNames.length > 0) {

    prompt += `\n\nHere are the previous results for each driver the PREVIOUS races:\n${previousRaces}`;

    prompt += `\n\n${previousResults}`;

  }

  const driversChamp = resp.content.driverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Drivers' Championship standings (after this race):\n${driversChamp}`;

  const teamsChamp = resp.content.teamStandings
    .map((t, i) => {
      const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
      return `${i + 1}. ${teamName} — ${t.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Constructors' Championship standings (after this race):\n${teamsChamp}`;

  const previousChampions = Object.values(
    resp.content.champions.reduce((acc, { season, pos, name, points }) => {
      if (!acc[season]) acc[season] = { season, drivers: [] };
      acc[season].drivers.push(`${pos}. ${name} ${points}pts`);
      return acc;
    }, {})
  )
    .sort((a, b) => b.season - a.season)
    .map(({ season, drivers }) => `${season}\n${drivers.join('\n')}`)
    .join('\n\n');

  prompt += `\n\nIf you want to mention that someone is the reigning champion, here are the last F1 world champions and runner ups:\n${previousChampions}`;


  return prompt;
}

async function contextualizeDriverComparison(newData) {
  let driver1 = newData.data.drivers[0].name;
  let driver2 = newData.data.drivers[1].name;
  let teamId = newData.data.teamId;
  let seasonYear = newData.data.season;
  let prompt = newsPromptsTemaplates.find(t => t.new_type === 13).prompt;
  prompt = prompt.replace(/{{\s*driver1\s*}}/g, driver1)
    .replace(/{{\s*driver2\s*}}/g, driver2)
    .replace(/{{\s*team1\s*}}/g, combined_dict[teamId])
    .replace(/{{\s*actualSeason\s*}}/g, seasonYear)

  const command = new Command("fullChampionshipDetailsRequest", {
    season: seasonYear,
  });

  let resp;
  try {
    resp = await command.promiseExecute();
    console.log("Full championship details:", resp);
  } catch (err) {
    console.error("Error fetching full championship details:", err);
    return;
  }

  const driversChamp = resp.content.driverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Drivers' Championship standings:\n${driversChamp}`;


  const teamsChamp = resp.content.teamStandings
    .map((t, i) => {
      const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
      return `${i + 1}. ${teamName} — ${t.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Constructors' Championship standings:\n${teamsChamp}`;

  let previousRaces = '';
  resp.content.racesNames.forEach((r) => {
    previousRaces += `${r}, `;
  });
  previousRaces = previousRaces.slice(0, -2);

  prompt += `\n\nThe races that have already taken place in ${seasonYear} are: ${previousRaces}\n`;

  const previousResults = resp.content.driversResults.filter(d => d.teamId === teamId).map((d, i) => {
    return `${d.name} - ${d.resultsString}`;
  }).join("\n");

  prompt += `\n\nHere are the previous race results for ${combined_dict[teamId]}'s drivers in ${seasonYear}:\n${previousResults}`;

  const previousQualiResults = resp.content.driverQualiResults.filter(d => d.teamId === teamId).map((d, i) => {
    return `${d.name} - ${d.resultsString}`;
  }).join("\n");

  prompt += `\n\nHere are the previous qualifying results for ${combined_dict[teamId]}'s drivers in ${seasonYear}:\n${previousQualiResults}`;


  const previousChampions = Object.values(
    resp.content.champions.reduce((acc, { season, pos, name, points }) => {
      if (!acc[season]) acc[season] = { season, drivers: [] };
      acc[season].drivers.push(`${pos}. ${name} ${points}pts`);
      return acc;
    }, {})
  )
    .sort((a, b) => b.season - a.season)
    .map(({ season, drivers }) => `${season}\n${drivers.join('\n')}`)
    .join('\n\n');

  prompt += `\n\nIf you want to mention that someone is the reigning champion, here are the last F1 world champions and runner ups:\n${previousChampions}`;

  return prompt;
}

async function contextualizeSeasonReview(newData) {
  let seasonYear = newData.data.season;
  let driver1 = newData.data.firstDriver.name;
  let driver2 = newData.data.secondDriver.name;
  let team1 = combined_dict[newData.data.firstTeam.teamId];
  let team2 = combined_dict[newData.data.secondTeam.teamId];
  let part = newData.data.part;

  let newType = part === 3 ? 15 : 14;

  let prompt = newsPromptsTemaplates.find(t => t.new_type === newType).prompt;
  prompt = prompt.replace(/{{\s*season_year\s*}}/g, seasonYear)
    .replace(/{{\s*part\s*}}/g, part)
    .replace(/{{\s*driver1\s*}}/g, driver1)
    .replace(/{{\s*driver2\s*}}/g, driver2)
    .replace(/{{\s*team1\s*}}/g, team1)
    .replace(/{{\s*team2\s*}}/g, team2);

  const command = new Command("fullChampionshipDetailsRequest", {
    season: seasonYear,
  });

  let resp;

  try {
    resp = await command.promiseExecute();
    console.log("Full championship details:", resp);
  }
  catch (err) {
    console.error("Error fetching full championship details:", err);
    return;
  }

  const driversChamp = resp.content.driverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Drivers' Championship standings:\n${driversChamp}`;

  const teamsChamp = resp.content.teamStandings
    .map((t, i) => {
      const teamName = combined_dict[t.teamId] || `Team ${t.teamId}`;
      return `${i + 1}. ${teamName} — ${t.points} pts`;
    })
    .join("\n");

  prompt += `\n\nCurrent Constructors' Championship standings:\n${teamsChamp}`;

  let previousRaces = '';
  resp.content.racesNames.forEach((r) => {
    previousRaces += `${r}, `;
  });

  previousRaces = previousRaces.slice(0, -2);

  prompt += `\n\nThe races that have already taken place in ${seasonYear} are: ${previousRaces}\n`;

  const previousResults = resp.content.driversResults.map((d, i) => {
    return `${d.name} (${combined_dict[d.teamId]}) - ${d.resultsString}`;
  }).join("\n");

  prompt += `\n\nHere are the previous race results each driver in ${seasonYear}:\n${previousResults}`;

  const previousQualiResults = resp.content.driverQualiResults.map((d, i) => {
    return `${d.name} (${combined_dict[d.teamId]}) - ${d.resultsString}`;
  }).join("\n");

  prompt += `\n\nHere are the previous qualifying results for each driver in ${seasonYear}:\n${previousQualiResults}`;

  const carPerformanceStart = Object.entries(resp.content.carsPerformance[0])
    .sort((a, b) => b[1] - a[1])
    .map(([team, value]) => `${team}: ${value.toFixed(2)}`)
    .join("\n");

  const carPerformanceEnd = Object.entries(resp.content.carsPerformance[resp.content.carsPerformance.length - 1])
    .sort((a, b) => b[1] - a[1])
    .map(([team, value]) => `${team}: ${value.toFixed(2)}`)
    .join("\n");

  prompt += `\n\nThe performance of each car is measured on a scale from 0 to 100, where 100 represents the ideal possible performance. A higher value indicates a better-performing car. The performance values should be taken with a grain of salt, as they are estimates, but they are very important to understand drivers and teams performance. Never ever mention the numbers given as they are only an estimate rather than an absolute truth and are only there to put into numbers the performance of each car. You can mention if a car is performing well or poorly, or how has it evolved but never give the exact numbers.\n`;

  prompt += `\n\nHere is the performance of each car at the start of the season:\n${carPerformanceStart}`;
  prompt += `\n\nHere is the performance of each car at the latest race:\n${carPerformanceEnd}`;

  const previousChampions = Object.values(
    resp.content.champions.reduce((acc, { season, pos, name, points }) => {
      if (!acc[season]) acc[season] = { season, drivers: [] };
      acc[season].drivers.push(`${pos}. ${name} ${points}pts`);
      return acc;
    }, {})
  )
    .sort((a, b) => b.season - a.season)
    .map(({ season, drivers }) => `${season}\n${drivers.join('\n')}`)
    .join('\n\n');

  prompt += `\n\nIf you want to mention that someone is the reigning champion, here are the last F1 world champions and runner ups:\n${previousChampions}`;

  return prompt;


}


function saveNews(newsList) {
  const newsObj = newsList.reduce((acc, news) => {
    acc[news.id] = {
      title: news.title,
      type: news.type,
      date: news.date,
      image: news.image,
      overlay: news.overlay,
      data: news.data,
      text: news.text
    };
    return acc;
  }, {});
  let saveName = getSaveName();
  //remove file extension if any
  saveName = saveName.split('.')[0];
  let newsName = `${saveName}_news`;
  localStorage.setItem(newsName, JSON.stringify(newsObj));
}

function animateToCenter(newsItem) {
  const rect = newsItem.getBoundingClientRect();
  const clone = newsItem.cloneNode(true);
  clone.classList.add('news-item-clone');

  Object.assign(clone.style, {
    position: 'fixed',
    top: rect.top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
    margin: '0',
    zIndex: '1000',
    transition: 'all .4s ease',
  });

  document.body.appendChild(clone);
  newsItem.style.visibility = 'hidden';

  // animar al centro
  requestAnimationFrame(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const targetWidth = vw * 0.75;
    const aspectRatio = rect.height / rect.width;
    const targetHeight = targetWidth * aspectRatio;
    const targetTop = (vh - targetHeight) / 2;
    const targetLeft = (vw - targetWidth) / 2;

    clone.style.top = targetTop + 'px';
    clone.style.left = targetLeft + 'px';
    clone.style.width = targetWidth + 'px';
    clone.style.height = targetHeight + 'px';
    clone.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
    clone.style.borderRadius = '12px';
  });

  // overlay + botón
  document.body.classList.add('modal-open');
  const btn = clone.querySelector('.read-button');
  btn.classList.add('closable');
  btn.innerText = 'Close';

  // listener de cierre en el botón “Close”
  btn.addEventListener('click', () => {
    const articleEl = clone.querySelector('.news-article');
    if (articleEl) {
      articleEl.remove();
    }

    const dateEl = clone.querySelector('.news-article-date');
    if (dateEl) {
      dateEl.remove();
    }
    document.body.classList.remove('modal-open');
    clone.style.top = rect.top + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.boxShadow = 'none';

    clone.querySelector(".news-title").style.fontSize = '20px';



    const onEnd = (e) => {
      if (e.propertyName === 'width') {
        document.body.removeChild(clone);
        newsItem.style.visibility = '';
        clone.removeEventListener('transitionend', onEnd);
      }
    };
    clone.addEventListener('transitionend', onEnd);
  });

  return clone;
}


async function askGenAI(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text;
}

/**
 * Write text word by word with a typewriter effect.
 *
 * @param {HTMLElement} elementn The HTML element where the text will be written.
 * @param {string} text  The text to be written.
 * @param {number} [wordInterval=50] Time interval between words in milliseconds.
 */
function typeWriterWordByWord(element, text, wordInterval = 50) {
  element.innerHTML = '';


  const parts = text.split(/(\s+)/);

  let partIndex = 0;

  function appendNextPart() {
    if (partIndex >= parts.length) {
      return;
    }

    const partText = parts[partIndex];
    partIndex++;


    if (partText === '' && partIndex < parts.length) {
      appendNextPart();
      return;
    }

    if (partText === '' && partIndex >= parts.length) {
      return;
    }

    const partSpan = document.createElement('span');
    partSpan.classList.add('word-fade')
    partSpan.textContent = partText;

    element.appendChild(partSpan);

    void partSpan.offsetHeight;

    partSpan.style.opacity = '1';

    if (partIndex < parts.length) {
      setTimeout(appendNextPart, wordInterval);
    }
  }

  if (parts.length > 0 && !(parts.length === 1 && parts[0] === '')) {
    appendNextPart();
  }
}


function manage_overlay(imageContainer, overlay, data) {
  if (overlay === null) return;

  if (overlay === "race-overlay" || overlay === "quali-overlay") {
    const overlayDiv = document.createElement('div');
    overlayDiv.classList.add('race-overlay');

    const first = document.createElement('div');
    const firstTeam = document.createElement('div');
    firstTeam.classList.add('position-team', 'firstpos');
    firstTeam.innerText = combined_dict[data.firstTeam];
    let borderClass = team_dict[data.firstTeam] + "border-top";
    first.classList.add('position', 'firstpos', borderClass);
    let numberSpan = document.createElement("span");
    numberSpan.className = "new-number";
    numberSpan.textContent = "1.";

    //take only the lastname if there are multiple names
    let textNode = document.createTextNode(` ${data.first.split(" ").pop()}`);

    first.appendChild(numberSpan);
    first.appendChild(textNode);

    const second = document.createElement('div');
    const secondTeam = document.createElement('div');
    secondTeam.classList.add('position-team');
    secondTeam.innerText = combined_dict[data.secondTeam];
    borderClass = team_dict[data.secondTeam] + "border-top";
    second.classList.add('position', borderClass);
    numberSpan = document.createElement("span");
    numberSpan.className = "new-number";
    numberSpan.textContent = "2.";

    textNode = document.createTextNode(` ${data.second.split(" ").pop()}`);

    second.appendChild(numberSpan);
    second.appendChild(textNode);

    const third = document.createElement('div');
    const thirdTeam = document.createElement('div');
    thirdTeam.classList.add('position-team');
    thirdTeam.innerText = combined_dict[data.thirdTeam];
    borderClass = team_dict[data.thirdTeam] + "border-top";
    third.classList.add('position', borderClass);
    numberSpan = document.createElement("span");
    numberSpan.className = "new-number";
    numberSpan.textContent = "3.";

    textNode = document.createTextNode(` ${data.third.split(" ").pop()}`);

    third.appendChild(numberSpan);
    third.appendChild(textNode);

    const sessionDiv = document.createElement('div');
    sessionDiv.classList.add('session');
    sessionDiv.innerText = overlay === "race-overlay" ? "Race" : "Qualifying";

    overlayDiv.appendChild(sessionDiv);
    overlayDiv.appendChild(first);
    overlayDiv.appendChild(firstTeam);
    overlayDiv.appendChild(second);
    overlayDiv.appendChild(secondTeam);
    overlayDiv.appendChild(third);
    overlayDiv.appendChild(thirdTeam);
    imageContainer.appendChild(overlayDiv);
  }
  else if (overlay === "driver-comparison-overlay") {
    console.log("DRIVER COMPARISON DATA:", data);
    const teamId = data.teamId;
    const overlayDiv = document.createElement('div');
    overlayDiv.classList.add('driver-comparison-overlay');
    const teamColor = colors_dict[teamId + "0"] ?? '#000000';

    let contrastColor;
    if (lightColors.includes(teamColor)) {
      contrastColor = "#272727";
    } else {
      contrastColor = "#eeeef1";
    }

    let gradientColor = `color-mix(in srgb, ${teamColor} 30%, ${contrastColor})`;



    const rareLogosTeams = [5, 8, 9];
    if (rareLogosTeams.includes(teamId)) {

      overlayDiv.style.background = `linear-gradient(to top right,
          ${gradientColor} 0%,
          ${teamColor} 25%,
          ${teamColor} 75%,
          ${gradientColor} 100%)`;
      const textDiv = document.createElement('div');
      textDiv.classList.add('new-team-text', 'bold-font');
      if (lightColors.indexOf(teamColor) !== -1) {
        textDiv.style.color = "#272727";
      }
      else {
        textDiv.style.color = '#eeeef1';
      }
      const teamName = document.createElement('div');
      teamName.classList.add('new-team-name');
      teamName.innerText = combined_dict[teamId];
      const driversDiv = document.createElement('div');
      driversDiv.classList.add('new-drivers-names');
      driversDiv.innerHTML = `${data.drivers[0].name} <span class="new-vs">vs</span> ${data.drivers[1].name}`;
      textDiv.appendChild(teamName);
      textDiv.appendChild(driversDiv);
      driversDiv.querySelector(".new-vs").style.backgroundColor = teamColor;
      overlayDiv.appendChild(textDiv);
    }
    else {
      overlayDiv.style.background = teamColor;
      let value = logos_disc[teamId];
      if (teamId === 2 || teamId === 6) {
        value = value.replace(".png", "2.png");
      }

      const logoImg = document.createElement('img');

      logoImg.src = value ?? '';
      logoImg.dataset.src = value ?? '';

      logoImg.classList.add('new-team-logo');
      overlayDiv.appendChild(logoImg);

    }

    imageContainer.appendChild(overlayDiv);


  }
}

function getOrdinalSuffix(n) {
  if (typeof n !== 'number' || isNaN(n) || !isFinite
    (n)) {
    console.error("Invalid input for getOrdinalSuffix:", n);
    return n; // Return the original value if it's not a valid number
  }
  let j = n % 10, k = n % 100;
  if (j == 1 && k != 11) {
    return n + "st";
  }
  if (j == 2 && k != 12) {
    return n + "nd";
  }
  if (j == 3 && k != 13) {
    return n + "rd";
  }
  return n + "th";
}

document.querySelectorAll('#newsTypeMenu .dropdown-item').forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    item.classList.toggle('inactive');

    // sincroniza el icono
    item.querySelector('i').classList.toggle('unactive', item.classList.contains('inactive'));

    const type = item.dataset.value;
    const hide = item.classList.contains('inactive');

    document.querySelectorAll(`.news-item[data-type="${type}"]`).forEach(n => {
      n.style.display = hide ? 'none' : '';
    });
  });
});