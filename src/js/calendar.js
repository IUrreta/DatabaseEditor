import { races_map, codes_dict, weather_dict } from "./config";
import { game_version } from "./renderer";

let deleting = false;
let deleted = false;

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
 * @param {string} code Code from the race
 */
function addRace(code, rainP, rainQ, rainR, type, trackID, state) {
    let imageUrl = codes_dict[code];

    let div = document.createElement('div');
    let leftDiv = document.createElement('div');
    let numberDiv = document.createElement('div');
    numberDiv.className = "race-calendar-number bold-font"
    leftDiv.className = "left-race"
    let rightDiv = document.createElement('div');
    rightDiv.className = "right-race"
    div.classList.add('race-calendar');
    div.dataset.trackid = trackID
    div.dataset.rainQ = rainQ
    div.dataset.rainR = rainR
    div.dataset.rainP = rainP
    div.dataset.type = type
    div.dataset.state = state
    if(state === 2){
        div.classList.add("completed")
        let compDiv = document.createElement('div');
        compDiv.classList.add('complete-div');
        let divText = document.createElement('div');
        divText.innerHTML = "Completed";
        divText.className = "bold-font"
        divText.style.fontSize = "18px"
        compDiv.appendChild(divText)
        div.appendChild(compDiv)
    }

    let upperDiv = document.createElement('div');
    upperDiv.className = "upper-text-and-flag"
    let textDiv = document.createElement('div');
    textDiv.classList.add('upper-race','bold-font');
    textDiv.textContent = code.slice(0,-1).toUpperCase();

    const img = document.createElement('img');
    img.src = imageUrl;
    img.classList.add('flag');

    upperDiv.appendChild(textDiv);
    upperDiv.appendChild(img);
    let ATAInput;
    let lowerDiv = document.createElement('div');
    lowerDiv.classList.add('lower-race');
    lowerDiv.innerHTML = "<div class='form-check form-switch'><input class='form-check-input custom-toggle sprint-input' type='checkbox' role='switch''><label class='form-check-label'>Sprint</label></div>";
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
    leftArrow.className = "bi bi-chevron-left"
    let rightArrow = document.createElement('i');
    rightArrow.className = "bi bi-chevron-right"
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
            newVal = Number(val) - 1
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
            newVal = Number(val) + 1
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
    document.querySelector('.main-calendar-section').innerHTML = ""
    races.forEach(function(elem){
        let code = races_map[elem[0]]
        addRace(code, transformWeather(elem[1]), transformWeather(elem[2]), transformWeather(elem[3]), elem[4], elem[0], elem[5])
    })
    updateVisualizers()
    update_numbers()
    load_addRaces()

}

function update_numbers(){
    document.querySelectorAll(".race-calendar-number").forEach(function(elem, index){
        elem.textContent = index + 1
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
    document.getElementById("addTrackMenu").innerHTML = ""
    for (let dataCode of Object.keys(codes_dict)) {
        let elem = countries_dict[dataCode]
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.classList.add('dropdown-item');
        a.classList.add('menu-race');
        a.href = '#';
        a.textContent = elem;
        a.dataset.code = dataCode
        a.dataset.trackid = invertedRacesMap[dataCode]
        let imageUrl = codes_dict[dataCode];
        let img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('menuFlag');

        a.appendChild(img)

        li.appendChild(a);
        document.getElementById("addTrackMenu").appendChild(li);

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
                addRace(item.dataset.code, 0, 0, 0, 0, item.dataset.trackid, 0)
                updateVisualizers()
                update_numbers()
            }
        })
    })
}

/**
 * Event listeenr for the delete tracks button
 */
document.getElementById("deleteTracks").addEventListener("click",function (btn) {
    if (deleting) {
        document.querySelectorAll(".delete-div").forEach(function (elem) {
            elem.parentNode.removeChild(elem)
            update_numbers()
        })
        this.className = "custom-dropdown custom-button bold-font"
        document.querySelectorAll(".race-calendar").forEach(function (elem) {
            if(elem.firstChild.className !== "complete-div"){
                elem.classList = "race-calendar";
            }
            

        })

    }
    else {
        document.querySelectorAll(".race-calendar").forEach(function (elem) {
            if(elem.firstChild.className !== "complete-div"){
                elem.classList = "race-calendar deleting";
                let div = document.createElement('div');
                let trashicon = document.createElement('i');
                let trashandtext = document.createElement('div');
                let text = document.createElement('span');
                text.classList = "bold-font"
                text.innerText = "Delete";
                trashandtext.classList.add('trash-and-text')
                trashicon.className = "bi bi-trash-fill";
                div.classList.add('delete-div');
                trashandtext.appendChild(trashicon);
                trashandtext.appendChild(text);
                div.appendChild(trashandtext);
                elem.insertBefore(div,elem.firstChild);
                trashandtext.addEventListener("click",function () {
                    let race = trashandtext.parentNode.parentNode;
                    trashandtext.parentNode.parentNode.parentNode.removeChild(race);
                    deleted = true;
                    if (race.dataset.trackid === "6"){
                        update_notifications("Why'd you do that?", "monaco")
                    }
                })
            }


        })
        this.className = "custom-dropdown custom-button bold-font delete-mode"

    }

    deleting = !deleting
})


/**
 * Manages the interaction with the race divs
 */
interact('.race-calendar').draggable({
    inertia: true,
    listeners: {
        start(event) {
            let target = event.target;
            let position = target.getBoundingClientRect();
            let width = target.getBoundingClientRect().width

        },
        move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.style.opacity = 1;
            target.style.zIndex = 10;

            target.setAttribute('data-x',x);
            target.setAttribute('data-y',y);
        },
        end(event) {
            let target = event.target;

            const racesEvents = document.querySelectorAll('.race-calendar');
            racesEvents.forEach(function (element) {
                let eventRect = element.getBoundingClientRect();
                let centerHorizontal = (eventRect.left + eventRect.right) / 2;

                if (target !== element) {

                    if (event.clientX >= eventRect.left && event.clientX <= eventRect.right && event.clientY >= eventRect.top && event.clientY <= eventRect.bottom) {
                        if (event.clientX >= centerHorizontal) {
                            reubicate(target,element,"after")
                        } else {
                            reubicate(target,element,"before")
                        }
                        update_numbers()

                    }
                }




            });

            target.style.transform = 'none';
            target.setAttribute('data-x',0);
            target.setAttribute('data-y',0);

            // originalParent = undefined;
            // destinationParent = undefined;
            // draggable = undefined;
        }
    }
})