import { team_dict } from "./config";
import { Command } from "../backend/command.js";
import { manage_stat_bar } from "./stats";
import { attachHold } from "./renderer.js";

export let teamCod;
let currYear;
export let originalCostCap;
export let longTermObj;

const MAX_ARC_LENGTH = 212; 

/**
 * Listener for the team menu buttons
 */
document.querySelector("#teamMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        document.querySelector("#teamButton span").innerText = elem.querySelector(".team-menu-name").innerText;
        teamCod = elem.dataset.teamid;
        let data = {
            teamID: teamCod,
        }

        document.querySelector("#teamButton").classList.remove("open")

        const command = new Command("teamRequest", data);
        command.execute();

        document.querySelector(".team-viewer").classList.remove("d-none")
    })

})


/**
 * Listener for the objective menu dropdown
 */
document.querySelector("#objectiveMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        document.querySelector(".objective-label").innerText = elem.textContent
        longTermObj = elem.id[elem.id.length - 1]
    })

})

/**
 * Helper function to add mousedown listener with auto increment/decrement
 */
function addContinuousListener(element, selector, incrementCallback, decrementCallback) {
    let intervalId;
    element.querySelectorAll(selector).forEach(function (elem) {
        elem.addEventListener('mousedown', function () {
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

        elem.addEventListener('mouseup', function () {
            clearInterval(intervalId);
        });

        elem.addEventListener('mouseleave', function () {
            clearInterval(intervalId);
        });
    });
}

attachHold(document.querySelector("#objAndYear .input-and-buttons .bi-plus"), document.querySelector("#longTermInput"), +1, { min: 2023, max: 2023 + 1000 });
attachHold(document.querySelector("#objAndYear .input-and-buttons .bi-dash"), document.querySelector("#longTermInput"), -1, { min: 2023, max: 2023 + 1000 });


attachHold(document.querySelector("#seasonObjective .bi-plus"), document.querySelector("#seasonObjectiveInput"), -1, { min: 1, max: 10 });
attachHold(document.querySelector("#seasonObjective .bi-dash"), document.querySelector("#seasonObjectiveInput"), +1, { min: 1, max: 10 });


attachHold(document.querySelector("#confidence .bi-plus"), document.querySelector("#confidence input"), +5, { min: 0, max: 100 });
attachHold(document.querySelector("#confidence .bi-dash"), document.querySelector("#confidence input"), -5, { min: 0, max: 100 });


attachHold(document.querySelector("#costCap .bi-plus"), document.querySelector("#costCap input"), +100000,
    {
        min: -9999999999,
        max: 1000000000,
        format: (val) => val.toLocaleString("en-US")
    });

attachHold(document.querySelector("#costCap .bi-dash"), document.querySelector("#costCap input"), -100000,
    {
        min: -9999999999,
        max: 1000000000,
        format: (val) => val.toLocaleString("en-US")
    });


attachHold(
    document.querySelector("#teamBudget .bi-plus"),
    document.querySelector("#teamBudget input"),
    +100000,
    {
        min: -9999999999,
        max: 1000000000,
        format: (val) => val.toLocaleString("en-US")
    }
);

attachHold(document.querySelector("#teamBudget .bi-dash"),
    document.querySelector("#teamBudget input"),
    -100000,
    {
        min: -9999999999,
        max: 1000000000,
        format: (val) => val.toLocaleString("en-US")
    }
);

document.querySelectorAll(".gauge-and-buttons .bi-plus").forEach(btn => {
    const wrapper = btn.closest('.gauge-and-buttons');
    const textSpan = wrapper.querySelector('.gauge-indicator');
    const gaugeContainer = wrapper.querySelector('.gauge-container');

    attachHold(btn, textSpan, +1, {
        min: 0,
        max: 100,
        format: v => v + '%', // Formato con porcentaje
        onChange: (val) => {
            updateGaugeVisual(gaugeContainer, val);
        }
    });
});

document.querySelectorAll(".gauge-and-buttons .bi-dash").forEach(btn => {
    const wrapper = btn.closest('.gauge-and-buttons');
    const textSpan = wrapper.querySelector('.gauge-indicator');
    const gaugeContainer = wrapper.querySelector('.gauge-container');

    attachHold(btn, textSpan, -1, {
        min: 0,
        max: 100,
        format: v => v + '%',
        onChange: (val) => {
            updateGaugeVisual(gaugeContainer, val);
        }
    });
});

function updateGaugeVisual(container, value) {
    container.style.setProperty('--perc', value);
    //if value is 100 set font-size to 12px
    const textSpan = container.querySelector('.gauge-indicator');
    if (value === 100) {
        textSpan.style.fontSize = '10px';
    } else {
        textSpan.style.fontSize = '';
    }
}


/**
 * Listeners for the show and hide buttons facilities
 */
document.querySelector("#carDevPill").addEventListener("click", function () {
    if (!document.querySelector("#carDevCollapse").classList.contains("show")) {
        document.querySelector("#carDevCollapse").classList.add("show")
    }
    document.querySelector("#operationCollapse").classList.remove("show")
    document.querySelector("#staffCollapse").classList.remove("show")
})

document.querySelector("#opsPill").addEventListener("click", function () {
    if (!document.querySelector("#operationCollapse").classList.contains("show")) {
        document.querySelector("#operationCollapse").classList.add("show")
    }
    document.querySelector("#carDevCollapse").classList.remove("show")
    document.querySelector("#staffCollapse").classList.remove("show")

})

document.querySelector("#staffFacilitiesPill").addEventListener("click", function () {
    if (!document.querySelector("#staffCollapse").classList.contains("show")) {
        document.querySelector("#staffCollapse").classList.add("show")
    }
    document.querySelector("#operationCollapse").classList.remove("show")
    document.querySelector("#carDevCollapse").classList.remove("show")
})


/**
 * Fills the level for each facility
 * @param {object} teamData info of the team facilities
 */
export function fillLevels(teamData) {
    teamData.slice(0, 15).forEach(function (elem) {
        let num = elem[0];
        let level = num % 10;
        let facilityID = Math.floor(num / 10);
        let facility = document.querySelector("#facility" + facilityID)
        let indicator = facility.querySelector('.facility-level-indicator')
        

        let gaugeElement = facility.querySelector('.gauge-container');

        if (gaugeElement) {
            let percentage = parseInt(elem[1] * 100);
            gaugeElement.style.setProperty('--perc', percentage);
            let gaugeText = gaugeElement.querySelector('.gauge-indicator');
            if (gaugeText) {
                gaugeText.innerText = percentage + '%';
            }
            if (percentage === 100) {
                gaugeText.style.fontSize = '10px';
            } else {
                gaugeText.style.fontSize = '';
            }
        }

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
    document.querySelector("#teamBudgetInput").value = teamData[18].toLocaleString("en-US")
    document.querySelector("#costCapInput").value = Math.abs(teamData[19][0]).toLocaleString("en-US")
    manageConfidence(teamData[20])
    document.querySelector("#confidenceInput").value = teamData[20]
    currYear = teamData[21]
    originalCostCap = Math.abs(teamData[19][0])
    for (let key in teamData[22]) {
        let pitCrewStat = document.querySelector(`.pit-crew-details .one-stat-panel[data-crewStat='${key}']`);
        let input = pitCrewStat.querySelector("input");
        let value = Math.round(teamData[22][key]);
        if (key === "38") {
            value = value / 10;
        }
        input.value = value + "%";
        let bar = pitCrewStat.querySelector(".one-stat-progress");
        bar.style.width = value + "%";
    }
    let engineManufacturer = teamData[23];
    document.querySelector(`#engineMenu a[data-engine='${engineManufacturer}']`).click();
    let bars = document.querySelector(".pit-crew-details").querySelectorAll(".one-stat-progress");
    bars.forEach(function (elem) {
        elem.classList = "one-stat-progress " + team_dict[teamCod] + "bar-primary";
    })
}




document.querySelectorAll("#engineMenu a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let engineiD = elem.dataset.engine;
        let engine = elem.innerText;
        document.querySelector("#engineLabel").innerText = engine;
        document.querySelector("#engineButton").dataset.value = engineiD;
    })
})

/**
 * Resets the view
 */
export function resetTeamEditing() {
    document.querySelector(".team-viewer").classList.add("d-none");
    teamCod = null;
    document.querySelector("#teamButton").innerText = "Team";
}


function updatePitStat(input, increment) {
    let actual = input.value.split("%")[0];
    let val = parseInt(actual) + increment;
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    input.value = val + "%";
    manage_stat_bar(input, val);
}


document.querySelector(".pit-crew-details").querySelectorAll(".bi-plus").forEach(function (elem) {
    // Guardamos referencia al input una sola vez para no buscarlo a cada clic
    const input = elem.parentNode.querySelector("input");

    attachHold(elem, input, +1, {
        min: 0,
        max: 100,
        // 1. Añadimos el símbolo % visualmente
        format: (v) => v + '%', 
        // 2. Corregimos el onChange para que reciba el valor nuevo (val)
        onChange: function (val) {
            manage_stat_bar(input, val);
        }
    });
});

// Configuración para el botón - (DASH)
document.querySelector(".pit-crew-details").querySelectorAll(".bi-dash").forEach(function (elem) {
    const input = elem.parentNode.querySelector("input");

    attachHold(elem, input, -1, {
        min: 0,
        max: 100,
        format: (v) => v + '%',
        onChange: function (val) {
            manage_stat_bar(input, val);
        }
    });
});

/**
 * Manages state of blocking div for confidence
 * @param {Number} data Confidence number. If -1, blocking div is activated
 */
function manageConfidence(data) {
    if (Number(data[0]) === -1) {
        document.querySelector("#confidence").classList.add("d-none")
    }
    else {
        document.querySelector("#confidence").classList.remove("d-none")
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
export function gather_team_data() {
    let facilities = document.getElementsByClassName('facility');
    let result = [];

    for (let i = 0; i < facilities.length; i++) {
        let facility = facilities[i];
        let id = facility.id.match(/\d+$/)[0]; // Extrae el número al final del id
        let levelIndicator = facility.getElementsByClassName('facility-level-indicator')[0];
        let level = levelIndicator.getAttribute('data-value');
        let number = id + level; // Compone el número concatenando los strings
        let condition = facility.querySelector('.gauge-indicator').innerText.split("%")[0] / 100;
        result.push([number, condition]); // Añade la tupla a la lista
    }

    return result
}

export function gather_pit_crew() {
    let pitCrewStats = document.querySelectorAll(".pit-crew-details .one-stat-panel");
    let result = {};
    pitCrewStats.forEach(function (elem) {
        let key = elem.dataset.crewstat;
        let value = elem.querySelector("input").value.split("%")[0];
        if (key === "38") {
            value = value * 10;
        }
        result[key] = value;
    });
    return result;
}