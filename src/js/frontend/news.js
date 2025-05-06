import { team_dict, combined_dict, races_names, names_full } from "./config";
import { Command } from "../backend/command";
import { GoogleGenAI } from "@google/genai";
import { getCircuitName } from "../backend/scriptUtils/newsUtils";
import newsPromptsTemaplates from "../../data/news/news_prompts_templates.json";

const newsGrid = document.querySelector('.news-grid');
const ai = new GoogleGenAI({ apiKey: "API" });

export function place_news(newsList) {

  console.log(newsList)

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

      const articleText = await manageRead(news, newsList);

      typeWriter(articleEl, articleText, 25);
    });

    imageContainer.appendChild(image);
    newsItem.appendChild(imageContainer);
    titleAndArticle.appendChild(newsTitle);
    newwsBody.appendChild(titleAndArticle);
    readbuttonContainer.appendChild(readButton);
    newwsBody.appendChild(readbuttonContainer);
    newsItem.appendChild(newwsBody);

    newsGrid.appendChild(newsItem);

  });
}

async function manageRead(newData, newsList) {
  let articleText;
  let winnerName = newData.data.first;
  let seasonYear = newData.data.seasonYear
  let circuit = names_full[races_names[parseInt(newData.data.trackId)]];

  let prompt = newsPromptsTemaplates.find(t => t.id === "race_result").prompt;
  prompt = prompt.replace(/{{\s*winner\s*}}/g, winnerName)
        .replace(/{{\s*season_year\s*}}/g, seasonYear)
        .replace(/{{\s*circuit\s*}}/g, circuit);

  if (newData.type === "race_result") {
    const raceId = newData.id.split("_")[2];
    const command = new Command("raceDetailsRequest", {
      raceid: raceId,
    }
    );

    let resp;
    try {
      resp = await command.pormiseExecute();
      console.log(resp);
    } catch (err) {
      console.error("Error fetching race details:", err);
      return;
    }


    const lines = resp.content.map(row => {
      const surname = row.name.trim().split(" ").slice(-1)[0];
      const gapStr =
        row.gapToWinner > 0
          ? `${Number(row.gapToWinner.toFixed(3))} seconds`
          : row.gapLaps > 0
            ? `${row.gapLaps} laps`
            : `0 seconds`;
      return `${row.pos}. ${surname} (${combined_dict[row.teamId]}) +${gapStr}`;
    }).join("\n");

    prompt += "\n\nHere are the full race results:\n" + lines;

    console.log("Prompt: ", prompt);
  }

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
    model: "gemini-2.0-flash",
    contents: prompt
  });

  return response.text;
}

function typeWriter(element, text, speed = 30) {
  element.textContent = '';
  let i = 0;
  const timer = setInterval(() => {
    element.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(timer);
  }, speed);
}


function manage_overlay(imageContainer, overlay, data) {
  if (overlay === null) return;

  if (overlay === "race-overlay") {
    const overlayDiv = document.createElement('div');
    overlayDiv.classList.add('race-overlay');

    const first = document.createElement('div');
    const firstTeam = document.createElement('div');
    firstTeam.classList.add('position-team', 'firstpos');
    firstTeam.innerText = combined_dict[data.firstTeam];
    let borderClass = team_dict[data.firstTeam] + "border-top";
    first.classList.add('position', 'firstpos', borderClass);
    first.innerText = `1. ${data.first}`;

    const second = document.createElement('div');
    const secondTeam = document.createElement('div');
    secondTeam.classList.add('position-team');
    secondTeam.innerText = combined_dict[data.secondTeam];
    borderClass = team_dict[data.secondTeam] + "border-top";
    second.classList.add('position', borderClass);
    second.innerText = `2. ${data.second}`;

    const third = document.createElement('div');
    const thirdTeam = document.createElement('div');
    thirdTeam.classList.add('position-team');
    thirdTeam.innerText = combined_dict[data.thirdTeam];
    borderClass = team_dict[data.thirdTeam] + "border-top";
    third.classList.add('position', borderClass);
    third.innerText = `3. ${data.third}`;

    overlayDiv.appendChild(first);
    overlayDiv.appendChild(firstTeam);
    overlayDiv.appendChild(second);
    overlayDiv.appendChild(secondTeam);
    overlayDiv.appendChild(third);
    overlayDiv.appendChild(thirdTeam);
    imageContainer.appendChild(overlayDiv);
  }
}