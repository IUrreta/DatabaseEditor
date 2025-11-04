import { team_dict, combined_dict, races_names, names_full, countries_data, logos_disc, lightColors } from "./config";
import { Command } from "../backend/command";
import { GoogleGenAI } from "@google/genai";
import { getCircuitInfo } from "../backend/scriptUtils/newsUtils";
import newsPromptsTemaplates from "../../data/news/news_prompts_templates.json";
import turningPointsTemplates from "../../data/news/turning_points_prompts_templates.json";
import { currentSeason } from "./transfers";
import { colors_dict } from "./head2head";
import { excelToDate } from "../backend/scriptUtils/eidtStatsUtils";
import { generateNews, getSaveName, confirmModal } from "./renderer";
import { marked } from 'marked';
import DOMPurify from "dompurify";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const newsGrid = document.querySelector('.news-grid');
const newsModalEl = document.getElementById('newsModal');
const closeBtn = document.getElementById('closeNewsArticle');

let ai = null;
let interval2 = null;
let cleaning = false;

export function initAI(apiKeyParam) {
  if (!apiKeyParam) {
    console.warn("No API key configured yet");
    ai = null;
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

async function cleanupOpenedNewsItem() {
  if (cleaning) return;
  cleaning = true;

  const newsItem = document.querySelector('.news-item.opened');
  if (newsItem) {
    newsItem.classList.remove('opened');
    // Espera a que termine la transición del item (tu utilidad)
    await onTransitionEnd(newsItem, 'transform', 150);
    newsItem.classList.remove('with-transition');
  }

  cleaning = false;
}

closeBtn.addEventListener('click', async () => {
  await cleanupOpenedNewsItem();

  const modal =
    bootstrap.Modal.getInstance(newsModalEl) ||
    new bootstrap.Modal(newsModalEl);

  modal.hide();
});


newsModalEl.addEventListener('hide.bs.modal', () => {
  cleanupOpenedNewsItem();
});

function hashStr(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

const BUCKET_TURNING = 5;
const BUCKET_NORMAL = 7;

function addReadButtonListener(readButton, newsItem, news, newsList) {
  readButton.addEventListener('click', async () => {
    newsItem.classList.add('with-transition', 'opened');
    const newsModal = new bootstrap.Modal(document.getElementById('newsModal'), {
      keyboard: false
    });

    newsModal.show();
    const modalTitle = document.querySelector('#newsModal .modal-title');
    modalTitle.textContent = news.title;

    const newsArticle = document.querySelector('#newsModal .news-article');
    newsArticle.innerHTML = '';

    const dateSpan = document.querySelector('#newsModal .news-article-date .dateSpan');
    const date = excelToDate(news.date);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    dateSpan.textContent = `${day}/${month}/${year}`;

    const image = document.querySelector('#newsModal .news-image-background');

    (async () => {
      const url = news.image;
      const exists = await imageExists(url);

      if (exists) {
        //remove d-none from image
        image.classList.remove('d-none');
        console.log("✅ La imagen existe:", url);
        image.src = news.image;
      } else {
        //add d-none to image
        image.classList.add('d-none');
      }
    })();






    if (ai) {
      await generateAndRenderArticle(news, newsList, "Generating", false);

      const regenerateButton = document.getElementById('regenerateArticle');
      if (regenerateButton) {
        // evitar listeners duplicados si abres varias noticias
        regenerateButton.replaceWith(regenerateButton.cloneNode(true));
        const newRegenerateButton = document.getElementById('regenerateArticle');

        newRegenerateButton.addEventListener('click', async () => {
          await generateAndRenderArticle(news, newsList, "Regenerating", true);
        });
      }
    }
    else {
      const noApiFoundSpan = document.createElement('span');
      noApiFoundSpan.classList.add('news-error');
      noApiFoundSpan.textContent = "No API key found. Please set it in the settings.";
      newsArticle.appendChild(noApiFoundSpan);
      const googleAIStudioSpan = document.createElement('p');
      googleAIStudioSpan.classList.add('news-error', 'news-error-api-key');
      googleAIStudioSpan.innerHTML = `If you want to read AI-generated articles from the news section, please enter your API key here. You can get one for free
                from <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a> clicking on
                <span class="important-text bold-font">Create API Key</span> on the top right corner`
      newsArticle.appendChild(googleAIStudioSpan);
    }

  });
}

async function generateAndRenderArticle(news, newsList, label = "Generating", force = false) {
  if (!ai) {
    console.warn("AI not initialized");
    return;
  }

  const newsArticle = document.querySelector('#newsModal .news-article');
  newsArticle.innerHTML = '';

  const loaderDiv = document.createElement('div');
  loaderDiv.classList.add('loader-div');

  const loadingSpan = document.createElement('span');
  loadingSpan.textContent = label;

  const loadingDots = document.createElement('span');
  loadingDots.textContent = ".";
  loadingDots.classList.add('loading-dots');
  loadingSpan.appendChild(loadingDots);

  const dotsInterval = setInterval(() => {
    loadingDots.textContent = loadingDots.textContent.length >= 3 ? "." : loadingDots.textContent + ".";
  }, 500);

  const progressBar = document.createElement('div');
  progressBar.classList.add('ai-progress-bar');
  const progressDiv = document.createElement('div');
  progressDiv.classList.add('progress-div');

  progressBar.appendChild(progressDiv);
  loaderDiv.appendChild(loadingSpan);
  loaderDiv.appendChild(progressBar);
  newsArticle.appendChild(loaderDiv);

  let progress = 0;
  const interval = setInterval(() => {
    progress += 3;
    if (progressDiv) progressDiv.style.width = progress + '%';
    if (progress >= 30) clearInterval(interval);
  }, 150);

  try {
    const articleText = await manageRead(news, newsList, progressDiv, interval, { force });

    clearInterval(interval);
    clearInterval(dotsInterval);
    progressDiv.style.width = '100%';

    setTimeout(() => {
      loaderDiv.style.opacity = '0';
      newsArticle.style.opacity = '0';
      setTimeout(() => {
        loaderDiv.remove();
        const rawHtml = marked.parse(articleText);
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        newsArticle.innerHTML = cleanHtml;
        newsArticle.style.opacity = '1';
      }, 150);
    }, 200);
  } catch (err) {
    console.error("Error generating article:", err);
    clearInterval(interval);
    clearInterval(dotsInterval);
  }
}

function manageTurningPointButtons(news, newsList, maxDate, newsBody, readbuttonContainer, newsAvailable) {
  let approveButton, randomButton, cancelButton;


  if (news.turning_point_type === "original") {
    const tpDiv = document.createElement('div');
    tpDiv.classList.add('turning-point-div');

    cancelButton = document.createElement('div');
    cancelButton.classList.add('cancel-tp', 'tp-button');
    const cancelIcon = document.createElement('i');
    cancelIcon.classList.add('bi', 'bi-x', 'tp-icon');
    cancelButton.appendChild(cancelIcon);
    tpDiv.appendChild(cancelButton);

    cancelButton.addEventListener('click', async () => {
      randomButton.remove();
      approveButton.remove();
      cancelButton.classList.add('tp-button-selected');

      const resultSpan = document.createElement('span');
      resultSpan.classList.add('tp-result-span');
      resultSpan.innerText = "Cancelled";
      cancelButton.innerHTML = '';
      cancelButton.appendChild(resultSpan);

      cancelButton.replaceWith(cancelButton.cloneNode(true));

      const command = new Command("cancelTurningPoint", {
        turningPointData: news.data,
        type: news.type,
        maxDate: maxDate,
        id: news.id
      });
      let newResp = await command.promiseExecute();
      place_turning_outcome(newResp.content, newsList);
    });

    randomButton = document.createElement('div');
    randomButton.classList.add('random-tp', 'tp-button');
    const randomIcon = document.createElement('i');
    randomIcon.classList.add('bi', 'bi-question', 'tp-icon');
    randomButton.appendChild(randomIcon);
    tpDiv.appendChild(randomButton);

    approveButton = document.createElement('div');
    approveButton.classList.add('approve-tp', 'tp-button');
    const approveIcon = document.createElement('i');
    approveIcon.classList.add('bi', 'bi-check', 'tp-icon');
    approveButton.appendChild(approveIcon);
    tpDiv.appendChild(approveButton);
    let nonReadable = false;

    approveButton.addEventListener('click', async () => {
      //has the news text
      if (!news.text || news.text.length === 0) {
        const ok = await confirmModal({
          title: "Approve Turning Point",
          body: "Are you sure you want to approve this turning point? If you approve it before reading the article, it will not be able to generate the article further down the line.",
          confirmText: "Approve",
          cancelText: "Cancel"
        });

        if (!ok) return;
        else {
          const readButton = newsBody.querySelector('.read-button-container .read-button');
          readButton.remove();
          nonReadable = true;
        }
      }

      //remove the other 2 buttons
      randomButton.remove();
      cancelButton.remove();
      approveButton.classList.add('tp-button-selected');
      //remove the icon and add text "Approved"
      const resultSpan = document.createElement('span');
      resultSpan.classList.add('tp-result-span');
      resultSpan.innerText = "Approved";
      approveButton.innerHTML = '';
      approveButton.appendChild(resultSpan);

      //remove the eventListener
      approveButton.replaceWith(approveButton.cloneNode(true));

      const command = new Command("approveTurningPoint", {
        turningPointData: news.data,
        type: news.type,
        maxDate: maxDate,
        id: news.id,
        nonReadable: nonReadable === true
      });

      const newResp = await command.promiseExecute();
      place_turning_outcome(newResp.content, newsList);

      if (news.type === "turning_point_transfer" || news.type === "turning_point_outcome_transfer") {
        const commandDrivers = new Command("driversRefresh", {});
        commandDrivers.execute();
      }
      else if (news.type === "turning_point_technical_directive") {
        const commandTechDir = new Command("performanceRefresh", {});
        commandTechDir.execute();
      }
      else if (news.type === "turning_point_race_substitution") {
        const commandYear = new Command("yearSelected", {
          year: news.data.season,
          isCurrentYear: true
        });
        commandYear.execute();

        const commandCalendar = new Command("calendarRefresh", {});
        commandCalendar.execute();
      }

    });



    randomButton.addEventListener('click', () => {
      // Evita dobles clics
      randomButton.classList.add('tp-button-selected');
      const span = document.createElement('span');
      span.classList.add('tp-result-span');
      span.innerText = 'Deciding...';
      randomButton.innerHTML = '';
      randomButton.appendChild(span);
      randomButton.style.pointerEvents = 'none';

      // 50-50
      const approve = Math.random() < 0.5;

      if (approve && approveButton?.isConnected) {
        approveButton.click();
      } else if (cancelButton?.isConnected) {
        cancelButton.click();
      } else if (approveButton) {
        approveButton.click();
      }
    });

    readbuttonContainer.appendChild(tpDiv);
  }
  else if (news.turning_point_type === "approved") {
    const tpDiv = document.createElement('div');
    tpDiv.classList.add('turning-point-div');
    const approvedButton = document.createElement('div');
    approvedButton.classList.add('approve-tp', 'tp-button', 'tp-button-selected');
    const approvedSpan = document.createElement('span');
    approvedSpan.classList.add('tp-result-span');
    approvedSpan.innerText = "Approved";
    approvedButton.appendChild(approvedSpan);
    tpDiv.appendChild(approvedButton);
    readbuttonContainer.appendChild(tpDiv);
  }
  else if (news.turning_point_type === "cancelled") {
    const tpDiv = document.createElement('div');
    tpDiv.classList.add('turning-point-div');
    const cancelledButton = document.createElement('div');
    cancelledButton.classList.add('cancel-tp', 'tp-button', 'tp-button-selected');
    const cancelledSpan = document.createElement('span');
    cancelledSpan.classList.add('tp-result-span');
    cancelledSpan.innerText = "Cancelled";
    cancelledButton.appendChild(cancelledSpan);
    tpDiv.appendChild(cancelledButton);
    readbuttonContainer.appendChild(tpDiv);
  }


  if (!newsAvailable.turning) {
    const showInsiderModal = async () => {
      await confirmModal({
        title: "Insider News Unavailable",
        body: "Insider news are currently unavailable. To unlock insider news and be able to decide the outcome of turning points, please consider subscribing to the INSIDER tier on our Patreon page.",
        confirmText: "Okay"
      });
    };

    const swap = (btn) => {
      if (!btn) return null;
      const clone = btn.cloneNode(true); // clona (sin listeners)
      btn.replaceWith(clone);            // mete el clon en el DOM
      clone.addEventListener('click', showInsiderModal); // añade el nuevo listener
      return clone;                       // devuelve la nueva referencia
    };

    // ¡OJO!: usa let para poder reasignar
    approveButton = swap(approveButton);
    randomButton = swap(randomButton);
    cancelButton = swap(cancelButton);
  }
}

function createNewsItemElement(news, index, newsAvailable, newsList, maxDate) {
  const isTurning =
    news.turning_point_type === 'original' ||
    news.turning_point_type === 'approved' ||
    news.turning_point_type === 'cancelled';
  const newsItem = document.createElement('div');
  newsItem.classList.add('news-item', 'fade-in');
  newsItem.setAttribute('style', '--order: ' + (index + 1));

  if (news.hiddenByAvailability) {
    newsItem.dataset.hiddenReason = news.hiddenReason || 'none';
    newsItem.classList.add('hidden-by-availability'); // para que lo estilices si quieres
  }

  const newsBody = document.createElement('div');
  newsBody.classList.add('news-body');
  const titleAndArticle = document.createElement('div');
  titleAndArticle.classList.add('title-and-article');

  const newsTitle = document.createElement('span');
  newsTitle.classList.add('news-title', 'bold-font');
  newsTitle.textContent = news.title;

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('news-image-container');

  const readbuttonContainer = document.createElement('div');
  readbuttonContainer.classList.add('read-button-container');

  const readButton = document.createElement('div');
  readButton.classList.add('read-button');
  const readButtonSpan = document.createElement('span');
  readButtonSpan.classList.add('gradient-text');
  readButtonSpan.innerText = "Read";
  readButton.appendChild(readButtonSpan);

  manage_overlay(imageContainer, news.overlay, news.data, news.image);

  const image = document.createElement('img');
  image.classList.add('news-image');
  image.setAttribute('data-src', news.image);
  image.src = news.image;
  image.setAttribute('loading', 'lazy');

  imageContainer.appendChild(image);


  if (news.hiddenByAvailability) {
    const blockedDiv = document.createElement('div');
    blockedDiv.classList.add('no-image-by-availability');
    const lockIcon = document.createElement('i');
    lockIcon.classList.add('bi', 'bi-lock', 'no-image-lock-icon');
    const infoSpan = document.createElement('span');
    infoSpan.classList.add('no-image-info');
    blockedDiv.appendChild(lockIcon);
    blockedDiv.appendChild(infoSpan);
    newsTitle.classList.add('disabled-title');
    const secondLockIcon = document.createElement('i');
    secondLockIcon.classList.add('bi', 'bi-lock-fill', 'disabled-title-lock-icon');
    titleAndArticle.prepend(secondLockIcon);
    newsTitle.textContent = "Backer-only content";
    imageContainer.appendChild(blockedDiv);
    if (news.turning_point_type === undefined) {
      infoSpan.innerHTML = "Subscribe to the <span class='bold-font'>BACKER</span> tier to unlock and read all news articles!";
      newsTitle.textContent = "Backer-only content";
    }
    else {
      infoSpan.innerHTML = "Subscribe to the <span class='bold-font'>INSIDER</span> tier to read and <span class='bold-font'>DECIDE</span> the outcome of turning points!";
      newsTitle.textContent = "Insider-only content";
    }

    const patreonButton = document.createElement('a');
    patreonButton.classList.add('patreon-button');
    patreonButton.href = "https://www.patreon.com/cw/f1dbeditor/membership";
    //open in a new window
    patreonButton.target = "_blank";
    const patreonIcon = document.createElement('div');
    patreonIcon.classList.add('patreon-button-logo');
    const patreonSpan = document.createElement('span');
    patreonSpan.classList.add('patreon-button-text');
    patreonSpan.textContent = "Support us on Patreon";
    patreonButton.appendChild(patreonIcon);
    patreonButton.appendChild(patreonSpan);
    blockedDiv.appendChild(patreonButton);
  }


  addReadButtonListener(readButton, newsItem, news, newsList);

  newsItem.appendChild(imageContainer);
  titleAndArticle.appendChild(newsTitle);
  newsBody.appendChild(titleAndArticle);

  manageTurningPointButtons(news, newsList, maxDate, newsBody, readbuttonContainer, newsAvailable);


  newsBody.appendChild(readbuttonContainer);

  if (!news.nonReadable || news.nonReadable === false) { //first check - if the news is readable
    if (newsAvailable.normal === true && !isTurning) { //second check - if normal news are available
      readbuttonContainer.appendChild(readButton);
    }

    if (newsAvailable.turning === true && isTurning) { //second check - if insider news are available
      readbuttonContainer.appendChild(readButton);
    }

  }


  newsItem.appendChild(newsBody);

  if (news.type === "race_result" || news.type === "quali_result") {
    newsItem.dataset.type = news.type;
  }
  else if (news.type === "fake_transfer" || news.type === "big_transfer" || news.type === "contract_renewal" || news.type === "silly_season_rumors") {
    newsItem.dataset.type = "driver_transfers";
  }
  else if (news.type === "potential_champion" || news.type === "world_champion" || news.type === "season_review" || news.type === "team_comparison" || news.type === "driver_comparison") {
    newsItem.dataset.type = "others";
  }
  else if (news.type.includes("turning_point")) {
    newsItem.dataset.type = "turning_points";
  }
  return newsItem;
}

function computeStableKey(n) {
  if (n.id != null && n.id !== "") return String(n.id);
  return "h:" + hashStr(`${n.title}|${n.date}`);
}



export async function place_news(newsAndTurningPoints, newsAvailable) {
  let newsList = newsAndTurningPoints.newsList;
  let turningPointState = newsAndTurningPoints.turningPointState;
  await finishGeneralLoader();

  let maxDate;
  newsGrid.innerHTML = '';

  for (let i = 0; i < newsList.length; i++) {
    const news = newsList[i];

    // clave estable
    news.stableKey = news.stableKey ?? computeStableKey(news);

    const isTurning = (
      news.turning_point_type === 'original' ||
      news.turning_point_type === 'approved' ||
      news.turning_point_type === 'cancelled'
    );

    const h = hashStr(news.stableKey);
    if (!newsAvailable.turning && isTurning) {
      news.hiddenByAvailability = (h % BUCKET_TURNING) !== 0;
      news.hiddenReason = news.hiddenByAvailability ? 'turning' : null;
    } else if (!newsAvailable.normal && !isTurning) {
      news.hiddenByAvailability = (h % BUCKET_NORMAL) !== 0;
      news.hiddenReason = news.hiddenByAvailability ? 'normal' : null;
    } else {
      news.hiddenByAvailability = false;
      news.hiddenReason = null;
    }


    if (!maxDate || news.date > maxDate) maxDate = news.date;

    const newsItem = createNewsItemElement(news, i, newsAvailable, newsList, maxDate);
    newsGrid.appendChild(newsItem);
    setTimeout(() => {
      newsItem.classList.remove('fade-in');
      newsItem.style.removeProperty('--order');
      newsItem.style.opacity = '1';
    }, 1500);
  }
}

export async function place_turning_outcome(turningPointResponse, newsList) {
  let saveName = getSaveName();
  saveName = saveName.split('.')[0];

  const newsItem = document.createElement('div');
  newsItem.classList.add('news-item', 'fade-in');

  const newsBody = document.createElement('div');
  newsBody.classList.add('news-body');
  const titleAndArticle = document.createElement('div');
  titleAndArticle.classList.add('title-and-article');
  const newsTitle = document.createElement('span');
  newsTitle.classList.add('news-title', 'bold-font');
  newsTitle.textContent = turningPointResponse.title;

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('news-image-container');

  manage_overlay(imageContainer, turningPointResponse.overlay, turningPointResponse.data, turningPointResponse.image);

  const image = document.createElement('img');
  image.classList.add('news-image');
  image.setAttribute('data-src', turningPointResponse.image);
  image.src = turningPointResponse.image;
  image.setAttribute("loading", "lazy");

  const readbuttonContainer = document.createElement('div');
  readbuttonContainer.classList.add('read-button-container');

  const readButton = document.createElement('div');
  readButton.classList.add('read-button');
  const readButtonSpan = document.createElement('span');
  readButtonSpan.classList.add('gradient-text');
  readButtonSpan.innerText = "Read";
  readButton.appendChild(readButtonSpan);

  readButton.addEventListener('click', async () => {
    const newsModal = new bootstrap.Modal(document.getElementById('newsModal'), {
      keyboard: false
    });
    newsModal.show();

    const modalTitle = document.querySelector('#newsModal .modal-title');
    modalTitle.textContent = turningPointResponse.title;

    const newsArticle = document.querySelector('#newsModal .news-article');
    newsArticle.innerHTML = '';


    const dateSpan = document.querySelector('#newsModal .news-article-date .dateSpan');
    const date = excelToDate(turningPointResponse.date);


    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    dateSpan.textContent = `${day}/${month}/${year}`;

    const image = document.querySelector('#newsModal .news-image-background');
    image.src = turningPointResponse.image;

    if (ai) {
      await generateAndRenderArticle(turningPointResponse, newsList, "Generating", false);

      // Hook para REGENERAR (misma lógica, forzando)
      const regenBtn = document.getElementById('regenerateArticle');
      if (regenBtn) {
        regenBtn.replaceWith(regenBtn.cloneNode(true)); // evita listeners duplicados
        const newRegenBtn = document.getElementById('regenerateArticle');
        newRegenBtn.addEventListener('click', () => {
          generateAndRenderArticle(turningPointResponse, newsList, "Regenerating", true);
        });
      }
    }
    else {
      const noApiFoundSpan = document.createElement('span');
      noApiFoundSpan.classList.add('news-error');
      noApiFoundSpan.textContent = "No API key found. Please set it in the settings.";
      newsArticle.appendChild(noApiFoundSpan);
      const googleAIStudioSpan = document.createElement('p');
      googleAIStudioSpan.classList.add('news-error', 'news-error-api-key');
      googleAIStudioSpan.innerHTML = `If you want to read AI-generated articles from the news section, please enter your API key here. You can get one for free
                  from <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a> clicking on
                  <span class="important-text bold-font">Create API Key</span> on the top right corner`
      newsArticle.appendChild(googleAIStudioSpan);
    }

  });

  imageContainer.appendChild(image);
  newsItem.appendChild(imageContainer);
  titleAndArticle.appendChild(newsTitle);
  newsBody.appendChild(titleAndArticle);
  readbuttonContainer.appendChild(readButton);
  newsBody.appendChild(readbuttonContainer);
  newsItem.appendChild(newsBody);


  //append it at the start of the news grid
  prependAnimated(newsGrid, newsItem, 250, 'cubic-bezier(.2,.8,.2,1)');
}

async function imageExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (err) {
    return false;
  }
}

function prependAnimated(container, newEl, duration = 250, easing = 'ease') {
  // 1) Hijos actuales y posiciones BEFORE
  const oldChildren = Array.from(container.children);
  const before = new Map();
  oldChildren.forEach(el => before.set(el, el.getBoundingClientRect()));

  // 2) Inserta el nuevo al principio (todavía sin transición)
  container.insertBefore(newEl, container.firstChild);

  // 3) Forzamos reflow tras el insert (importante)
  //    Leer una propiedad de layout obliga al navegador a calcular posiciones.
  //    offsetHeight / getBoundingClientRect / getComputedStyle valen.
  void container.offsetHeight;

  // 4) Posiciones AFTER de los elementos que ya estaban
  const after = new Map();
  oldChildren.forEach(el => after.set(el, el.getBoundingClientRect()));

  // 5) Preparar el NUEVO para entrar desde arriba (sin transición aún)
  const newRect = newEl.getBoundingClientRect();
  newEl.style.willChange = 'transform, opacity';
  newEl.style.transform = `translateY(-${newRect.height}px)`;
  newEl.style.opacity = '0';

  // 6) Preparar los ANTIGUOS con el delta (sin transición aún)
  oldChildren.forEach(el => {
    const a = after.get(el);
    const b = before.get(el);
    if (!a || !b) return;
    const dx = b.left - a.left;
    const dy = b.top - a.top;
    if (dx === 0 && dy === 0) return;
    el.style.willChange = 'transform';
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  // 7) Forzamos reflow otra vez para “congelar” los transforms iniciales
  void container.offsetHeight;

  // 8) Activamos transición y “soltamos” a 0 para que animen
  newEl.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
  oldChildren.forEach(el => {
    el.style.transition = `transform ${duration}ms ${easing}`;
  });

  // Usar rAF ayuda a que el navegador separe bien los pasos
  requestAnimationFrame(() => {
    newEl.style.transform = 'translate(0, 0)';
    newEl.style.opacity = '1';
    oldChildren.forEach(el => {
      el.style.transform = 'translate(0, 0)';
    });
  });

  // 9) Limpieza al terminar
  const clean = (el, prop) => (e) => {
    if (e.propertyName !== prop) return;
    el.style.transition = '';
    el.style.transform = '';
    el.style.willChange = '';
    if (el === newEl) el.style.opacity = '';
    el.removeEventListener('transitionend', cleanupFns.get(el));
    cleanupFns.delete(el);
  };
  const cleanupFns = new Map();
  oldChildren.forEach(el => {
    const fn = clean(el, 'transform');
    cleanupFns.set(el, fn);
    el.addEventListener('transitionend', fn);
  });
  const newFn = clean(newEl, 'opacity');
  cleanupFns.set(newEl, newFn);
  newEl.addEventListener('transitionend', newFn);
}

function addTurningPointContexts(prompt) {
  let saveName = getSaveName();
  //remove file extension if any
  saveName = saveName.split('.')[0];
  let newsName = `${saveName}_news`;
  const news = JSON.parse(localStorage.getItem(newsName)) || [];
  const newsWithId = Object.entries(news).map(([id, n]) => ({ id, ...n }));
  const turningPointsOutcomes = newsWithId.filter(n => n.id.startsWith('turning_point_outcome_'));

  if (turningPointsOutcomes.length > 0) {
    let number = 1;
    prompt += `\n\nHere are some other events that happened through the season. Talk about them if relevant to the article:`
    const turningOutcomesText = turningPointsOutcomes.map(tp => {
      if (tp.turning_point_type === "positive") {
        if (tp.id.includes("investment")) {
          return `${number++}. ${tp.data.country} made an investment of ${tp.data.investmentAmount} million dollars into ${tp.data.teamName}, buying a ${tp.data.investmentShare}% of their racing division.`
        }
        else if (tp.id.includes("technical_directive")) {
          return `${number++}. The FIA introduced a technical directive in relation to the ${tp.data.component} because of ${tp.data.reason}.`
        }
        else if (tp.id.includes("dsq")) {
          return `${number++}. After the post-race technical inspection of the ${tp.data.country} GP, both cars from ${tp.data.team} were disqualified due to an ilegality with their ${tp.data.component}.`
        }
        else if (tp.id.includes("substitution")) {
          return `${number++}. The race that was going to be held in ${tp.data.originalCountry} was cancelled due to ${tp.data.reason} and was substituted by a race in ${tp.data.substituteCountry}.`
        }
        else if (tp.id.includes("transfer")) {
          return `${number++}. ${tp.data.driver_out?.name} lost his seat at ${tp.data.team} and ${tp.data.driver_in?.name} has been signed to replace him.`;
        }
      }
    }).join("\n");
    prompt += `\n${turningOutcomesText}`;
  }
  return prompt;
}


function buildContextualPrompt(data, config = {}) {
  const {
    driverStandings,
    teamStandings,
    driversResults,
    racesNames,
    champions,
    driverQualiResults,
    enrichedAllTime
  } = data;
  const { timing = '', teamId = null, teamName = '', seasonYear = '' } = config;
  console.log("Building contextual prompt with data:", data, "and config:", config);

  let prompt = '';

  if (driverStandings) {
    const driversChamp = driverStandings
      .map((d, i) => `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts`)
      .join("\n");
    prompt += `\n\nCurrent Drivers' Championship standings ${timing}:\n${driversChamp}`;
  }

  if (teamStandings) {
    const teamsChamp = teamStandings
      .map((t, i) => {
        const name = combined_dict[t.teamId] || `Team ${t.teamId}`;
        return `${i + 1}. ${name} — ${t.points} pts`;
      })
      .join("\n");
    prompt += `\n\nCurrent Constructors' Championship standings ${timing}:\n${teamsChamp}`;
  }

  if (racesNames && racesNames.length > 0) {
    let previousRaces = racesNames.join(', ');
    prompt += `\n\nThe races that have already taken place in ${seasonYear} are: ${previousRaces}\n`;
  }

  if (driversResults) {
    let resultsToProcess = driversResults;
    if (teamId) {
      resultsToProcess = driversResults.filter(d => d.teamId === teamId);
    }

    const previousResults = resultsToProcess.map((d) => {
      const details = [
        d.nWins > 0 ? `${d.nWins} wins` : '',
        d.nPodiums > 0 ? `${d.nPodiums} podiums` : '',
        (d.nWins === 0 && d.nPodiums === 0 && d.nPointsFinishes > 0) ? `${d.nPointsFinishes} points finishes` : ''
      ].filter(Boolean).join(', ');

      return `${d.name}${details ? ` (${details})` : ''} ${d.resultsString}`;
    }).join("\n");

    if (teamId && teamName) {
      prompt += `\n\nHere are the previous race results for ${teamName}'s drivers:\n${previousResults}`;
    } else if (resultsToProcess.length > 0) {
      prompt += `\n\nHere are the previous race results for each driver:\n${previousResults}`;
    }
  }

  if (champions) {
    const previousChampions = Object.values(
      champions.reduce((acc, { season, pos, name, points }) => {
        if (!acc[season]) acc[season] = { season, drivers: [] };
        acc[season].drivers.push(`${pos}. ${name} ${points}pts`);
        return acc;
      }, {})
    )
      .sort((a, b) => b.season - a.season)
      .map(({ season, drivers }) => `${season}\n${drivers.join('\n')}`)
      .join('\n\n');
    prompt += `\n\nIf you want to mention that someone is the reigning champion, here are the last F1 world champions and runner ups:\n${previousChampions}`;
  }

  if (driverQualiResults) {
    let qualiResultsToProcess = driverQualiResults;
    if (teamId) {
      qualiResultsToProcess = driverQualiResults.filter(d => d.teamId === teamId);
    }

    const previousQualiResults = qualiResultsToProcess.map(d => `${d.name} - ${d.resultsString}`).join("\n");

    if (teamId && teamName) {
      prompt += `\n\nHere are the previous qualifying results for ${teamName}'s drivers:\n${previousQualiResults}`;
    } else if (qualiResultsToProcess.length > 0) {
      prompt += `\n\nHere are the previous qualifying results for each driver:\n${previousQualiResults}`;
    }
  }

  if (enrichedAllTime.length > 0) {
    let list = enrichedAllTime;

    // Si los objetos tienen teamId y hay filtro, aplícalo
    if (teamId && 'teamId' in (list[0] || {})) {
      list = list.filter(d => d.teamId === teamId);
    }

    // Construye las líneas: "<nombre>: X titles, Y wins, Z podiums, W race starts"
    const lines = list.map(d => {
      const titles = d.totalChampionshipWins ?? 0;
      const wins = d.totalWins ?? 0;
      const podiums = d.totalPodiums ?? 0;
      const starts = d.totalStarts ?? 0;
      const name = d.name || `Driver ${d.id}`;

      const tLbl = titles === 1 ? 'drivers championship' : 'drivers championships';
      const wLbl = wins === 1 ? 'race win' : 'race wins';
      const pLbl = podiums === 1 ? 'podium' : 'podiums';
      const sLbl = 'race starts';

      return `${name}: ${titles} ${tLbl}, ${wins} ${wLbl}, ${podiums} ${pLbl}, ${starts} ${sLbl}`;
    }).join('\n');


    if (lines) {
      prompt += `\n\nHere are the stats for each driver in the grid. Only mention them if relevant:\n${lines}`;
    }
  }

  return prompt;
}

async function manageRead(newData, newsList, barProgressDiv, interval, opts = {}) {
  const { force = false } = opts;

  // 1) Si ya hay texto y NO forzamos, devolvemos el existente
  if (newData.text && !force) {
    clearInterval(interval);
    if (barProgressDiv) barProgressDiv.style.width = '100%';
    return newData.text;
  }

  // 2) Tabla de contextualizadores
  const ctx = {
    race_result: contextualizeRaceResults,
    quali_result: contextualizeQualiResults,
    fake_transfer: contextualizeFakeTransferNews,
    silly_season_rumors: contextualizeSillySeasonTransferNews,
    potential_champion: contextualizePotentialChampion,
    world_champion: contextualizeWorldChampion,
    big_transfer: contextualizeBigTransferConfirm,
    contract_renewal: contextualizeRenewalNews,
    team_comparison: contextualizeTeamComparison,
    driver_comparison: contextualizeDriverComparison,
    season_review: contextualizeSeasonReview,

    // Turning points: outcome_ y no-outcome comparten handler
    turning_point_dsq: (nd) => contextualizeDSQ(nd, nd.turning_point_type),
    turning_point_transfer: (nd) => contextualizeTurningPointTransfer(nd, nd.turning_point_type),
    turning_point_technical_directive: (nd) => contextualizeTurningPointTechnicalDirective(nd, nd.turning_point_type),
    turning_point_investment: (nd) => contextualizeTurningPointInvestment(nd, nd.turning_point_type),
    turning_point_race_substitution: (nd) => contextualizeTurningPointRaceSubstitution(nd, nd.turning_point_type),
  };

  // 3) Normaliza tipos "turning_point_outcome_*" -> "turning_point_*"
  const normalizeType = (t) =>
    t?.startsWith("turning_point_outcome_")
      ? t.replace("turning_point_outcome_", "turning_point_")
      : t;

  const type = normalizeType(newData.type);
  const handler = ctx[type];
  if (!handler) {
    console.warn("No handler for news type:", newData.type);
  }

  // 4) Progreso visual
  clearInterval(interval); // detenemos el anterior
  let progressInterval;
  try {
    if (barProgressDiv) barProgressDiv.style.width = '50%';
    let progress = 50;
    progressInterval = setInterval(() => {
      progress = Math.min(progress + 1, 98);
      if (barProgressDiv) barProgressDiv.style.width = progress + '%';
      if (progress >= 98) clearInterval(progressInterval);
    }, 350);

    // 5) Construir prompt SOLO si hace falta
    let prompt = "";
    if (handler) {
      const base = await handler(newData);
      const normalDate = excelToDate(newData.date); // ya la tienes
      const isoDate = new Date(
        normalDate.getFullYear(),
        normalDate.getMonth(),
        normalDate.getDate()
      ).toISOString().split("T")[0]; // evita sorpresas de TZ en toISOString

      prompt =
        `The current date is ${isoDate}\n\n` +
        base +
        `\n\nAdd any quote you find apporpiate from the drivers or team principals if involved in the article. ` +
        `Do not take this as a mandatory instruction, only add quotes if you find them relevant to the context of the article.` +
        `\nThe title of the article is: "${newData.title}"\n\nPlease write a detailed article based on the title and the context provided.`;

      // Contextos extra de Turning Points (si tu helper ya es idempotente, no pasa nada por llamarlo siempre)
      prompt = addTurningPointContexts(prompt);

      prompt += `
      Use **Markdown** formatting in your response for better readability:
      - Use "#" or "##" for main and secondary titles.
      - Use **bold** for important names or key phrases.
      - Use *italics* for quotes or emotional emphasis.
      - Use bullet points or numbered lists if needed.
      Do not include any raw HTML or code blocks.
      The final output must be valid Markdown ready to render as HTML.`;
    }

    console.log("Final prompt for AI:", prompt);

    // 6) Llama a la IA y guarda
    const articleText = await askGenAI(prompt);
    newData.text = articleText;

    new Command("updateNews", {
      stableKey: newData.id ?? computeStableKey(newData),
      patch: { text: articleText }
    }).execute();

    if (barProgressDiv) barProgressDiv.style.width = '100%';
    return articleText;

  } finally {
    if (progressInterval) clearInterval(progressInterval);
  }
}


async function contextualizeTurningPointRaceSubstitution(newData, turningPointType) {
  const promptTemplateEntry = turningPointsTemplates.find(t => t.new_type === 105);
  let prompt;
  let seasonYear = newData.data.season;
  if (turningPointType.includes("positive")) {
    prompt = promptTemplateEntry.positive_prompt;
  }
  else if (turningPointType.includes("negative")) {
    prompt = promptTemplateEntry.negative_prompt;
  }
  else {
    prompt = promptTemplateEntry.prompt;
  }
  prompt = prompt.replace(/{{\s*original_race\s*}}/g, newData.data.originalCountry || 'The original race').
    replace(/{{\s*substitute_race\s*}}/g, newData.data.substituteCountry || 'The substituted race').
    replace(/{{\s*reason\s*}}/g, newData.data.reason || 'The reason');

  const command = new Command("fullChampionshipDetailsRequest", {
    season: seasonYear,
  });

  let resp;
  try {
    resp = await command.promiseExecute();
  } catch (err) {
    console.error("Error fetching full championship details:", err);
    return;
  }

  prompt += buildContextualPrompt(resp.content, { seasonYear });

  return prompt;
}

async function contextualizeTurningPointInvestment(newData, turningPointType) {
  const promptTemplateEntry = turningPointsTemplates.find(t => t.new_type === 102);
  console.log("Prompt template entry:", promptTemplateEntry);
  let prompt;
  let seasonYear = newData.data.season;
  if (turningPointType.includes("positive")) {
    prompt = promptTemplateEntry.positive_prompt;
  }
  else if (turningPointType.includes("negative")) {
    prompt = promptTemplateEntry.negative_prompt;
  }
  else {
    prompt = promptTemplateEntry.prompt;
  }

  prompt = prompt.replace(/{{\s*team\s*}}/g, newData.data.team || 'The team').
    replace(/{{\s*amount\s*}}/g, newData.data.investmentAmount || 'X').
    replace(/{{\s*share\s*}}/g, newData.data.investmentShare || 'X').
    replace(/{{\s*country\s*}}/g, newData.data.country || 'X');

  const command = new Command("fullChampionshipDetailsRequest", {
    season: seasonYear,
  });

  let resp;
  try {
    resp = await command.promiseExecute();
  } catch (err) {
    console.error("Error fetching full championship details:", err);
    return;
  }

  prompt += buildContextualPrompt(resp.content, { seasonYear });

  return prompt;
}

async function contextualizeDSQ(newData, type) {
  const promptTemplateEntry = turningPointsTemplates.find(t => t.new_type === 103);
  let prompt;
  let currentSeason = newData.data.currentSeason;
  let teamName = newData.data.team;
  let teamId = newData.data.teamId;
  if (type.includes("positive")) {
    prompt = promptTemplateEntry.positive_prompt;
  }
  else if (type.includes("negative")) {
    prompt = promptTemplateEntry.negative_prompt;
  }
  else {
    prompt = promptTemplateEntry.prompt;
  }

  prompt = prompt.replace(/{{\s*team\s*}}/g, newData.data.team || 'The team').
    replace(/{{\s*adjective\s*}}/g, newData.data.adjective || 'current').
    replace(/{{\s*component\s*}}/g, newData.data.component || 'floor').
    replace(/{{\s*driver_1\s*}}/g, newData.data.driver_1.name || 'Driver 1').
    replace(/{{\s*driver_2\s*}}/g, newData.data.driver_2.name || 'Driver 2').
    replace(/{{\s*driver_1_pos\s*}}/g, newData.data.driver_1.position !== undefined ? newData.data.driver_1.position.toString() : 'X').
    replace(/{{\s*driver_2_pos\s*}}/g, newData.data.driver_2.position !== undefined ? newData.data.driver_2.position.toString() : 'X').
    replace(/{{\s*driver_1_points\s*}}/g, newData.data.driver_1.points !== undefined ? newData.data.driver_1.points.toString() : 'X').
    replace(/{{\s*driver_2_points\s*}}/g, newData.data.driver_2.points !== undefined ? newData.data.driver_2.points.toString() : 'X');

  const command = new Command("fullChampionshipDetailsRequest", {
    season: currentSeason,
  });

  let resp;
  try {
    resp = await command.promiseExecute();
  } catch (err) {
    console.error("Error fetching full championship details:", err);
    return;
  }

  const timing = type.includes("positive") ? "after the disqualification" : "";
  prompt += buildContextualPrompt(resp.content, { timing, teamId, teamName, seasonYear: currentSeason });

  return prompt;

}

async function contextualizeTurningPointTechnicalDirective(newData, turningPointType) {
  const promptTemplateEntry = turningPointsTemplates.find(t => t.new_type === 100);
  let prompt;
  if (turningPointType.includes("positive")) {
    prompt = promptTemplateEntry.positive_prompt;
  }
  else if (turningPointType.includes("negative")) {
    prompt = promptTemplateEntry.negative_prompt;
  }
  else {
    prompt = promptTemplateEntry.prompt;
  }
  let seasonYear = newData.data.season;

  const teams = newData.data.effectOnEachteam;
  //get the best 2 teams and worse 2 by performanceGainLoss. Each team is an object where the key is the teamId and it has an object that has teamName and performanceGainLoss
  const teamPerformances = Object.entries(teams).map(([teamId, { teamName, performanceGainLoss }]) => ({
    teamId,
    teamName,
    performanceGainLoss
  }));

  const bestTeams = teamPerformances.sort((a, b) => b.performanceGainLoss - a.performanceGainLoss).slice(0, 2);
  const worstTeams = teamPerformances.sort((a, b) => a.performanceGainLoss - b.performanceGainLoss).slice(0, 2);

  prompt = prompt.replace(/{{\s*component\s*}}/g, newData.data.component || 'The component').
    replace(/{{\s*best_team\s*}}/g, bestTeams[0]?.teamName || 'The team').
    replace(/{{\s*second_best\s*}}/g, bestTeams[1]?.teamName || 'The team').
    replace(/{{\s*worse_team\s*}}/g, worstTeams[0]?.teamName || 'The team').
    replace(/{{\s*second_worse\s*}}/g, worstTeams[1]?.teamName || 'The team').
    replace(/{{\s*reason\s*}}/g, newData.data.reason || 'The reason')

  const command = new Command("fullChampionshipDetailsRequest", {
    season: seasonYear,
  });

  let resp;
  try {
    resp = await command.promiseExecute();
  } catch (err) {
    console.error("Error fetching full championship details:", err);
    return;
  }

  prompt += buildContextualPrompt(resp.content, { seasonYear });

  return prompt;
}

async function contextualizeTurningPointTransfer(newData, turningPointType) {
  const promptTemplateEntry = turningPointsTemplates.find(t => t.new_type === 101);
  let prompt;
  if (turningPointType.includes("positive")) {
    prompt = promptTemplateEntry.positive_prompt;
  }
  else if (turningPointType.includes("negative")) {
    prompt = promptTemplateEntry.negative_prompt;
  }
  else {
    prompt = promptTemplateEntry.prompt;
  }

  let seasonYear = newData.data.season;
  let driverInTeam = combined_dict[newData.data.driver_in.teamId] || 'the previous team';

  prompt = prompt.replace(/{{\s*driver_in\s*}}/g, newData.data.driver_in.name || 'The driver').
    replace(/{{\s*driver_out\s*}}/g, newData.data.driver_out.name || 'The driver').
    replace(/{{\s*team\s*}}/g, newData.data.team || 'The team').
    replace(/{{\s*driver_in_team\s*}}/g, driverInTeam || 'The previous team')

  let drivers = [
    {
      driverId: newData.data.driver_in.id,
      teamId: newData.data.driver_in.teamId,
      name: newData.data.driver_in.name,
      team: combined_dict[newData.data.driver_in.teamId]
    }
  ]

  let date = newData.date;

  const command = new Command("transferRumorRequest", {
    drivers,
    date
  });

  let resp;
  try {
    resp = await command.promiseExecute();
    console.log("Transfer rumor response:", resp);
  } catch (err) {
    console.error("Error fetching transfer rumor:", err);
    return;
  }

  if (newData.data.driver_substitute && turningPointType.includes("positive")) {
    let driverSubstituteTeam = combined_dict[newData.data.driver_substitute.teamId] || '';
    prompt = prompt.replace(
      /{{\s*driver_substitute_part\s*}}/g,
      () => {
        const substituteName = newData.data.driver_substitute.name;
        const driverInName = newData.data.driver_in.name;
        const inTeam = driverInTeam || 'the team';

        let fromPart;

        if (driverSubstituteTeam) {
          if (driverSubstituteTeam === driverInTeam) {
            fromPart = `from the ${inTeam}'s academy program`;
          } else {
            fromPart = `from ${driverSubstituteTeam}`;
          }
        } else {
          fromPart = 'as a free agent';
        }

        return `${substituteName} will sign for ${inTeam} as a substitute for ${driverInName}, coming ${fromPart}.`;
      }
    );
  }
  else {
    prompt = prompt.replace(/{{\s*driver_substitute_part\s*}}/g, '');
  }


  prompt += buildContextualPrompt(resp.content, { seasonYear });

  return prompt;

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

      prompt += buildContextualPrompt(standingsResp.content, { timing: "after this race" });
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
      const c = standingsResp.content;
      const raceNumber = c.racesNames.length + 1;

      // Arregla el doble "sealed sealed"
      const numberOfRace = `The title could be sealed after race ${raceNumber} out of ${c.nRaces} this season.`;
      prompt += `\n\n${numberOfRace}`;

      // Contexto antes de esta carrera
      prompt += buildContextualPrompt(c, { timing: "before this race" });

      // Reglas de puntos (tal cual las comunicas)
      prompt += `\n\nThe maximum amount of points for the winner in each race is ${c.pointsSchema.twoBiggestPoints[0]}.
      \nIn each sprint race the maximum points for the winner is 8.
      \n${c.pointsSchema.isLastraceDouble ? 'The last race of the season awards double points.' : ''}
      \n${c.pointsSchema.fastestLapBonusPoint ? 'There is also 1 bonus point for the fastest lap (top 10 finish required).' : ''}
      \n${c.pointsSchema.poleBonusPoint ? 'There is also 1 bonus point for pole position in qualifying.' : ''}`;

      // === NUEVO: carreras después de esta (quitamos la primera de remainingRaces) ===
      const rem = Array.isArray(c.remainingRaces) ? c.remainingRaces : [];
      const afterThis = rem.length > 0 ? rem.slice(1) : [];

      if (afterThis.length > 0) {
        const racesText = afterThis
          .map(r => `${r.trackName}${r.sprint ? " (Sprint)" : ""}`)
          .join(", ");
        prompt += `\n\nAfter this race, there will be ${afterThis.length} more: ${racesText}.`;
      } else {
        prompt += `\n\nAfter this race, there will be no more races left.`;
      }

      // === NUEVO: cálculo de puntos máximos aún disponibles DESPUÉS de esta carrera ===
      const schema = c.pointsSchema;
      const raceWinPts = Number(schema.twoBiggestPoints?.[0] ?? 25); // fallback 25
      const sprintWinPts = 8; // según tu texto
      const flBonus = schema.fastestLapBonusPoint ? 1 : 0;
      const poleBonus = schema.poleBonusPoint ? 1 : 0;

      // Sumamos por cada carrera restante (afterThis)
      // Si isLastraceDouble, duplicamos SOLO los puntos de carrera de la última prueba.
      let maxRemaining = 0;
      for (let i = 0; i < afterThis.length; i++) {
        const r = afterThis[i];
        const isLast = i === afterThis.length - 1;
        const baseRacePts = schema.isLastraceDouble && isLast ? raceWinPts * 2 : raceWinPts;
        const sprintPts = r.sprint ? sprintWinPts : 0;

        // Nota: asumimos que los bonus (pole/FL) NO se duplican aunque la última carrera tenga doble puntuación.
        maxRemaining += baseRacePts + sprintPts + flBonus + poleBonus;
      }

      prompt += `\n\nThe maximum number of points still available after this race is ${maxRemaining}.`;
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
      prompt += `${o.potentialTeam} with an expected salary of around ${o.salary}€ per year until ${o.endSeason}, targeting ${o.driverAtRisk}'s seat. ${d.name}'s opinion on salary is ${o.salaryOpinion} and on length is ${o.lengthOpinion}\n`;
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

  prompt += buildContextualPrompt(resp.content);

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


  prompt += buildContextualPrompt(resp.content, { timing: "after this race" });

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


  prompt += buildContextualPrompt(resp.content, { timing: "after this race" });

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


  prompt += buildContextualPrompt(resp.content, { timing: "after this race" });

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
  } catch (err) {
    console.error("Error fetching race details:", err);
    return;
  }

  const currentContextData = {
    driverStandings: resp.content.currentDriverStandings,
    teamStandings: resp.content.currentTeamStandings,
    driversResults: resp.content.currentDriversResults,
    racesNames: resp.content.currentRacesNames
  };
  prompt += buildContextualPrompt(currentContextData, { teamId: newData.data.team.teamId, teamName: team1 });


  const oldRacesNames = resp.content.oldRacesNames.join(', ');
  const oldSeasonResults = resp.content.oldDriversResults
    .filter(d => d.teamId === newData.data.team.teamId)
    .map(d => `${d.name} - ${d.resultsString}`)
    .join("\n");

  prompt += `\n\nHere are the results from ${team1}'s drivers in ${seasonYear - 1}: ${oldRacesNames}\n`;
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

  prompt += buildContextualPrompt(resp.content, { timing: "before this race" });


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



  prompt += buildContextualPrompt(resp.content, { timing: "after this race" });


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
  } catch (err) {
    console.error("Error fetching full championship details:", err);
    return;
  }

  prompt += buildContextualPrompt(resp.content, { teamId, teamName: combined_dict[teamId], seasonYear });

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
  }
  catch (err) {
    console.error("Error fetching full championship details:", err);
    return;
  }

  prompt += buildContextualPrompt(resp.content);

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

  return prompt;


}



function saveTurningPoints(turningPoints) {
  let saveName = getSaveName();
  //remove file extension if any
  saveName = saveName.split('.')[0];
  let tpName = `${saveName}_tps`;
  localStorage.setItem(tpName, JSON.stringify(turningPoints));
}

async function askGenAI(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text;
}


function buildEmergencyOverlay() {
  const overlayDiv = document.createElement('div');
  overlayDiv.classList.add('breaking-news-overlay', 'bold-font');

  const breakingSpan = document.createElement('span');
  breakingSpan.classList.add('breaking-news-breaking');
  breakingSpan.innerText = 'BREAKING';
  overlayDiv.appendChild(breakingSpan);

  const newsSpan = document.createElement('span');
  newsSpan.classList.add('breaking-news-news');
  newsSpan.innerText = 'NEWS';
  overlayDiv.appendChild(newsSpan);

  const bar = document.createElement('div');
  bar.classList.add('breaking-news-bar');
  overlayDiv.appendChild(bar);

  document.body.appendChild(overlayDiv);
  return overlayDiv;
}

function ensureEmergencyOverlay(imageContainer) {
  if (!imageContainer.querySelector('.breaking-news-overlay')) {
    imageContainer.appendChild(buildEmergencyOverlay());
  }
}

function manage_overlay(imageContainer, overlay, data, image) {
  let overlayDiv = null;
  if (overlay === "race-overlay" || overlay === "quali-overlay") {
    overlayDiv = document.createElement('div');
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
    const teamId = data.teamId;
    overlayDiv = document.createElement('div');
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

  try {
    const url =
      (image instanceof HTMLImageElement)
        ? (image.currentSrc || image.src)
        : (typeof image === 'string' ? image : null);

    if (!url) return;
    if (imageContainer.querySelector('.breaking-news-overlay, [class$="-overlay"]')) {
      return;
    }
    const probe = new Image();
    probe.onload = () => { /* ok, no hacemos nada */ };
    probe.onerror = () => { ensureEmergencyOverlay(imageContainer); };
    probe.src = url;
  } catch {
    console.warn('Image probe failed unexpectedly');
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

document.querySelector(".reload-news").addEventListener("click", async () => {
  const newsGrid = document.querySelector(".news-grid");
  newsGrid.innerHTML = '';

  const command = new Command("deleteNews");
  command.execute();

  generateNews();
});