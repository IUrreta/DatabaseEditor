import { team_dict, combined_dict, races_names, names_full, countries_data, logos_disc, lightColors } from "./config";
import { Command } from "../backend/command";
import { getCircuitInfo } from "../backend/scriptUtils/newsUtils";
import newsPromptsTemaplates from "../../data/news/news_prompts_templates.json";
import turningPointsTemplates from "../../data/news/turning_points_prompts_templates.json";
import { currentSeason } from "./transfers";
import { colors_dict } from "./head2head";
import { excelToDate } from "../backend/scriptUtils/eidtStatsUtils";
import { generateNews, getSaveName, confirmModal, updateRateLimitsDisplay } from "./renderer";
import { marked } from 'marked';
import TurndownService from "turndown";
import DOMPurify from "dompurify";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const newsGrid = document.querySelector('.news-grid');
const newsModalEl = document.getElementById('newsModal');
const closeBtn = document.getElementById('closeNewsArticle');
const newsOptionsBtn = document.querySelector('.news-options');
const copyArticleBtn = document.getElementById('copyArticle');
const editArticleBtn = document.getElementById('editArticle');

let interval2 = null;
let cleaning = false;

let currentModalNews = null;
let isEditingArticle = false;
let originalArticleHTML = '';
let editTextarea = null;
let saveArticleBtn = null;
let cancelArticleBtn = null;

let errorCount = 0;
const MAX_ERRORS = 2;


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
  exitArticleEditMode();
  cleanupOpenedNewsItem();
});

function exitArticleEditMode(opts = {}) {
  const { restoreOriginal = true } = opts;
  if (!isEditingArticle) return;

  const newsArticle = document.querySelector('#newsModal .news-article');

  if (newsArticle && restoreOriginal) {
    newsArticle.innerHTML = originalArticleHTML;
  }

  if (saveArticleBtn) saveArticleBtn.remove();
  if (cancelArticleBtn) cancelArticleBtn.remove();

  closeBtn?.classList.remove('d-none');

  isEditingArticle = false;
  originalArticleHTML = '';
  editTextarea = null;
  saveArticleBtn = null;
  cancelArticleBtn = null;
}

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
    exitArticleEditMode();
    currentModalNews = news;
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
        image.src = news.image;
      } else {
        //add d-none to image
        image.classList.add('d-none');
      }
    })();

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

  });
}

async function generateAndRenderArticle(news, newsList, label = "Generating", force = false, model) {
  exitArticleEditMode();
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
    progress += 2;
    if (progressDiv) progressDiv.style.width = progress + '%';
    if (progress >= 20) clearInterval(interval);
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

    loaderDiv.remove();

    const errorDiv = document.createElement('div');
    errorDiv.classList.add('news-error', 'model-error');
    
    if (err.status === 429) {
      errorDiv.innerText = "Daily limit reached. Tomorrow you'll be able to generate more articles.";
      newsArticle.appendChild(errorDiv);
    } else {
      errorDiv.innerText = "Error generating article. Please try again.";
      newsArticle.appendChild(errorDiv);
    }
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

      if (news.type === "turning_point_transfer" || news.type === "turning_point_injury") {
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

function createNewsItemElement(news, index, newsAvailable, newsList, maxDate, isCurrentSeason = true) {
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

  //if news has .isCurrentSeason and its false, remove read button and turning point buttons
  if (isCurrentSeason === false && (news.text === undefined || news.text === null)) {
    readButton.remove();
    const tpDiv = readbuttonContainer.querySelector('.turning-point-div');
    if (tpDiv) tpDiv.remove();
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
  let isCurrentSeason = newsAndTurningPoints.isCurrentSeason;
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

    const newsItem = createNewsItemElement(news, i, newsAvailable, newsList, maxDate, isCurrentSeason);
    newsGrid.appendChild(newsItem);
    setTimeout(() => {
      newsItem.classList.remove('fade-in');
      newsItem.style.removeProperty('--order');
      newsItem.style.opacity = '1';
    }, 1500);
  }

  if (!isCurrentSeason && isCurrentSeason !== undefined){ //if it's undefined it should go to else
    document.querySelector("#reloadNews").classList.add("d-none");
    document.querySelector("#regenerateArticle").classList.add("d-none");
  }
  else{
    document.querySelector("#reloadNews").classList.remove("d-none");
    document.querySelector("#regenerateArticle").classList.remove("d-none");
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
  readButtonSpan.innerText = "Read";
  readButton.appendChild(readButtonSpan);

  readButton.addEventListener('click', async () => {
    exitArticleEditMode();
    currentModalNews = turningPointResponse;
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

async function getTurningPointEvents(date) {
  const command = new Command("getNews", {});
  let resp = await command.promiseExecute();
  let news = resp.content;

  const newsWithId = Object.entries(news).map(([id, n]) => ({ id, ...n }));
  const turningPointsOutcomes = newsWithId.filter(n => n.id.startsWith('turning_point_outcome_') || n.id.includes('_world_champion'));

  const events = [];

  if (turningPointsOutcomes.length > 0) {
    turningPointsOutcomes.forEach(tp => {
      const turningDate = tp.date;
      if ((tp.turning_point_type === "positive" || tp.id.includes('_world_champion')) && Number(turningDate) <= Number(date)) {
        if (tp.id.includes("investment")) {
          events.push({
            type: "investment",
            country: tp.data.country,
            amount: tp.data.investmentAmount,
            team: tp.data.teamName,
            share: tp.data.investmentShare
          });
        }
        else if (tp.id.includes("technical_directive")) {
          events.push({
            type: "technical_directive",
            component: tp.data.component,
            reason: tp.data.reason
          });
        }
        else if (tp.id.includes("dsq")) {
          events.push({
            type: "disqualification",
            country: tp.data.country,
            team: tp.data.team,
            component: tp.data.component
          });
        }
        else if (tp.id.includes("substitution")) {
          events.push({
            type: "race_substitution",
            original: tp.data.originalCountry,
            reason: tp.data.reason,
            substitute: tp.data.substituteCountry
          });
        }
        else if (tp.id.includes("transfer")) {
          events.push({
            type: "driver_transfer",
            driverOut: tp.data.driver_out?.name,
            team: tp.data.team,
            driverIn: tp.data.driver_in?.name
          });
        }
        else if (tp.id.includes("injury")) {
          events.push({
            type: "driver_injury",
            driver: tp.data.driver_affected?.name,
            condition: tp.data.condition?.condition,
            reason: tp.data.condition?.reason,
            racesMissed: tp.data.condition?.races_affected?.length || 1,
            replacement: tp.data.reserve_driver?.name
          });
        }
        else if (tp.id.includes("_world_champion")) {
          events.push({
            type: "world_champion_crowned",
            driver: tp.data.driver_name,
            team: combined_dict[tp.data.driver_team_id],
            season: tp.data.season_year,
            race: tp.data.adjective
          });
        }
      }
    });
  }
  return events;
}



function buildContextData(data, config = {}) {
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

  const contextData = {
    timing,
    seasonYear
  };

  if (driverStandings) {
    contextData.driverStandings = driverStandings.map((d, i) => ({
      position: i + 1,
      name: d.name,
      team: combined_dict[d.teamId],
      points: d.points,
      gapToLeader: d.gapToLeader || 0
    }));
  }

  if (teamStandings) {
    contextData.teamStandings = teamStandings.map((t, i) => ({
      position: i + 1,
      name: combined_dict[t.teamId] || `Team ${t.teamId}`,
      points: t.points
    }));
  }

  if (racesNames && racesNames.length > 0) {
    contextData.previousRaces = racesNames;
  }

  if (driversResults) {
    let resultsToProcess = driversResults;
    if (teamId) {
      resultsToProcess = driversResults.filter(d => d.teamId === teamId);
    }
    contextData.driverRaceResults = resultsToProcess.map(d => ({
      name: d.name,
      wins: d.nWins,
      podiums: d.nPodiums,
      pointsFinishes: d.nPointsFinishes,
      resultsHistory: d.resultsString
    }));
  }

  if (driverQualiResults) {
    let resultsToProcess = driverQualiResults;
    if (teamId) {
      resultsToProcess = driverQualiResults.filter(d => d.teamId === teamId);
    }
    contextData.driverQualiResults = resultsToProcess.map(d => ({
      name: d.name,
      wins: d.nWins,
      podiums: d.nPodiums,
      pointsFinishes: d.nPointsFinishes,
      resultsHistory: d.resultsString
    }));
  }

  if (champions) {
    contextData.championsHistory = Object.values(
      champions.reduce((acc, { season, pos, name, points }) => {
        if (!acc[season]) acc[season] = { season, drivers: [] };
        acc[season].drivers.push({ position: pos, name, points });
        return acc;
      }, {})
    ).sort((a, b) => b.season - a.season);
  }

  if (enrichedAllTime && enrichedAllTime.length > 0) {
    let list = enrichedAllTime;
    if (teamId && 'teamId' in (list[0] || {})) {
      list = list.filter(d => d.teamId === teamId);
    }
    contextData.driverCareerStats = list.map(d => ({
      name: d.name || `Driver ${d.id}`,
      championships: d.totalChampionshipWins ?? 0,
      wins: d.totalWins ?? 0,
      podiums: d.totalPodiums ?? 0,
      starts: d.totalStarts ?? 0,
      isRookie: Number(seasonYear) === Number(d.firstRace.season)
    }));
  }

  return contextData;
}

function buildContextualPrompt(data, config = {}) {
  const {
    driverStandings,
    teamStandings,
    driversResults,
    racesNames,
    champions,
    driverQualiResults,
    enrichedAllTime,
    driverRaceResults
  } = data;
  const { timing = '', teamId = null, teamName = '', seasonYear = '' } = config;

  let prompt = '';

  if (driverStandings) {
    const driversChamp = driverStandings
      .map((d, i) => `${i + 1}. ${d.name} (${combined_dict[d.teamId]}) — ${d.points} pts (${d.gapToLeader ? `+${d.gapToLeader} pts to leader` : ''})`)
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
    prompt += `\n\nThe races that have already taken place before this one in ${seasonYear} are: ${previousRaces}\n`;
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

  if (driverQualiResults) {
    let qualiResultsToProcess = driverQualiResults;
    if (teamId) {
      qualiResultsToProcess = driverQualiResults.filter(d => d.teamId === teamId);
    }

    const previousQualiResults = qualiResultsToProcess.map(d => {
      const details = [
        d.nWins > 0 ? `${d.nWins} poles` : '',
        d.nPodiums > 0 ? `${d.nPodiums} top 3s` : '',
        (d.nWins === 0 && d.nPodiums === 0 && d.nPointsFinishes > 0) ? `${d.nPointsFinishes} top 10s` : ''
      ].filter(Boolean).join(', ');

      return `${d.name}${details ? ` (${details})` : ''} ${d.resultsString}`;
    }).join("\n");

    if (teamId && teamName) {
      prompt += `\n\nHere are the previous qualifying results for ${teamName}'s drivers:\n${previousQualiResults}`;
    } else if (qualiResultsToProcess.length > 0) {
      prompt += `\n\nHere are the previous qualifying results for each driver:\n${previousQualiResults}`;
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
      const isRookie = Number(seasonYear) === Number(d.firstRace.season);

      const tLbl = titles === 1 ? 'drivers championship' : 'drivers championships';
      const wLbl = wins === 1 ? 'race win' : 'race wins';
      const pLbl = podiums === 1 ? 'podium' : 'podiums';
      const sLbl = 'race starts';

      return `${name} ${isRookie ? '(Rookie)' : ''}: ${titles} ${tLbl}, ${wins} ${wLbl}, ${podiums} ${pLbl}, ${starts} ${sLbl}`;
    }).join('\n');


    if (lines) {
      prompt += `\n\nHere are the stats for each driver in the grid. Drivers not marked with (Rookie) are not rookies anymore. Only mention them if relevant:\n${lines}`;
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
    massive_exit: contextualizeBigTransferConfirm,
    massive_signing: contextualizeBigTransferConfirm,
    contract_renewal: contextualizeRenewalNews,
    team_comparison: contextualizeTeamComparison,
    driver_comparison: contextualizeDriverComparison,
    season_review: contextualizeSeasonReview,
    race_reaction: contextualizeRaceReaction,
    next_season_grid: contextualizeNextSeasonGrid,

    // Turning points: outcome_ y no-outcome comparten handler
    turning_point_dsq: (nd) => contextualizeDSQ(nd, nd.turning_point_type),
    turning_point_transfer: (nd) => contextualizeTurningPointTransfer(nd, nd.turning_point_type),
    turning_point_technical_directive: (nd) => contextualizeTurningPointTechnicalDirective(nd, nd.turning_point_type),
    turning_point_investment: (nd) => contextualizeTurningPointInvestment(nd, nd.turning_point_type),
    turning_point_race_substitution: (nd) => contextualizeTurningPointRaceSubstitution(nd, nd.turning_point_type),
    turning_point_injury: (nd) => contextualizeTurningPointInjury(nd, nd.turning_point_type),
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
    if (barProgressDiv) barProgressDiv.style.width = '30%';
    let progress = 30;
    progressInterval = setInterval(() => {
      progress = Math.min(progress + 1, 98);
      if (barProgressDiv) barProgressDiv.style.width = progress + '%';
      if (progress >= 98) clearInterval(progressInterval);
    }, 450);

    // 5) Construir prompt SOLO si hace falta
    let messages = [];
    if (handler) {
      let { instruction, context } = await handler(newData);
      const normalDate = excelToDate(newData.date);
      const isoDate = new Date(
        normalDate.getFullYear(),
        normalDate.getMonth(),
        normalDate.getDate()
      ).toISOString().split("T")[0];

      // Add turning point events to context
      let date = newData.date;
      context = await addTurningPointContexts(context, date);

      // Add additional contextual info to the prompt template
      let finalInstruction = `The current date is ${isoDate}\n\n` +
        instruction +
        `\n\nAdd any quote you find apporpiate from the drivers or team principals if involved in the article. ` +
        `\n\nThe title of the article is: "${newData.title}"`;

      finalInstruction += `\n\nUse **Markdown** formatting in your response for better readability:\n- Use "#" or "##" for main and secondary titles.\n- Use **bold** for important names or key phrases.\n- ALWAYS use *italics* for quotes or emotional emphasis.\n- Use bullet points or numbered lists if needed.Do not include any raw HTML or code blocks.\nThe final output must be valid Markdown ready to render as HTML.\n`;

      // Message 1: Context Data
      messages.push({
        role: "user",
        content: `Here is context about  results, championship standings, driver stats and important events that happened throughout the season:\n\n${context}`
      });

      // Message 2: Instruction
      messages.push({
        role: "user",
        content: finalInstruction
      });
    }

    console.log("Final messages for AI:", messages);

    // 6) Llama a la IA y guarda
    const articleText = await askGenAI(messages);
    const cleanedArticleText = cleanArticleOutput(articleText);
    newData.text = cleanedArticleText;
    updateRateLimitsDisplay();

    new Command("updateNews", {
      stableKey: newData.id ?? computeStableKey(newData),
      patch: { text: cleanedArticleText }
    }).execute();

    if (barProgressDiv) barProgressDiv.style.width = '100%';
    return cleanedArticleText;

  } finally {
    if (progressInterval) clearInterval(progressInterval);
  }
}

function cleanArticleOutput(rawMd) {
  let md = rawMd || "";

  md = removeLeading(md);
  md = italicizeQuotes(md);

  return md.trim();
}

function removeLeading(md) {
  return md.replace(/^\s*#{1,3}\s.*\n+/, "").trimStart();
}

function italicizeQuotes(md) {
  return md.replace(/"([^"]+)"/g, (match, inner, offset, full) => {
    const before = full[offset - 1] || "";
    const after = full[offset + match.length] || "";
    if (before === "*" || after === "*") {
      return match;
    }
    return `*${match}*`;
  });
}

async function contextualizeTurningPointInjury(newData, turningPointType) {
  const promptTemplateEntry = turningPointsTemplates.find(t => t.new_type === 106);
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
  prompt = prompt
    .replace(/{{\s*driver\s*}}/g, newData.data.driver_affected?.name || 'the driver')
    .replace(/{{\s*team\s*}}/g, newData.data.team || 'the team')
    .replace(/{{\s*condition\s*}}/g, newData.data.condition?.condition || 'a physical issue')
    .replace(/{{\s*reason\s*}}/g, newData.data.condition?.reason || 'a private medical matter')
    .replace(/{{\s*races_affected_count\s*}}/g, (newData.data.condition?.races_affected?.length || 1))
    .replace(/{{\s*expectedReturnCountry\s*}}/g, newData.data.condition?.expectedReturnCountry || 'a later round');

  if (newData.data.reserve_driver) {
    prompt = prompt.replace(/{{\s*reserve_driver_part\s*}}/g, () => {
      const reserveName = newData.data.reserve_driver?.name || 'the reserve driver';
      const isFreeAgent = !!newData.data.reserve_driver?.isFreeAgent;

      const t = String(newData.data.turningPointType || newData.data.turning_point_type || '')
        .toLowerCase();
      const isPositive = t.includes('positive');
      const isNegative = t.includes('negative');

      // Destinos y contexto
      const inTeam = newData.data.team || 'the team';                 // equipo que sufre la baja (lo usabas arriba)
      const driverNameOut = newData.data.driver_affected?.name || 'the injured driver'; // piloto que se lesiona

      if (isFreeAgent) {
        if (isPositive) {
          return `${reserveName} will join ${inTeam} as a free agent to replace ${driverNameOut}.`;
        } else if (isNegative) {
          return `${reserveName} would have joined ${inTeam} as a free agent to replace ${driverNameOut}.`;
        } else {
          return `${reserveName} is being considered as a free-agent option to replace ${driverNameOut} at ${inTeam}.`;
        }
      } else {
        if (isPositive) {
          return `${reserveName} will be promoted from ${inTeam}'s reserve/academy to replace ${driverNameOut} at ${inTeam}.`;
        } else if (isNegative) {
          return `${reserveName} would have been promoted from ${inTeam}'s reserve/academy to replace ${driverNameOut} at ${inTeam}.`;
        } else {
          return `${reserveName} is being discussed as a promotion candidate from ${inTeam}'s reserve/academy to replace ${driverNameOut} at ${inTeam}.`;
        }
      }
    });
  }

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

  const contextData = buildContextualPrompt(resp.content, { seasonYear });

  return {
    instruction: prompt,
    context: contextData
  };
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

  const contextData = buildContextualPrompt(resp.content, { seasonYear });

  return {
    instruction: prompt,
    context: contextData
  };
}

async function contextualizeTurningPointInvestment(newData, turningPointType) {
  const promptTemplateEntry = turningPointsTemplates.find(t => t.new_type === 102);
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

  const contextData = buildContextualPrompt(resp.content, { seasonYear });

  return {
    instruction: prompt,
    context: contextData
  };
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
  const contextData = buildContextualPrompt(resp.content, { timing, teamId, teamName, seasonYear: currentSeason });

  return {
    instruction: prompt,
    context: contextData
  };

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

  const contextData = buildContextualPrompt(resp.content, { seasonYear });

  return {
    instruction: prompt,
    context: contextData
  };
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

  const contextData = buildContextualPrompt(resp.content, { seasonYear });

  return {
    instruction: prompt,
    context: contextData
  };
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

  let standingsResp = '';
  let contextData = "";

  try {
    standingsResp = await command.promiseExecute();
    if (standingsResp && standingsResp.content) {

      const raceNumber = standingsResp.content.racesNames.length + 1;

      const numberOfRace = `The title was sealed after race ${raceNumber} out of ${standingsResp.content.nRaces} in this season.`;

      prompt += `\n\n${numberOfRace}`;

      contextData = buildContextualPrompt(standingsResp.content, { timing: "after this race", seasonYear: newData.data.season_year });
    } else {
      prompt += "\n\nCould not retrieve current championship standings.";
    }
  } catch (err) {
    console.error("Error fetching standings for potential champion news:", err);
    prompt += "\n\nError fetching championship standings.";
  }

  return {
    instruction: prompt,
    context: contextData
  };
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
  let contextData = "";

  try {
    standingsResp = await command.promiseExecute();
    if (standingsResp && standingsResp.content) {
      const c = standingsResp.content;
      const raceNumber = c.racesNames.length + 1;

      // Arregla el doble "sealed sealed"
      const numberOfRace = `The title could be sealed after race ${raceNumber} out of ${c.nRaces} this season.`;
      prompt += `\n\n${numberOfRace}`;

      // Contexto antes de esta carrera
      contextData = buildContextualPrompt(c, { timing: "before this race", seasonYear: newData.data.season_year });

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

  return {
    instruction: prompt,
    context: contextData
  };
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

  const contextData = buildContextualPrompt(resp.content, { seasonYear: season });

  return {
    instruction: prompt,
    context: contextData
  };
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

  const contextData = buildContextualPrompt(resp.content, { timing: "after the last race", seasonYear: resp.content.season });

  return {
    instruction: prompt,
    context: contextData
  };
}

async function contextualizeNextSeasonGrid(newData) {
  let season = newData.data.season_year;
  const date = newData.date || null;

  let prompt = newsPromptsTemaplates.find(t => t.new_type === 19).prompt;
  prompt = prompt.replace(/{{\s*season_year\s*}}/g, season);
  const command = new Command("fullChampionshipDetailsRequest", {
    season: season,
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

  function buildTeamLineupSection(title, teams, driversKey) {
    return [
      `\n\n${title}\n`,
      ...Object.values(teams).map(team =>
        [
          `\n**${team.name}**:\n`,
          team[driversKey].map(d => `- ${d.name}`).join('\n'),
        ].join('')
      )
    ].join('');
  }

  prompt += buildTeamLineupSection(
    `Here is the confirmed team lineup for each team for the next season (${season}):`,
    newData.data.teams,
    'driversNextSeason'
  );

  prompt += buildTeamLineupSection(
    `Here are the driver line ups for each team in the season that just ended (${season - 1}):`,
    newData.data.teams,
    'driversThisSeason'
  );

  const contextData = buildContextualPrompt(resp.content, { seasonYear: season - 1 });

  return {
    instruction: prompt,
    context: contextData
  };
}

async function contextualizeBigTransferConfirm(newData) {
  let driverName = newData.data.driver1
  let potentialTeam = newData.data.team1
  let originalTeam = newData.data.team2
  const date = newData.date || null;

  let newType = 6;
  if (newData.type.includes("massive_exit")) {
    newType = 18;
  }

  let prompt = newsPromptsTemaplates.find(t => t.new_type === newType).prompt;
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

  const confirmedTransfer = resp.content.driverMap.map(d => ({
    driver: d.name,
    leavingTeam: d.actualTeam,
    joiningTeam: d.potentialTeam,
    salary: d.potentialSalary,
    currentTeamRecentHistory: d.actualTeamPreviousResults.map(t => ({
      season: t.season,
      position: t.position,
      points: t.points
    })),
    driverHistory: d.previouslyDrivenTeams.map(t => ({
      season: t.season,
      team: t.teamName
    }))
  }));

  const contextData = buildContextualPrompt(resp.content, { timing: "after this race", seasonYear: resp.content.season });

  return {
    instruction: prompt,
    context: contextData
  };
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

  const contextData = buildContextualPrompt(resp.content, { timing: "after this race", seasonYear: resp.content.season });

  return {
    instruction: prompt,
    context: contextData
  };
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
    racesNames: resp.content.currentRacesNames,
    enrichedAllTime: resp.content.enrichedAllTime
  };

  const contextData = buildContextualPrompt(currentContextData, { teamId: newData.data.team.teamId, teamName: team1, seasonYear });

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


  return {
    instruction: prompt,
    context: contextData
  };
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

  const numberOfRace = `This was qualifying ${raceNumber} out of ${resp.content.nRaces} in this season.`;

  prompt += `\n\n${numberOfRace}`;

  const qualiResults = resp.content.details.map(row => ({
    position: row.pos,
    name: row.name,
    team: combined_dict[row.teamId],
    gapToPole: row.gapToPole.toFixed(3)
  }));

  const contextData = buildContextualPrompt(resp.content, { timing: "before this race", seasonYear });

  return {
    instruction: prompt,
    context: contextData
  };
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
  const numberOfRace = `This was race ${raceNumber} out of ${resp.content.nRaces} in this season.`;
  prompt += `\n\n${numberOfRace}`;

  const safetyCars = resp.content.details[0].safetyCar;
  const virtualSafetyCars = resp.content.details[0].virtualSafetyCar;
  const safetyCarPhrase = `\n\nThere were ${safetyCars} safety car${safetyCars > 1 ? "s" : ""} and ${virtualSafetyCars} virtual safety car${virtualSafetyCars > 1 ? "s" : ""} during the race.`
  prompt += safetyCarPhrase;

  const top3 = resp.content.driverOfTheDayInfo;
  if (Array.isArray(top3) && top3.length > 0) {
    const first = top3[0];
    const second = top3[1];
    const third = top3[2];
    const driverOfTheDayPhrase = `
      \n\nThe Driver of the Day award went to ${first.name} (${combined_dict[first.teamId]}) with ${first.share.toFixed(1)}% of the fan votes.\n${second ? `In second place was ${second.name} (${combined_dict[second.teamId]}) with ${second.share.toFixed(1)}%,` : ''}\n${third ? ` followed by ${third.name} (${combined_dict[third.teamId]}) with ${third.share.toFixed(1)}%.` : ''}\n\nWrite a paragraph analyzing why ${first.name.split(' ')[0]} might have received the award, and why the fans also voted for ${second ? second.name.split(' ')[0] : ''}${second && third ? ' and ' : ''}${third ? third.name.split(' ')[0] : ''}.
    `;
    prompt += driverOfTheDayPhrase;
  }

  if (resp.content.sprintDetails.length > 0) {
    prompt += `\n\nThere was a sprint race held on Saturday, which was won by ${resp.content.sprintDetails[0].name} (${combined_dict[resp.content.sprintDetails[0].teamId]}). Dedicate a paragraph discussing the sprint results`;
  }

  const contextData = buildContextualPrompt(resp.content, { timing: "after this race", seasonYear });

  return {
    instruction: prompt,
    context: contextData
  };
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

  const contextData = buildContextualPrompt(resp.content, { teamId, teamName: combined_dict[teamId], seasonYear });

  return {
    instruction: prompt,
    context: contextData
  };
}

async function contextualizeRaceReaction(newData) {
  let adjective = newData.data.adjective;
  let seasonYear = newData.data.seasonYear;
  let happyDriver = newData.data.randomHappyDriver.name;
  let unhappyDriver = newData.data.randomUnHappyDriver.name;
  let circuit = newData.data.circuit;

  let prompt = newsPromptsTemaplates.find(t => t.new_type === 16).prompt;
  prompt = prompt.replace(/{{\s*adjective\s*}}/g, adjective)
    .replace(/{{\s*season_year\s*}}/g, seasonYear)
    .replace(/{{\s*happy_driver\s*}}/g, happyDriver)
    .replace(/{{\s*unhappy_driver\s*}}/g, unhappyDriver)
    .replace(/{{\s*circuit\s*}}/g, circuit);

  const command = new Command("raceDetailsRequest", {
    raceid: newData.data.raceId,
  });
  let resp;

  try {
    resp = await command.promiseExecute();
  }
  catch (err) {
    console.error("Error fetching full championship details:", err);
    return;
  }

  const raceResults = resp.content.details.map(row => {
    const gapStr =
      row.gapToWinner > 0
        ? `${Number(row.gapToWinner.toFixed(3))} seconds`
        : row.gapLaps > 0
          ? `${row.gapLaps} laps`
          : `0 seconds`;
    return {
      position: row.pos,
      name: row.name,
      team: combined_dict[row.teamId],
      startPos: row.grid,
      gap: gapStr,
      status: row.dnf !== 1 ? `+${row.points} pts` : 'DNF'
    };
  });

  prompt += `\n\nHere are the race results:\n`;
  raceResults.forEach(r => {
    prompt += `${r.position}. ${r.name} (${r.team}) - Started: P${r.startPos}, Gap: ${r.gap}, Status: ${r.status}\n`;
  });

  const top3 = resp.content.driverOfTheDayInfo;

  if (Array.isArray(top3) && top3.length > 0) {
    const first = top3[0];
    const second = top3[1];
    const third = top3[2];

    const driverOfTheDayPhrase = `
      \n\nThe Driver of the Day award went to ${first.name} (${combined_dict[first.teamId]}) with ${first.share.toFixed(1)}% of the fan votes.\n${second ? `In second place was ${second.name} (${combined_dict[second.teamId]}) with ${second.share.toFixed(1)}%,` : ''}\n${third ? ` followed by ${third.name} (${combined_dict[third.teamId]}) with ${third.share.toFixed(1)}%.` : ''}\n\nWrite a paragraph analyzing why ${first.name.split(' ')[0]} might have received the award, and why the fans also voted for ${second ? second.name.split(' ')[0] : ''}${second && third ? ' and ' : ''}${third ? third.name.split(' ')[0] : ''}.
    `;

    prompt += driverOfTheDayPhrase;
  }

  const contextData = buildContextualPrompt(resp.content, { seasonYear });

  return {
    instruction: prompt,
    context: contextData
  };
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

  const contextData = buildContextualPrompt(resp.content, { seasonYear });

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

  return {
    instruction: prompt,
    context: contextData
  };
}


async function askGenAI(messages, opts = {}) {
  const aiModel = opts.model || "gpt-5-mini";

  const response = await fetch("/api/ask-openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model: aiModel,
      max_tokens: opts.max_tokens || 5000
    })
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    // ignore JSON parse errors
  }

  if (!response.ok) {
    const error = new Error(data.error || "AI request failed");
    error.status = response.status;
    throw error;
  }

  return data.text;
}

newsOptionsBtn.addEventListener("click", (e) => {
  e.target.classList.toggle("active");
});

copyArticleBtn.addEventListener("click", async () => {
  const titleEl = document.querySelector("#newsModalTitle");
  const articleEl = document.querySelector("#newsModal .news-article");

  if (!titleEl || !articleEl) return;

  const title = titleEl.innerText.trim();

  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  const articleMarkdown = turndownService.turndown(articleEl.innerHTML);

  const finalText = `# ${title}\n\n${articleMarkdown}`;

  await navigator.clipboard.writeText(finalText);
});

function createEditFooterButtons(articleEl) {
  const buttonsWrapper = closeBtn?.parentElement;
  if (!buttonsWrapper) return;

  closeBtn.classList.add('d-none');

  saveArticleBtn = document.createElement('button');
  saveArticleBtn.type = 'button';
  saveArticleBtn.classList.add('confirm-modal');
  saveArticleBtn.textContent = 'Save';

  cancelArticleBtn = document.createElement('button');
  cancelArticleBtn.type = 'button';
  cancelArticleBtn.classList.add('close-modal');
  cancelArticleBtn.textContent = 'Cancel';

  buttonsWrapper.appendChild(saveArticleBtn);
  buttonsWrapper.appendChild(cancelArticleBtn);

  cancelArticleBtn.addEventListener('click', () => exitArticleEditMode());

  saveArticleBtn.addEventListener('click', async () => {
    if (!editTextarea) return;

    const markdownText = editTextarea.value.trim();
    const parsedHtml = marked.parse(markdownText);
    const safeHtml = DOMPurify.sanitize(parsedHtml);

    articleEl.innerHTML = safeHtml;

    if (currentModalNews) {
      currentModalNews.text = markdownText;

      new Command("updateNews", {
        stableKey: currentModalNews.id ?? computeStableKey(currentModalNews),
        patch: { text: markdownText }
      }).execute();
    }

    exitArticleEditMode({ restoreOriginal: false });
    originalArticleHTML = articleEl.innerHTML;
  });
}

function startArticleEditMode() {
  if (isEditingArticle) return;

  const articleEl = document.querySelector("#newsModal .news-article");
  if (!articleEl || !currentModalNews) return;

  newsOptionsBtn?.classList.remove('active');

  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  const markdownText = turndownService.turndown(
    articleEl.innerHTML || currentModalNews.text || ''
  );

  originalArticleHTML = articleEl.innerHTML;
  articleEl.innerHTML = '';

  editTextarea = document.createElement('textarea');
  editTextarea.classList.add('news-edit-textarea');
  editTextarea.value = markdownText;

  articleEl.appendChild(editTextarea);

  isEditingArticle = true;

  createEditFooterButtons(articleEl);
}

editArticleBtn?.addEventListener("click", startArticleEditMode);


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

document.querySelectorAll('#newsTypeMenu .redesigned-dropdown-item').forEach(item => {
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

document.querySelector("#reloadNews").addEventListener("click", async () => {
  const newsGrid = document.querySelector(".news-grid");
  newsGrid.innerHTML = '';

  const command = new Command("deleteNews");
  command.execute();

  generateNews();
});

export function updateNewsYearsButton(message){
  let years = message.yearsAvailable;
  const newsYearsMenu = document.getElementById("newsSeasonMenu");
  const newsYearsButton = document.getElementById("newsSeasonButton");
  newsYearsMenu.innerHTML = '';

  years.forEach((year) => {
    const item = document.createElement("a");
    item.classList.add("redesigned-dropdown-item");
    item.href = "#";
    item.dataset.value = year;
    item.innerText = year;
    item.addEventListener("click", function (e) {
      console.log("Selected news year:", year);
      newsYearsButton.querySelector("span").innerText = year;
      const command = new Command("getNewsFromSeason", { season: year });
      command.execute();
    });
    newsYearsMenu.appendChild(item);
  });
  //set the text in the button to the current year
  const lastYear = Math.max(...years);
  newsYearsButton.querySelector("span").innerText = lastYear;

}

async function addTurningPointContexts(prompt, date) {
  const command = new Command("getNews", {});
  let resp = await command.promiseExecute();
  let news = resp.content;

  const newsWithId = Object.entries(news).map(([id, n]) => ({ id, ...n }));
  const turningPointsOutcomes = newsWithId.filter(n => n.id.startsWith('turning_point_outcome_') || n.id.includes('_world_champion'));

  if (turningPointsOutcomes.length > 0) {
    let number = 1;
    let turningOutcomesText = ``;
    turningOutcomesText += turningPointsOutcomes.map(tp => {
      const turningDate = tp.date;
      if ((tp.turning_point_type === "positive" || tp.id.includes('_world_champion')) && Number(turningDate) <= Number(date)) {
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
        else if (tp.id.includes("injury")) {
          return `${number++}. ${tp.data.driver_affected?.name} suffered ${tp.data.condition?.condition} due to "${tp.data.condition?.reason}", causing him to miss ${tp.data.condition?.races_affected?.length || 1} race(s). ${tp.data.reserve_driver ? `He was replaced by ${tp.data.reserve_driver?.name}.` : ''}`;
        }
        else if (tp.id.includes("_world_champion")) {
          return `${number++}. ${tp.data.driver_name} (${combined_dict[tp.data.driver_team_id]}) won the ${tp.data.season_year} world championship at the ${tp.data.adjective} GP `;
        }
      }
    }).join("\n");
    if (turningOutcomesText) {
      prompt += `\n\nHere are some other events that happened through the season. Talk about them if relevant to the article:\n${turningOutcomesText}`;
    }
  }
  return prompt;
}