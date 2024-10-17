let teamCod;
let currYear;
let originalCostCap;
let longTermObj;


/**
 * Listener for the team menu buttons
 */
document.querySelector("#teamMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        document.querySelector("#teamButton").innerText = elem.querySelector(".team-menu-name").innerText;
        teamCod = elem.dataset.teamid;
        let saveSelector = document.getElementById('saveSelector');
        let saveSelected = saveSelector.innerHTML;
        let data = {
            command: "teamRequest",
            teamID: teamCod,
            saveSelected: saveSelected
        }

        socket.send(JSON.stringify(data))
        document.querySelector(".team-viewer").classList.remove("d-none")
    })
    
})

/**
 * Resets the view
 */
function resetTeamEditing(){
    document.querySelector(".team-viewer").classList.add("d-none");
    teamCod = null;
    document.querySelector("#teamButton").innerText = "Team";
}

/**
 * Listener for the objective menu dropdown
 */
document.querySelector("#objectiveMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        document.querySelector(".objective-label").innerText = elem.textContent
        longTermObj = elem.id[elem.id.length-1]
    })

})

/**
 * Helper function to add mousedown listener with auto increment/decrement
 */
function addContinuousListener(element, selector, incrementCallback, decrementCallback) {
    let intervalId;
    element.querySelectorAll(selector).forEach(function(elem) {
        elem.addEventListener('mousedown', function() {
            let input = this.parentNode.parentNode.querySelector("input");
            if (this.classList.contains('bi-chevron-up') || this.classList.contains('bi-plus-lg')) {
                incrementCallback(input);
                intervalId = setInterval(() => {
                    incrementCallback(input);
                }, 100);
            } else if (this.classList.contains('bi-chevron-down') || this.classList.contains('bi-dash-lg')) {
                decrementCallback(input);
                intervalId = setInterval(() => {
                    decrementCallback(input);
                }, 100);
            }
        });

        elem.addEventListener('mouseup', function() {
            clearInterval(intervalId);
        });

        elem.addEventListener('mouseleave', function() {
            clearInterval(intervalId);
        });
    });
}

/**
 * Listeners for the long term input year
 */
addContinuousListener(document.querySelector("#objAndYear"), ".bi-chevron-up, .bi-chevron-down",
    function(input) { input.value = Number(input.value) + 1; },
    function(input) {
        let value = Number(input.value) - 1;
        if (value <= currYear) {
            value = currYear;
        }
        input.value = value;
    }
);

/**
 * Listeners for the season objective input
 */
addContinuousListener(document.querySelector("#seasonObjective"), ".bi-chevron-up, .bi-chevron-down",
    function(input) {
        let value = Number(input.value) - 1;
        if (value <= 1) {
            value = 1;
        }
        input.value = value;
    },
    function(input) {
        let value = Number(input.value) + 1;
        if (value >= 10) {
            value = 10;
        }
        input.value = value;
    }
);

/**
 * Listeners for the board confidence input
 */
addContinuousListener(document.querySelector("#confidence"), ".bi-plus-lg, .bi-dash-lg",
    function(input) {
        let value = Number(input.value) + 5;
        if (value >= 100) {
            value = 100;
        }
        input.value = value;
    },
    function(input) {
        let value = Number(input.value) - 5;
        if (value <= 0) {
            value = 0;
        }
        input.value = value;
    }
);

/**
 * Listeners for the cost cap input
 */
addContinuousListener(document.querySelector("#costCap"), ".bi-plus-lg, .bi-dash-lg",
    function(input) {
        let valorActual = input.value.replace(/[$,]/g, "");
        let nuevoValor = Number(valorActual) + 100000;
        input.value = nuevoValor.toLocaleString('en-US') + '$';
    },
    function(input) {
        let valorActual = input.value.replace(/[$,]/g, "");
        let nuevoValor = Number(valorActual) - 100000;
        input.value = nuevoValor.toLocaleString('en-US') + '$';
    }
);

/**
 * Listeners for the team budget input
 */
addContinuousListener(document.querySelector("#teamBudget"), ".bi-plus-lg, .bi-dash-lg",
    function(input) {
        let valorActual = input.value.replace(/[$,]/g, "");
        let nuevoValor = Number(valorActual) + 100000;
        input.value = nuevoValor.toLocaleString('en-US') + '$';
    },
    function(input) {
        let valorActual = input.value.replace(/[$,]/g, "");
        let nuevoValor = Number(valorActual) - 100000;
        input.value = nuevoValor.toLocaleString('en-US') + '$';
    }
);


function updateCondition(input, increment, bar) {
    let actual = input.innerText.split("%")[0];
    let val = parseInt(actual) + increment;
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    input.innerText = val + "%";
    bar.style.width = val + "%";
}

document.querySelectorAll(".condition-container .bi-plus").forEach(button => {
    let intervalId;
    button.addEventListener('mousedown', function () {
        let input = button.parentNode.parentNode.querySelector(".condition-container-value");
        let bar = button.parentNode.parentNode.querySelector(".condition-container-bar-progress");
        updateCondition(input, 1, bar);
        intervalId = setInterval(() => {
            updateCondition(input, 1, bar);
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

document.querySelectorAll(".condition-container .bi-dash").forEach(button => {
    let intervalId;
    button.addEventListener('mousedown', function () {
        let input = button.parentNode.parentNode.querySelector(".condition-container-value");
        let bar = button.parentNode.parentNode.querySelector(".condition-container-bar-progress");
        updateCondition(input, -1, bar);
        intervalId = setInterval(() => {
            updateCondition(input, -1, bar);
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

/**
 * Listeners for the show and hide buttons facilities
 */
document.querySelector("#carDevButton").addEventListener("click", function () {
    if (document.querySelector("#operationButton").dataset.state === "show") {
        document.querySelector("#operationButton").click()
    }
    if (document.querySelector("#staffButton").dataset.state === "show"){
        document.querySelector("#staffButton").click()
    }
    if (document.querySelector("#carDevButton").dataset.state === "show") {
        document.querySelector("#carDevButton").dataset.state = "hide"
        document.querySelector("#carDevButton").querySelector(".front-gradient").innerText = "Show"
    }
    else {
        document.querySelector("#carDevButton").dataset.state = "show"
        document.querySelector("#carDevButton").querySelector(".front-gradient").innerText = "Hide"
    }


})

document.querySelector("#operationButton").addEventListener("click", function () {
    if (document.querySelector("#carDevButton").dataset.state === "show") {
        document.querySelector("#carDevButton").click()
    }
    if (document.querySelector("#staffButton").dataset.state === "show"){
        document.querySelector("#staffButton").click()
    }
    if (document.querySelector("#operationButton").dataset.state === "show") {
        document.querySelector("#operationButton").dataset.state = "hide"
        document.querySelector("#operationButton").querySelector(".front-gradient").innerText = "Show"
    }
    else {
        document.querySelector("#operationButton").dataset.state = "show"
        document.querySelector("#operationButton").querySelector(".front-gradient").innerText = "Hide"
    }


})

document.querySelector("#staffButton").addEventListener("click", function () {
    if (document.querySelector("#operationButton").dataset.state === "show") {
        document.querySelector("#operationButton").click()
    }
    if (document.querySelector("#carDevButton").dataset.state === "show") {
        document.querySelector("#carDevButton").click()
    }
    if (document.querySelector("#staffButton").dataset.state === "show") {
        document.querySelector("#staffButton").dataset.state = "hide"
        document.querySelector("#staffButton").querySelector(".front-gradient").innerText = "Show"
    }
    else {
        document.querySelector("#staffButton").dataset.state = "show"
        document.querySelector("#staffButton").querySelector(".front-gradient").innerText = "Hide"
    }
})


/**
 * Fills the level for each facility
 * @param {object} teamData info of the team facilities
 */
function fillLevels(teamData) {
    teamData.slice(0, 15).forEach(function (elem) {
        let num = elem[0];
        let level = num % 10;
        let facilityID = Math.floor(num / 10);
        let facility = document.querySelector("#facility" + facilityID)
        let indicator = facility.querySelector('.facility-level-indicator')
        let condition_container = facility.querySelector('.condition-container')
        let bar = condition_container.querySelector('.condition-container-bar-progress')
        let condition_value = condition_container.querySelector('.condition-container-value')
        bar.style.width = elem[1] * 100 + "%"
        condition_value.innerText = parseInt(elem[1] * 100) + "%"
        indicator.dataset.value = level
        let value = level
        let levels = indicator.querySelectorAll('.level');

        for (let i = 0; i < 5; i++) {
            levels[i].className = "level"
            if (i <= value - 1) {
                levels[i].classList.add(team_dict[teamCod] + 'activated');
            }
        }
    })
    document.querySelector("#seasonObjectiveInput").value = teamData[16]
    document.querySelector("#longTermObj" + teamData[17][0]).click()
    document.querySelector("#longTermInput").value = teamData[17][1]
    document.querySelector("#teamBudgetInput").value = teamData[18].toLocaleString("en-US") + "$"
    document.querySelector("#costCapInput").value = Math.abs(teamData[19][0]).toLocaleString("en-US") + "$"
    manageConfidence(teamData[20])
    document.querySelector("#confidenceInput").value = teamData[20]
    currYear = teamData[21]
    originalCostCap = Math.abs(teamData[19][0])
    for (key in teamData[22]){
        let pitCrewStat = document.querySelector(`.pit-crew-details .one-stat-panel[data-crewStat='${key}']`);
        let input = pitCrewStat.querySelector("input");
        let value = Math.round(teamData[22][key]);
        if (key === "38"){
            value = value / 10;
        }
        input.value = value + "%";
        let bar = pitCrewStat.querySelector(".one-stat-progress");
        bar.style.width = value + "%";
    }
    let engineManufacturer = teamData[23];
    document.querySelector(`#engineMenu a[data-engine='${engineManufacturer}']`).click();
    let bars = document.querySelector(".pit-crew-details").querySelectorAll(".one-stat-progress");
    bars.forEach(function(elem){
        elem.classList = "one-stat-progress " + team_dict[teamCod] + "bar-primary";
    })
}

document.querySelectorAll(".facility-refurbish svg").forEach(function(elem){
    elem.addEventListener("click", function(){
        let facility = elem.parentNode.parentNode;
        let condition_value = facility.querySelector('.condition-container-value');
        let bar = facility.querySelector('.condition-container-bar-progress');
        condition_value.innerText = "100%";
        bar.style.width = "100%";
    })
})


document.querySelectorAll("#engineMenu a").forEach(function(elem){
    elem.addEventListener("click", function(){
        let engineiD = elem.dataset.engine;
        let engine = elem.innerText;
        document.querySelector("#engineLabel").innerText = engine;
        document.querySelector("#engineButton").dataset.value = engineiD;
    })
})

function updatePitStat(input, increment) {
    let actual = input.value.split("%")[0];
    let val = parseInt(actual) + increment;
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    input.value = val + "%";
    manage_stat_bar(input, val);
}


document.querySelector(".pit-crew-details").querySelectorAll(".bi-plus-lg").forEach(function(elem){
    let intervalId;
    elem.addEventListener('mousedown', function() {
        let input = this.parentNode.parentNode.querySelector("input");
        updatePitStat(input, 1);
        intervalId = setInterval(() => {
            updatePitStat(input, 1);
        }, 100);
    });

    elem.addEventListener('mouseup', function() {
        clearInterval(intervalId);
    });

    elem.addEventListener('mouseleave', function() {
        clearInterval(intervalId);
    });
})

document.querySelector(".pit-crew-details").querySelectorAll(".bi-dash-lg").forEach(function(elem){
    let intervalId;
    elem.addEventListener('mousedown', function() {
        let input = this.parentNode.parentNode.querySelector("input");
        updatePitStat(input, -1);
        intervalId = setInterval(() => {
            updatePitStat(input, -1);
        }, 100);
    });

    elem.addEventListener('mouseup', function() {
        clearInterval(intervalId);
    });

    elem.addEventListener('mouseleave', function() {
        clearInterval(intervalId);
    });
})

/**
 * Manages state of blocking div for confidence
 * @param {Number} data Confidence number. If -1, blocking div is activated
 */
function manageConfidence(data){
    if(Number(data[0]) !== -1){
        document.querySelector(".blocking-confidence").classList.add("d-none")
    }
    else{
        document.querySelector(".blocking-confidence").classList.remove("d-none")
    }
}

/**
 * Listeners for the level indicators for each facility
 */
document.querySelector("#edit_teams").querySelectorAll(".bi-chevron-right").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let indicator = elem.parentNode.querySelector(".facility-level-indicator")
        let value = parseInt(indicator.getAttribute('data-value')) + 1;
        if (value > 5) {
            value = 5
        }

        indicator.setAttribute('data-value', value);
        let levels = indicator.querySelectorAll('.level');

        if (value <= levels.length) {
            levels[value - 1].classList.add(team_dict[teamCod] + 'activated');
        }
    })
})

document.querySelector("#edit_teams").querySelectorAll(".bi-chevron-left").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let indicator = elem.parentNode.querySelector(".facility-level-indicator")
        let value = parseInt(indicator.getAttribute('data-value')) - 1;
        if (value < 0) {
            value = 0
        }

        indicator.setAttribute('data-value', value);
        let levels = indicator.querySelectorAll('.level');

        if (value < levels.length) {
            levels[value].className = "level"
        }
    })

})


/**
 * Collects the data for each facility
 * @returns array with tuples for each facility
 */
function gather_team_data() {
    let facilities = document.getElementsByClassName('facility');
    let result = [];

    for (let i = 0; i < facilities.length; i++) {
        let facility = facilities[i];
        let id = facility.id.match(/\d+$/)[0]; // Extrae el número al final del id
        let levelIndicator = facility.getElementsByClassName('facility-level-indicator')[0];
        let level = levelIndicator.getAttribute('data-value');
        let number = id + level; // Compone el número concatenando los strings
        let condition = facility.querySelector('.condition-container-value').innerText.split("%")[0] / 100;
        result.push([number, condition]); // Añade la tupla a la lista
    }

    return result
}

function gather_pit_crew(){
    let pitCrewStats = document.querySelectorAll(".pit-crew-details .one-stat-panel");
    let result = {};
    pitCrewStats.forEach(function(elem){
        let key = elem.dataset.crewstat;
        let value = elem.querySelector("input").value.split("%")[0];
        if (key === "38"){
            value = value * 10;
        }
        result[key] = value;
    });
    return result;
}