import { team_dict, combined_dict } from "./config";
import { GoogleGenAI } from "@google/genai";

const newsGrid = document.querySelector('.news-grid');
const ai = new GoogleGenAI({ apiKey: "API_KEY" });

export function place_news(newsList) {
    console.log(newsList)
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

        manage_overlay(imageContainer, news.overlay);

        const image = document.createElement('img');
        image.classList.add('news-image');
        image.src = news.image;

        const readbuttonContainer = document.createElement('div');
        readbuttonContainer.classList.add('read-button-container');

        const readButton = document.createElement('div');
        readButton.classList.add('read-button');
        readButton.innerText = "Read";

        readButton.addEventListener('click', async () => {
            // A) Expandir al instante y obtener clon
            const clone = animateToCenter(newsItem);
          
            // B) Preparar el contenedor del artículo inmediatamente
            const bodyEl  = clone.querySelector('.news-body');
            const titleEl = bodyEl.querySelector('.news-title');
            const articleEl = document.createElement('div');
            articleEl.classList.add('news-article');
            // imprescindible para que los "\n" se respeten como saltos de línea
            articleEl.style.whiteSpace = 'pre-wrap';
            titleEl.insertAdjacentElement('afterend', articleEl);
          
            // C) Ahora sí, pedir a Gemini y esperar el texto
            const prompt = 
              "Write ONLY the body of a news article in English summarizing the win " +
              "that Andrea Kimi Antonelli got at the Bahrain Grand Prix in 2028. " +
              "Ocon, Antonelli's teammate in Andretti, finished second 6 seconds behind, " +
              "and Verstappen finished 3rd in his Mercedes almost half a minute behind Ocon. " +
              "Use a formal tone, no personal opinions, 400–500 words.";
            const articleText = await askGenAI(prompt);
          
            // D) Inyectar con “máquina de escribir”
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

function animateToCenter(newsItem) {
    const rect = newsItem.getBoundingClientRect();
    const clone = newsItem.cloneNode(true);
  
    Object.assign(clone.style, {
      position:   'fixed',
      top:        rect.top    + 'px',
      left:       rect.left   + 'px',
      width:      rect.width  + 'px',
      height:     rect.height + 'px',
      margin:     '0',
      zIndex:     '1000',
      transition: 'all .4s ease',
    });
  
    document.body.appendChild(clone);
    newsItem.style.visibility = 'hidden';
  
    // animar al centro
    requestAnimationFrame(() => {
      const vw          = window.innerWidth;
      const vh          = window.innerHeight;
      const targetWidth = vw * 0.8;
      const aspectRatio = rect.height / rect.width;
      const targetHeight= targetWidth * aspectRatio;
      const targetTop   = (vh - targetHeight) / 2;
      const targetLeft  = (vw - targetWidth ) / 2;
  
      clone.style.top        = targetTop   + 'px';
      clone.style.left       = targetLeft  + 'px';
      clone.style.width      = targetWidth + 'px';
      clone.style.height     = targetHeight+ 'px';
      clone.style.boxShadow  = '0 15px 40px rgba(0,0,0,0.3)';
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
      clone.style.top       = rect.top    + 'px';
      clone.style.left      = rect.left   + 'px';
      clone.style.width     = rect.width  + 'px';
      clone.style.height    = rect.height + 'px';
      clone.style.boxShadow = 'none';
  
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
        contents: "Write ONLY the body of a news article speaking about the win that Andrea Kimi Antonelli got at the Bahrain Grand Prix in 2028. \
         Ocon, Antonelli's teammate in Andretti finished second 6 seconds behind, and Verstappen finished 3rd in his Mercedes almost half a minute behind Ocon. \
         The article should be in a formal tone and should not include any personal opinions. The article should be between 200 and 300 words long.",
      });
      console.log(response.text);

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


function manage_overlay(imageContainer, overlay) {
    if (overlay === null) return;
    if (overlay.type === "race-overlay") {
        const overlayDiv = document.createElement('div');
        overlayDiv.classList.add('race-overlay');
        const first = document.createElement('div');
        const firstTeam = document.createElement('div');
        firstTeam.classList.add('position-team', 'firstpos');
        firstTeam.innerText = combined_dict[overlay.firstTeam];
        let borderClass = team_dict[overlay.firstTeam] + "border-top";
        first.classList.add('position', 'firstpos', borderClass);
        first.innerText = `1. ${overlay.first}`;
        const second = document.createElement('div');
        const secondTeam = document.createElement('div');
        secondTeam.classList.add('position-team');
        secondTeam.innerText = combined_dict[overlay.secondTeam];
        borderClass = team_dict[overlay.secondTeam] + "border-top";
        second.classList.add('position', borderClass);
        second.innerText = `2. ${overlay.second}`;
        const third = document.createElement('div');
        const thirdTeam = document.createElement('div');
        thirdTeam.classList.add('position-team');
        thirdTeam.innerText = combined_dict[overlay.thirdTeam];
        borderClass = team_dict[overlay.thirdTeam] + "border-top";
        third.classList.add('position', borderClass);
        third.innerText = `3. ${overlay.third}`;

        overlayDiv.appendChild(first);
        overlayDiv.appendChild(firstTeam);
        overlayDiv.appendChild(second);
        overlayDiv.appendChild(secondTeam);
        overlayDiv.appendChild(third);
        overlayDiv.appendChild(thirdTeam);
        imageContainer.appendChild(overlayDiv);
    }
}