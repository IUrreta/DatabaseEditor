import { team_dict, combined_dict, races_names, names_full, countries_data } from "./config";
import { Command } from "../backend/command";
import { GoogleGenAI } from "@google/genai";
import { getCircuitInfo } from "../backend/scriptUtils/newsUtils";
import newsPromptsTemaplates from "../../data/news/news_prompts_templates.json";

const newsGrid = document.querySelector('.news-grid');
const ai = new GoogleGenAI({ apiKey: "API" });

export function place_news(newsList) {


  saveNews(newsList);
  newsGrid.innerHTML = '';

  newsList.forEach((news, index) => {
    const newsItem = document.createElement('div');
    newsItem.classList.add('news-item', 'fade-in');
    // newsItem.setAttribute('style', '--order: ' + (index + 1));

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
    readButton.innerText = "Read";

    readButton.addEventListener('click', async () => {
      const clone = animateToCenter(newsItem);

      const bodyEl = clone.querySelector('.news-body');
      const titleEl = bodyEl.querySelector('.news-title');
      const articleEl = document.createElement('div');
      articleEl.classList.add('news-article');

      articleEl.style.whiteSpace = 'pre-wrap';
      titleEl.insertAdjacentElement('afterend', articleEl);

      const loaderDiv = document.createElement('div');
      loaderDiv.classList.add('loader-div');
      const loadingSpan = document.createElement('span');
      loadingSpan.textContent = "Generating...";
      const loader = document.createElement('div');
      loader.classList.add('ai-loader');

      loaderDiv.appendChild(loader);
      loaderDiv.appendChild(loadingSpan);

      articleEl.insertAdjacentElement('afterend', loaderDiv);

      try {
        const articleText = await manageRead(news, newsList);
        typeWriterWordByWord(articleEl, articleText, 15);

      } finally {
        setTimeout(() => {
          loaderDiv.style.opacity = '0';
        }, 150);
        loaderDiv.remove();
      }

    });

    imageContainer.appendChild(image);
    newsItem.appendChild(imageContainer);
    titleAndArticle.appendChild(newsTitle);
    newwsBody.appendChild(titleAndArticle);
    readbuttonContainer.appendChild(readButton);
    newwsBody.appendChild(readbuttonContainer);
    newsItem.appendChild(newwsBody);

    newsGrid.appendChild(newsItem);

    const lazyImages = document.querySelectorAll(".news-item");

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const imageElement = entry.target.querySelector("img");
          const dataSrc = entry.target.querySelector("img").getAttribute("data-src");
          imageElement.src = dataSrc;
          imageElement.onload = () => imageElement.classList.add("loaded");
        }
        else {
          const imageElement = entry.target.querySelector("img");
          imageElement.src = "";
          imageElement.classList.remove("loaded");
        }
      });
    }, {
      root: document.querySelector('.news-grid'),
      rootMargin: "0px",
      threshold: 0
    });

    lazyImages.forEach(item => {
      imageObserver.observe(item);
    });

  });
}

async function manageRead(newData, newsList) {
  let articleText, prompt;

  if (newData.type === "race_result") {
    prompt = await contextualizeRaceResults(newData);
  }
  else if (newData.type === "quali_result") {
    prompt = await contextualizeQualiResults(newData);
  }
  else if (newData.type === "fake_transfer") {
    prompt = await contextualizeTransferNews(newData);
  }


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

async function contextualizeTransferNews(newData) {
  console.log(newData)
  let driverName = newData.data.drivers[0].name;
  let teamName = newData.data.drivers[0].team;

  let prompt = newsPromptsTemaplates.find(t => t.new_type === 7).prompt;
  prompt = prompt.replace(/{{\s*driver1\s*}}/g, driverName)
    .replace(/{{\s*team1\s*}}/g, teamName);

  const command = new Command("transferRumorRequest", {
    drivers: newData.data.drivers
  }
  );

  let resp;
  try {
    resp = await command.pormiseExecute();
    console.log("Transfer rumor response:", resp);
  } catch (err) {
    console.error("Error fetching race details:", err);
    return;
  }

  prompt += `\n\nHere are the transfers that you have to talk about:\n`;

  resp.content.driverMap.forEach((d) => {
    prompt += `${d.name} could be leaving ${d.actualTeam} ${d.potentialTeam ? " for " + d.potentialTeam : ""} ${d.potentialSalary ? "with an expected salary of around " + d.potentialSalary : ""}\n`;

    prompt += `\n\nHere are the porevious results of ${d.potentialTeam} in recent years:\n`;
    d.actualTeamPreviousResults.forEach((t) => {
      prompt += `${t.season} - ${t.position} ${t.points}pts\n`;
    })
  });



  const driversChamp = resp.content.driverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} — ${d.points} pts`;
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
    resp = await command.pormiseExecute();
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
    return `${d.name} (${d.nWins > 0 ? d.nWins + " wins" : ""}${d.nPodiums > 0 ? (d.nWins > 0 ? ", " : "") + d.nPodiums + " podiums" : ""}${d.nWins === 0 && d.nPodiums === 0 ? d.nPointsFinishes + " points finishes" : ""}) ${d.resultsString}`;
  }).join("\n");

  if (resp.content.racesNames.length > 0) {

    prompt += `\n\nHere are the previous results for each driver the PREVIOUS quaifyings:\n${previousRaces}`;

    prompt += `\n\n${previousResults}`;

  }

  const driversChamp = resp.content.driverStandings
    .map((d, i) => {
      return `${i + 1}. ${d.name} — ${d.points} pts`;
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

  prompt += `\n\nIf you want to mention that someone is the reigning chamipon, here are the last F1 world champions and runner ups:\n${previousChampions}`;


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
    resp = await command.pormiseExecute();
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
      return `${i + 1}. ${d.name} — ${d.points} pts`;
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

  prompt += `\n\nIf you want to mention that someone is the reigning chamipon, here are the last F1 world champions and runner ups:\n${previousChampions}`;


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
  localStorage.setItem('save0_news', JSON.stringify(newsObj));
}

function animateToCenter(newsItem) {
  const rect = newsItem.getBoundingClientRect();
  const clone = newsItem.cloneNode(true);

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
    const targetWidth = vw * 0.8;
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
    document.body.classList.remove('modal-open');
    clone.style.top = rect.top + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.boxShadow = 'none';

    const articleEl = clone.querySelector('.news-article');
    if (articleEl) {
      articleEl.remove();
    }

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
    model: "gemini-2.5-flash-preview-04-17",
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

    let textNode = document.createTextNode(` ${data.first}`);

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

    textNode = document.createTextNode(` ${data.second}`);

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

    textNode = document.createTextNode(` ${data.third}`);

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
}

