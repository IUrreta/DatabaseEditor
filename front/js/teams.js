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
        let data = {
            command: "teamRequest",
            teamID: teamCod,
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
        document.querySelector("#objectiveButton").innerText = elem.textContent
        longTermObj = elem.id[elem.id.length-1]
    })

})

/**
 * Listeners for the long term input year
 */
document.querySelector("#objAndYear").querySelector(".bi-chevron-up").addEventListener("click", function () {
    document.querySelector("#longTermInput").value = Number(document.querySelector("#longTermInput").value) + 1
})

document.querySelector("#objAndYear").querySelector(".bi-chevron-down").addEventListener("click", function () {
    let value = Number(document.querySelector("#longTermInput").value) - 1
    if (value <= currYear) {
        value = currYear
    }
    document.querySelector("#longTermInput").value = value
})

/**
 * Listeners for the season objective input
 */
document.querySelector("#seasonObjective").querySelector(".bi-chevron-up").addEventListener("click", function () {

    let value = Number(document.querySelector("#seasonObjectiveInput").value) - 1
    if (value <= 1) {
        value = 1
    }
    document.querySelector("#seasonObjectiveInput").value = value
})

document.querySelector("#seasonObjective").querySelector(".bi-chevron-down").addEventListener("click", function () {
    let value = Number(document.querySelector("#seasonObjectiveInput").value) + 1
    if (value >= 10) {
        value = 10
    }
    document.querySelector("#seasonObjectiveInput").value = value
})

/**
 * Listeners for the board confidence input
 */
document.querySelector("#confidence").querySelector(".bi-plus-lg").addEventListener("click", function () {
    let value = Number(document.querySelector("#confidenceInput").value) + 5
    if (value >= 100) {
        value = 100
    }
    document.querySelector("#confidenceInput").value = value
})

document.querySelector("#confidence").querySelector(".bi-dash-lg").addEventListener("click", function () {
    let value = Number(document.querySelector("#confidenceInput").value) - 5
    if (value <= 0) {
        value = 0
    }
    document.querySelector("#confidenceInput").value = value
})


/**
 * Listeners for the cost cap input
 */
document.querySelector("#costCap").querySelector(".bi-plus-lg").addEventListener("click", function () {
    let valorActual = document.querySelector("#costCapInput").value.replace(/[$,]/g, "");
    let nuevoValor = Number(valorActual) + 100000;
    let valorFormateado = nuevoValor.toLocaleString('en-US') + '$';
    document.querySelector("#costCapInput").value = valorFormateado;
})

document.querySelector("#costCap").querySelector(".bi-dash-lg").addEventListener("click", function () {
    let valorActual = document.querySelector("#costCapInput").value.replace(/[$,]/g, "");
    let nuevoValor = Number(valorActual) - 100000;
    let valorFormateado = nuevoValor.toLocaleString('en-US') + '$';
    document.querySelector("#costCapInput").value = valorFormateado;
})

/**
 * Listeners for the team budget input
 */
document.querySelector("#teamBudget").querySelector(".bi-plus-lg").addEventListener("click", function () {
    let valorActual = document.querySelector("#teamBudgetInput").value.replace(/[$,]/g, "");
    let nuevoValor = Number(valorActual) + 100000;
    let valorFormateado = nuevoValor.toLocaleString('en-US') + '$';
    document.querySelector("#teamBudgetInput").value = valorFormateado;
})

document.querySelector("#teamBudget").querySelector(".bi-dash-lg").addEventListener("click", function () {
    let valorActual = document.querySelector("#teamBudgetInput").value.replace(/[$,]/g, "");
    let nuevoValor = Number(valorActual) - 100000;
    let valorFormateado = nuevoValor.toLocaleString('en-US') + '$';
    document.querySelector("#teamBudgetInput").value = valorFormateado;
})

/**
 * Listeners for all the facility conditions inputs
 */
document.querySelectorAll(".facility-condition").forEach(function (elem) {
    elem.querySelector(".bi-chevron-up").addEventListener("click", function () {
        let value = (Number(elem.querySelector("input").value) + 0.05).toFixed(2)
        if (value >= 1) {
            value = 1
        }
        elem.querySelector("input").value = value
    })
    elem.querySelector(".bi-chevron-down").addEventListener("click", function () {
        let value = (Number(elem.querySelector("input").value) - 0.05).toFixed(2)
        if (value <= 0) {
            value = 0
        }
        elem.querySelector("input").value = value
    })
})

/**
 * Listeners for the show and hide buttons facilities
 */
document.querySelector("#carDevButton").addEventListener("click", function () {
    if (document.querySelector("#operationButton").dataset.state === "show") {
        document.querySelector("#operationButton").click()
    }
    if (document.querySelector("#carDevButton").dataset.state === "show") {
        document.querySelector("#carDevButton").dataset.state = "hide"
        document.querySelector("#carDevButton").innerText = "Show"
    }
    else {
        document.querySelector("#carDevButton").dataset.state = "show"
        document.querySelector("#carDevButton").innerText = "Hide"

    }


})

document.querySelector("#operationButton").addEventListener("click", function () {
    if (document.querySelector("#carDevButton").dataset.state === "show") {
        document.querySelector("#carDevButton").click()
    }
    if (document.querySelector("#operationButton").dataset.state === "show") {
        document.querySelector("#operationButton").dataset.state = "hide"
        document.querySelector("#operationButton").innerText = "Show"
    }
    else {
        document.querySelector("#operationButton").dataset.state = "show"
        document.querySelector("#operationButton").innerText = "Hide"
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
        indicator.dataset.value = level
        let value = level
        let levels = indicator.querySelectorAll('.level');

        for (let i = 0; i < 5; i++) {
            levels[i].className = "level"
            if (i <= value - 1) {
                levels[i].classList.add(team_dict[teamCod] + 'activated');
            }
        }
        facility.querySelector("input").value = elem[1]
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
}

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
 * Confirm button listener
 */
document.querySelector("#confirmTeam").addEventListener("click", function(){
    let seasonObjData = document.querySelector("#seasonObjectiveInput").value;
    let longTermData = longTermObj;
    let longTermYearData = document.querySelector("#longTermInput").value;
    let teamBudgetData =  document.querySelector("#teamBudgetInput").value.replace(/[$,]/g, "");
    let costCapTransactionData = originalCostCap - document.querySelector("#costCapInput").value.replace(/[$,]/g, "");
    let confidenceData = document.querySelector("#confidenceInput").value;
    let facilitiesData = gatherData()
    let data = {
        command: "editTeam",
        teamID: teamCod,
        facilities: facilitiesData,
        seasonObj: seasonObjData,
        longTermObj : longTermData,
        longTermYear: longTermYearData,
        teamBudget: teamBudgetData,
        costCapEdit: costCapTransactionData,
        confidence : confidenceData

    }
    socket.send(JSON.stringify(data))
})


/**
 * Collects the data for each facility
 * @returns array with tuples for each facility
 */
function gatherData() {
    let facilities = document.getElementsByClassName('facility');
    let result = [];

    for (let i = 0; i < facilities.length; i++) {
        let facility = facilities[i];
        let id = facility.id.match(/\d+$/)[0]; // Extrae el número al final del id
        let levelIndicator = facility.getElementsByClassName('facility-level-indicator')[0];
        let level = levelIndicator.getAttribute('data-value');
        let number = id + level; // Compone el número concatenando los strings
        let input = facility.getElementsByTagName('input')[0];
        let inputValue = input.value;
        result.push([number, inputValue]); // Añade la tupla a la lista
    }

    return result
}