import { races_map, races_names, names_full, codes_dict, weather_dict, countries_dict, invertedRacesMap, standalone_codes_dict, external_codes_dict } from "./config";
import { game_version } from "./renderer";
import { max_races } from "./head2head";
import { Command } from "../backend/command";
import interact from 'interactjs';
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

let deleting = false;
let deleted = false;
let previewTarget = null;
let previewPosition = null;
const importPreviousSeasonCalendarIcon = document.getElementById("importPreviousSeasonCalendarIcon");

function hideTrackTooltips() {
    document.querySelectorAll('#addTrackMenu .calendar-track-info').forEach(button => {
        bootstrap.Tooltip.getInstance(button)?.hide()
    })
}

document.getElementById('addRaceButton').addEventListener('hide.bs.dropdown', hideTrackTooltips);
document.getElementById('addTrackMenu').addEventListener('scroll', hideTrackTooltips);

/**
 * Positions both the div the user's moving and the one he has moved it into
 * @param {div} div0 The div the user is moving
 * @param {div} div1 The div the user has moved div0 into
 * @param {string} beforeAfter If the user has moved div0 before or after div1
 */
function reubicate(div0,div1,beforeAfter) {
    const parentDiv = document.querySelector('.main-calendar-section');
    parentDiv.removeChild(div0)

    if (beforeAfter === 'before') {
        parentDiv.insertBefore(div0,div1);

    } else if (beforeAfter === 'after') {
        parentDiv.insertBefore(div0,div1.nextSibling);

    }

}

/**
 * Adds a race in the calendar div
 * @param {Object} race
 */
function addRace(race) {
    const {
        code,
        rainP,
        rainQ,
        rainR,
        type,
        trackId,
        state,
        isF2Race = 0,
        isF3Race = 0,
    } = race;

    let imageUrl = codes_dict[code];

    let div = document.createElement('div');
    let leftDiv = document.createElement('div');
    let numberDiv = document.createElement('div');
    numberDiv.className = "race-calendar-number bold-font"
    leftDiv.className = "left-race"
    let rightDiv = document.createElement('div');
    rightDiv.className = "right-race"
    div.classList.add('race-calendar');
    div.dataset.trackid = trackId
    div.dataset.rainQ = rainQ
    div.dataset.rainR = rainR
    div.dataset.rainP = rainP
    div.dataset.type = type
    div.dataset.state = state
    div.dataset.isf2 = isF2Race
    div.dataset.isf3 = isF3Race
    if(state === 2){
        div.classList.add("completed");
    }

    const seriesBadges = document.createElement('div');
    seriesBadges.className = "race-series-badges";
    const f2Badge = document.createElement('button');
    f2Badge.className = "race-series-badge race-series-badge-f2 bold-font";
    f2Badge.type = "button";
    f2Badge.textContent = "F2";
    seriesBadges.appendChild(f2Badge);
    const f3Badge = document.createElement('button');
    f3Badge.className = "race-series-badge race-series-badge-f3 bold-font";
    f3Badge.type = "button";
    f3Badge.textContent = "F3";
    seriesBadges.appendChild(f3Badge);

    if (Number(isF2Race) === 1) {
        f2Badge.classList.add("active-badge");
    }

    if (Number(isF3Race) === 1) {
        f3Badge.classList.add("active-badge");
    }

    f2Badge.addEventListener("click", function () {
        if (div.dataset.isf2 === "1") {
            div.dataset.isf2 = "0";
            f2Badge.classList.remove("active-badge");
        } else {
            div.dataset.isf2 = "1";
            f2Badge.classList.add("active-badge");
        }
    });
    
    f3Badge.addEventListener("click", function () {
        if (div.dataset.isf3 === "1") {
            div.dataset.isf3 = "0";
            f3Badge.classList.remove("active-badge");
        } else {
            div.dataset.isf3 = "1";
            f3Badge.classList.add("active-badge");
        }
    });

    if (seriesBadges.childElementCount > 0) {
        div.appendChild(seriesBadges);
    }

    let upperDiv = document.createElement('div');
    upperDiv.className = "upper-text-and-flag"
    let textDiv = document.createElement('div');
    textDiv.classList.add('upper-race','bold-font');
    const trackName = names_full[races_names[trackId]] || `Track ${trackId}`;
    textDiv.textContent = code.startsWith('mod') ? trackName.slice(0, 3).toUpperCase() : code.slice(0,-1).toUpperCase();
    upperDiv.title = trackName;
    upperDiv.setAttribute('aria-label', trackName);

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    img.classList.add('flag');
    img.setAttribute("loading","lazy");

    upperDiv.appendChild(textDiv);
    upperDiv.appendChild(img);
    let ATAInput;
    let lowerDiv = document.createElement('div');
    lowerDiv.classList.add('lower-race');
    lowerDiv.innerHTML = "<div class='form-check form-switch'><input class='form-check-input custom-toggle sprint-input' type='checkbox' role='switch'><label class='form-check-label'>Sprint</label></div>";
    if (game_version === 2023){
        lowerDiv.innerHTML += "<div class='form-check form-switch'><input class='form-check-input custom-toggle ata-input' type='checkbox' role='switch'><label class='form-check-label' for='flexSwitchCheckDefault'>ATA Quali</label></div>";
        ATAInput = lowerDiv.querySelector(".ata-input")
    }
    let SprintInput = lowerDiv.querySelector(".sprint-input")
    
    SprintInput.addEventListener("click",function (event) {
        if (game_version === 2023){
            if (ATAInput.checked) ATAInput.checked = false
        }
        if (SprintInput.checked) div.dataset.type = 1
        else div.dataset.type = 0
    })
    if (game_version === 2023){
        ATAInput.addEventListener("click",function (event) {
            if (SprintInput.checked) SprintInput.checked = false
            if (ATAInput.checked) div.dataset.type = 2
            else div.dataset.type = 0
        })
    }

    leftDiv.appendChild(upperDiv);
    leftDiv.appendChild(lowerDiv);
    if(type === 1){
        lowerDiv.children[0].firstChild.click()
    }
    else if(type === 2){
        lowerDiv.children[1].firstChild.click()
    }
    numberDiv.addEventListener("click", function () {
        if (!deleting) return;
        const raceDiv = numberDiv.closest(".race-calendar");
        if (!raceDiv) return;
        raceDiv.parentNode.removeChild(raceDiv);
        deleted = true;
        if (raceDiv.dataset.trackid === "6"){
            update_notifications("Why'd you do that?", "monaco");
        }
        update_numbers();
    });
    div.appendChild(numberDiv)
    div.appendChild(leftDiv)
    let qWeather = document.createElement('div');
    qWeather.className = "full-quali-weather"
    let qName = document.createElement('div');
    qName.className = "session-name bold-font"
    qName.innerText ="Sat"
    let wSelector = document.createElement('div');
    wSelector.className = "weather-selector"
    let leftArrow = document.createElement('i');
    leftArrow.classList.add("bi", "bi-chevron-left", "new-augment-button", "transparent")
    let rightArrow = document.createElement('i');
    rightArrow.classList.add("bi", "bi-chevron-right", "new-augment-button", "transparent")
    let wVis = document.createElement('div');
    wVis.className = "weather-vis"
    wVis.dataset.value = Number(rainQ)

    wSelector.appendChild(leftArrow)
    wSelector.appendChild(wVis)
    wSelector.appendChild(rightArrow)
    qWeather.appendChild(qName)
    qWeather.appendChild(wSelector)
    let rWeather = qWeather.cloneNode(true)
    rWeather.firstChild.innerText = "Sun"
    rWeather.children[1].children[1].dataset.value = Number(rainR)
    let pWeather = qWeather.cloneNode(true)
    pWeather.firstChild.innerText = "Fri"
    pWeather.children[1].children[1].dataset.value = Number(rainP)
    rightDiv.appendChild(pWeather)
    rightDiv.appendChild(qWeather)
    rightDiv.appendChild(rWeather)
    div.appendChild(rightDiv)
    div.querySelectorAll(".bi-chevron-left").forEach(function(elem){
        elem.addEventListener("click", function(){
            let val = elem.parentNode.querySelector(".weather-vis").dataset.value
            let newVal = Number(val) - 1
            if(newVal === -1){
                newVal = 5
            }
            elem.parentNode.querySelector(".weather-vis").dataset.value = newVal
            if (elem.parentNode.parentNode.firstChild.innerText === "Sat"){
                elem.parentNode.parentNode.parentNode.parentNode.dataset.rainQ = newVal
            }
            else if (elem.parentNode.parentNode.firstChild.innerText === "Sun"){
                elem.parentNode.parentNode.parentNode.parentNode.dataset.rainR = newVal
            }
            else if (elem.parentNode.parentNode.firstChild.innerText === "Fri"){
                elem.parentNode.parentNode.parentNode.parentNode.dataset.rainP = newVal
            }
            
            updateVisualizers()
            
        })
    })
    
    div.querySelectorAll(".bi-chevron-right").forEach(function(elem){
        elem.addEventListener("click", function(){
            let val = elem.parentNode.querySelector(".weather-vis").dataset.value
            let newVal = Number(val) + 1
            if(newVal === 6){
                newVal = 0
            }
            elem.parentNode.querySelector(".weather-vis").dataset.value = newVal
            if (elem.parentNode.parentNode.firstChild.innerText === "Sat"){
                elem.parentNode.parentNode.parentNode.parentNode.dataset.rainQ = newVal
            }
            else if (elem.parentNode.parentNode.firstChild.innerText === "Sun"){
                elem.parentNode.parentNode.parentNode.parentNode.dataset.rainR = newVal
            }
            else if (elem.parentNode.parentNode.firstChild.innerText === "Fri"){
                elem.parentNode.parentNode.parentNode.parentNode.dataset.rainP = newVal
            }
            updateVisualizers()
            
        })
    })


    document.querySelector('.main-calendar-section').appendChild(div)
}


function updateVisualizers(){
    document.querySelector(".main-calendar").querySelectorAll(".weather-vis").forEach(function(elem){
        elem.innerHTML = ""
        let val = elem.dataset.value
        let icon = document.createElement("i")
        icon.className = weather_dict[val]
        elem.appendChild(icon)
    })
}

export function load_calendar(races){
    clearDropPreview()
    document.querySelector('.main-calendar-section').innerHTML = ""
    races.forEach(function(elem){
        addRace({
            code: races_map[elem.trackId],
            rainP: transformWeather(elem.weatherStatePractice),
            rainQ: transformWeather(elem.weatherStateQualifying),
            rainR: transformWeather(elem.weatherStateRace),
            type: elem.weekendType,
            trackId: elem.trackId,
            state: elem.state,
            isF2Race: elem.isF2Race,
            isF3Race: elem.isF3Race
        })
    })
    updateVisualizers()
    update_numbers()
    load_addRaces()

}

function update_numbers(){
    document.querySelectorAll(".race-calendar").forEach(function(elem, index){
        updateNumberDisplay(elem, index);
    })
}

function updateNumberDisplay(race, index) {
    const numberDiv = race.querySelector(".race-calendar-number");
    if (!numberDiv) return;
    numberDiv.innerHTML = "";
    numberDiv.classList.remove("race-calendar-number-completed", "race-calendar-number-delete");
    if (race.classList.contains("completed")) {
        const icon = document.createElement("i");
        icon.className = "bi bi-check-lg";
        numberDiv.classList.add("race-calendar-number-completed");
        numberDiv.appendChild(icon);
        return;
    }
    if (deleting) {
        const icon = document.createElement("i");
        icon.className = "bi bi-trash-fill";
        numberDiv.classList.add("race-calendar-number-delete");
        numberDiv.appendChild(icon);
        return;
    }
    numberDiv.textContent = index + 1;
}

function clearDropPreview() {
    if (previewTarget) {
        previewTarget.classList.remove("drop-before", "drop-after");
    }
    previewTarget = null;
    previewPosition = null;
}

function getImportedPreviousSeasonCalendar(races) {
    return races.map(function (race) {
        return {
            trackId: race.trackId,
            weatherStatePractice: 1,
            weatherStateQualifying: 1,
            weatherStateRace: 1,
            weekendType: race.weekendType,
            state: 0,
            isF2Race: race.isF2Race,
            isF3Race: race.isF3Race
        }
    })
}

async function importPreviousSeasonCalendar() {
    const response = await new Command("previousSeasonCalendarRequest", {}).promiseExecute()
    const races = response.content
    if (races.length === 0) return
    load_calendar(getImportedPreviousSeasonCalendar(races))
}

function removeCalendarSprints() {
    document.querySelectorAll(".race-calendar .sprint-input:checked").forEach(function (input) {
        input.click()
    })
}

export function updatePreviousSeasonCalendarIcon(currentYear) {
    if (!importPreviousSeasonCalendarIcon || !currentYear) return
    const previousYear = String(Number(currentYear) - 1).padStart(4, "0")
    importPreviousSeasonCalendarIcon.querySelectorAll("span").forEach(function (digit, index) {
        digit.textContent = previousYear[index]
    })
}


function transformWeather(state){
    let realWeather;
    if(state === 1){
        realWeather = 0
    }
    else if(state === 2){
        realWeather = 1
    }
    else if(state === 4){
        realWeather = 2
    }
    else if(state === 8){
        realWeather = 3
    }
    else if(state === 16){
        realWeather = 4
    }
    else if(state === 32){
        realWeather = 5
    }
    return realWeather;
}

/**
 * Changes the number after the race code to specify the format
 * @param {div} div div from the race that's changing format
 * @param {string} format code of the format
 */
function changeFormat(div,format) {
    let lastChar = div.dataset.code.charAt(div.dataset.code.length - 1)
    if (/\d/.test(lastChar)) {
        div.dataset.code = div.dataset.code.slice(0,-1) + format
    }
    else {
        div.dataset.code = div.dataset.code + format
    }

}

/**
 * Adds all the races to the addRace menu
 */
function load_addRaces() {
    const menu = document.getElementById("addTrackMenu")
    menu.querySelectorAll('.calendar-track-info').forEach(button => {
        bootstrap.Tooltip.getInstance(button)?.dispose()
    })
    menu.innerHTML = ""
    const addMenuItem = (dataCode, imageUrl, showId = false) => {
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.classList.add('redesigned-dropdown-item');
        a.classList.add('menu-race');
        a.href = '#';
        const name = document.createElement('span');
        name.className = 'calendar-track-name';
        name.textContent = countries_dict[dataCode];
        if (showId) {
            const id = document.createElement('span');
            id.className = 'calendar-track-id';
            id.textContent = `id: ${invertedRacesMap[dataCode]}`;
            name.appendChild(id);
        }
        a.appendChild(name);
        a.dataset.code = dataCode
        a.dataset.trackid = invertedRacesMap[dataCode]
        let img = document.createElement('img');
        img.src = imageUrl;
        img.alt = '';
        img.classList.add('menuFlag');
        img.setAttribute("loading","lazy");

        a.appendChild(img)

        li.appendChild(a);
        menu.appendChild(li);
    }
    for (let dataCode of Object.keys(codes_dict)) {
        if (standalone_codes_dict[dataCode] || external_codes_dict[dataCode]) continue
        addMenuItem(dataCode, codes_dict[dataCode])
    }
    for (const [label, tracks, explanation] of [
        ["EXTERNAL TRACKS", { ...standalone_codes_dict, ...external_codes_dict },
            'This list always includes <span class="important-text bold-font">France (Paul Ricard) and Sochi</span>, plus any additional circuits <span class="important-text bold-font">detected in your loaded save</span>. You need the corresponding track mods installed to race on them. France and Sochi have base-game track data but need a mod to supply the circuit model. IDs for additional tracks may vary between mods or saves.']
    ]) {
        if (Object.keys(tracks).length === 0) continue
        const title = document.createElement('li');
        title.className = "custom-dropdown-section-title bold-font";
        title.textContent = label;
        const info = document.createElement('button');
        info.type = 'button';
        info.className = 'info-titles calendar-track-info';
        info.textContent = '?';
        info.setAttribute('aria-label', `About ${label.toLowerCase()}`);
        title.appendChild(info);
        menu.appendChild(title);
        const tooltip = new bootstrap.Tooltip(info, {
            title: explanation,
            html: true,
            container: document.body,
            placement: 'right',
            trigger: 'manual',
            customClass: 'calendar-track-tooltip'
        });
        let hideTimer;
        const showTooltip = () => {
            clearTimeout(hideTimer);
            tooltip.show();
        };
        const scheduleHide = () => {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                const tip = document.getElementById(info.getAttribute('aria-describedby'));
                if (!info.matches(':hover, :focus') && !tip?.matches(':hover')) tooltip.hide();
            }, 180);
        };
        info.addEventListener('mouseenter', showTooltip);
        info.addEventListener('focus', showTooltip);
        info.addEventListener('mouseleave', scheduleHide);
        info.addEventListener('blur', scheduleHide);
        info.addEventListener('inserted.bs.tooltip', () => {
            const tip = document.getElementById(info.getAttribute('aria-describedby'));
            tip.addEventListener('mouseenter', () => clearTimeout(hideTimer));
            tip.addEventListener('mouseleave', scheduleHide);
        });
        info.addEventListener('hide.bs.tooltip', () => clearTimeout(hideTimer));
        info.addEventListener('keydown', event => {
            if (event.key === 'Escape') tooltip.hide();
        });
        info.addEventListener('click', event => event.stopPropagation());
        for (const dataCode of Object.keys(tracks)) {
            addMenuItem(dataCode, tracks[dataCode], true)
        }
    }
    listenerRaces()
}

/**
 * Adds the listeners to the addRace menu races
 */
function listenerRaces() {
    document.querySelectorAll('#addTrackMenu a').forEach(item => {
        item.addEventListener("click",function () {
            if (document.querySelector(".main-calendar-section").childElementCount < max_races) {
                const race = {
                    code: item.dataset.code,
                    rainP: 0,
                    rainQ: 0,
                    rainR: 0,
                    type: 0,
                    trackId: item.dataset.trackid,
                    state: 0,
                    isF2Race: 0,
                    isF3Race: 0
                }
                const addAndUpdate = () => {
                    addRace(race)
                    updateVisualizers()
                    update_numbers()
                }
                if (standalone_codes_dict[race.code]) {
                    const modalEl = document.getElementById("moddedTrackWarningModal")
                    const modal = bootstrap.Modal.getOrCreateInstance(modalEl)
                    const trackName = names_full[races_names[race.trackId]];
                    modalEl.querySelector('.modal-body').innerHTML = `Adding ${trackName} <span class="important-text bold-font">MAY BREAK YOUR SAVE</span>. Only add it if you have the ${trackName} standalone track mod installed in your game.`;
                    document.getElementById("confirmModdedTrackButton").onclick = () => {
                        modal.hide()
                        addAndUpdate()
                    }
                    modal.show()
                } else {
                    addAndUpdate()
                }
            }
        })
    })
}

/**
 * Event listeenr for the delete tracks button
 */
document.getElementById("deleteTracks").addEventListener("click",function (btn) {
    if (deleting) {
        this.className = "close-modal"
        document.querySelectorAll(".race-calendar").forEach(function (elem) {
            elem.classList.remove("deleting");

        })

    }
    else {
        document.querySelectorAll(".race-calendar").forEach(function (elem) {
            elem.classList.add("deleting");
        })
        this.className = "close-modal delete-mode"

    }

    deleting = !deleting
    update_numbers();
})

document.getElementById("importPreviousSeasonCalendar").addEventListener("click", function () {
    importPreviousSeasonCalendar()
})

document.getElementById("removeCalendarSprints").addEventListener("click", function () {
    removeCalendarSprints()
})


/**
 * Manages the interaction with the race divs
 */
interact('.race-calendar').draggable({
    inertia: true,
    listeners: {
        start(event) {
            let target = event.target;
            if (target.classList.contains("completed")) {
                event.interaction.stop();
                return;
            }
            let position = target.getBoundingClientRect();
            let width = target.getBoundingClientRect().width

        },
        move(event) {
            const target = event.target;
            if (target.classList.contains("completed")) return;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.style.opacity = 1;
            target.style.zIndex = 10;

            target.setAttribute('data-x',x);
            target.setAttribute('data-y',y);

            const racesEvents = document.querySelectorAll('.race-calendar');
            let nextTarget = null;
            let nextPosition = null;
            racesEvents.forEach(function (element) {
                if (target === element) return;
                let eventRect = element.getBoundingClientRect();
                let centerHorizontal = (eventRect.left + eventRect.right) / 2;
                if (event.clientX >= eventRect.left && event.clientX <= eventRect.right && event.clientY >= eventRect.top && event.clientY <= eventRect.bottom) {
                    nextTarget = element;
                    nextPosition = event.clientX >= centerHorizontal ? "after" : "before";
                }
            });
            if (previewTarget !== nextTarget || previewPosition !== nextPosition) {
                clearDropPreview();
                if (nextTarget && nextPosition) {
                    previewTarget = nextTarget;
                    previewPosition = nextPosition;
                    previewTarget.classList.add(nextPosition === "after" ? "drop-after" : "drop-before");
                }
            }
        },
        end(event) {
            let target = event.target;
            if (target.classList.contains("completed")) return;

            if (previewTarget && previewPosition) {
                reubicate(target, previewTarget, previewPosition);
                update_numbers();
            }
            clearDropPreview();

            target.style.transform = 'none';
            target.setAttribute('data-x',0);
            target.setAttribute('data-y',0);

            // originalParent = undefined;
            // destinationParent = undefined;
            // draggable = undefined;
        }
    }
})

