const teamsPill = document.getElementById("teamsPill");
const enginesPill = document.getElementById("enginesPill");

const teamsDiv = document.getElementById("teamsDiv");
const enginesDiv = document.getElementById("enginesDiv");

const divsTeamsArray = [teamsDiv, enginesDiv]
const pars_abreviations = { "chassis": "C", "front_wing": "FW", "rear_wing": "RW", "underfloor": "UF", "sidepods": "SP", "suspension": "S" }
const part_codes_abreviations = { 3: "C", 4: "FW", 5: "RW", 6: "UF", 7: "SP", 8: "S" }

let abreviations_dict = {
    1: "FE",
    2: "MC",
    3: "RB",
    4: "MER",
    5: "ALP",
    6: "WIL",
    7: "HA",
    8: "AT",
    9: "ALFA",
    10: "AM",
    32: "CUS"
}

let teamSelected;
let engineSelected;
let teamEngineSelected;
let performanceGraph;
let teamsEngine = "teams"
let viewingGraph = true;
let actualMaxDesign = 0;

function normalizeData(data) {
    let values = Object.values(data);

    let min = Math.min(...values);
    let max = Math.max(...values);

    let adjustedMin = min - 5;
    let adjustedMax = max + 5;

    let normalizedData = {};
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            normalizedData[key] = ((data[key] - adjustedMin) / (adjustedMax - adjustedMin)) * 100;
        }
    }

    return normalizedData;
}



function load_performance(teams) {
    // let teams = normalizeData(teams);
    for (let key in teams) {
        if (teams.hasOwnProperty(key)) {
            let teamPerformance = document.querySelector(`#teamsDiv .team-performance[data-teamid='${key}']`);
            if (teamPerformance) {
                let performanceBarProgress = teamPerformance.querySelector('.performance-bar-progress');
                let team_value = teamPerformance.querySelector('.team-title-value');
                if (performanceBarProgress) {
                    performanceBarProgress.style.width = teams[key] + '%';
                    team_value.innerText = teams[key].toFixed(2) + ' %';
                    performanceBarProgress.dataset.overall = teams[key];
                }
            }
        }
    }
}

function load_cars(data) {
    for (let key in data) {
        let cars = document.querySelectorAll(`#carsDiv .car[data-teamid='${key}']`);
        cars.forEach(function (car, index) {
            let carNumber = parseInt(car.dataset.carnumber);
            index = index + 1;
            let bar = car.querySelector('.performance-bar-progress');
            bar.dataset.overall = data[key][carNumber][0];
            bar.style.width = data[key][carNumber][0] + '%';
            let name = car.querySelector('.team-title-name');
            name.innerText = car.dataset.teamshow + " " + carNumber.toString() + " -  #" + data[key][carNumber][1];
            let missing_parts = data[key][carNumber][2];
            let missing_copntainer = car.querySelector(".car-missing-parts")
            missing_copntainer.innerHTML = ""
            if (missing_parts.length > 0) {
                let list = document.createElement("span")
                let string = ""
                missing_parts.forEach(function (part) {
                    let partName = part_codes_abreviations[part]
                    string += partName + " "
                })
                list.innerText = string
                missing_copntainer.appendChild(list)
                let icon = document.createElement("i")
                icon.classList.add("bi", "bi-exclamation-triangle-fill")
                missing_copntainer.appendChild(icon)
            }
            else {
                let icon = document.createElement("i")
                icon.classList.add("bi", "bi-check-all")
                missing_copntainer.appendChild(icon)
            }
            let value = document.createElement("span")
            value.classList.add("value")
            value.innerText = data[key][carNumber][0].toFixed(2) + " %"
            missing_copntainer.appendChild(value)
        })
    }
}

function load_attributes(teams) {
    for (let key in teams) {
        for (let attribute in teams[key]) {
            let team = document.querySelector(`#teamsDiv .team-performance[data-teamid='${key}']`);
            let bar = team.querySelector(`.performance-bar-progress`);
            let attributeValue = teams[key][attribute];
            bar.dataset[attribute] = attributeValue.toFixed(3);
        }
    }
}

function load_car_attributes(teams) {
    for (let key in teams) {
        for (let car in teams[key]) {
            let carDiv = document.querySelector(`#carsDiv .car[data-teamid='${key}'][data-carnumber='${car}']`);
            for (let attribute in teams[key][car]) {
                let bar = carDiv.querySelector(`.performance-bar-progress`);
                let attributeValue = teams[key][car][attribute];
                bar.dataset[attribute] = attributeValue.toFixed(3);
            }
        }
    }
}

function order_by(criterion) {
    let teams = document.querySelectorAll(".team-performance");
    let teamsArray = Array.from(teams);
    teamsArray.sort(function (a, b) {
        return b.querySelector(".performance-bar-progress").dataset[criterion] - a.querySelector(".performance-bar-progress").dataset[criterion];
    })
    teamsArray.forEach(function (team, index) {
        document.getElementById("teamsDiv").appendChild(team);
        let bar = team.querySelector(".performance-bar-progress");
        bar.style.width = bar.dataset[criterion] + "%";
        team.querySelector(".team-title-value").innerText = parseFloat(bar.dataset[criterion]).toFixed(2) + " %";
        let number = team.querySelector(".team-number")
        number.innerText = index + 1
    })

    let cars = document.querySelectorAll(".car-performance");
    let carsArray = Array.from(cars);
    carsArray.sort(function (a, b) {
        return b.querySelector(".performance-bar-progress").dataset[criterion] - a.querySelector(".performance-bar-progress").dataset[criterion];
    })
    carsArray.forEach(function (car, index) {
        document.getElementById("carsDiv").appendChild(car);
        let bar = car.querySelector(".performance-bar-progress");
        bar.style.width = bar.dataset[criterion] + "%";
        let number = car.querySelector(".performance-number")
        let value = car.querySelector(".car-missing-parts .value")
        value.innerText = parseFloat(bar.dataset[criterion]).toFixed(2) + " %";
        number.innerText = index + 1
    })



}

document.getElementById("teamsCarsButton").addEventListener("click", function (elem) {
    if (event.target.dataset.value === "teams") {
        event.target.dataset.value = "cars";
        event.target.className = "bi bi-person-fill"
        document.getElementById("teamsDiv").classList.add("d-none");
        document.getElementById("carsDiv").classList.remove("d-none");
    }
    else {
        event.target.dataset.value = "teams";
        event.target.className = "bi bi-people-fill"
        document.getElementById("carsDiv").classList.add("d-none");
        document.getElementById("teamsDiv").classList.remove("d-none");
    }
})


document.querySelector("#attributeMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        order_by(elem.dataset.attribute);
        document.querySelector("#attributeButton").innerText = elem.innerText;
    })
})


/**
 * Pills that manage engines and teams screens and lists
 */
teamsPill.addEventListener("click", function () {
    teamsEngine = "teams"
    document.querySelector("#enginesPerformance").classList.add("d-none")
    document.querySelector("#teamsPerformance").classList.remove("d-none")
    document.querySelector("#carAttributeSelector").classList.remove("d-none")
    removeSelected()
    if (viewingGraph) {
        document.querySelector(".save-button").classList.add("d-none")
    }
    else {
        document.querySelector(".save-button").classList.remove("d-none")
        first_show_animation()
    }
})

enginesPill.addEventListener("click", function () {
    teamsEngine = "engines"
    document.querySelector("#teamsPerformance").classList.add("d-none")
    document.querySelector("#enginesPerformance").classList.remove("d-none")
    document.querySelector("#carAttributeSelector").classList.add("d-none")
    removeSelected()
    document.querySelector(".save-button").classList.remove("d-none")
    first_show_animation()
})

function gather_engines_data() {
    let engines = document.querySelectorAll(".engine-performance")
    let enginesData = {}
    engines.forEach(function (engine) {
        let engineID = engine.dataset.engineid
        let engineStats = {}
        engine.querySelectorAll(".engine-performance-stat").forEach(function (stat) {
            let attribute = stat.dataset.attribute
            let value = stat.querySelector(".custom-input-number").value.split(" ")[0]
            engineStats[attribute] = value
        })
        enginesData[engineID] = engineStats
    })
    return enginesData

}


function update_max_design(data) {
    actualMaxDesign = parseInt(data) + 1;
}

/**
 * Manages the engine stats for all manufacturers
 * @param {Object} engineData engine stats for all manufacturers
 */
function manage_engineStats(engineData) {
    engineData.forEach(function (elem) {
        let engineId = elem[0]
        let engineStats = elem[1];
        let engine = document.querySelector(`[data-engineId="${engineId}"]`);
        for (let key in engineStats) {
            let value = engineStats[key];
            let attribute = engine.querySelector(`.engine-performance-stat[data-attribute="${key}"]`);
            let input = attribute.querySelector(".custom-input-number");
            let bar = attribute.querySelector(".engine-performance-progress");
            input.value = value.toFixed(1) + " %";
            bar.style.width = value + "%";
        }
    })
}


/**
 * removes the team or engine selected anc changes the icon if necesssary
 */
function removeSelected() {
    let elemsSelected = document.querySelectorAll('.selected');
    elemsSelected.forEach(item => {
        item.classList.remove('selected')
    });
}

/**
 * eventListeners for all teams and engines
 */
document.querySelectorAll(".team").forEach(function (elem) {
    elem.addEventListener("click", function () {
        removeSelected()
        manageSaveButton(true, "performance")
        document.querySelector("#performanceGraphButton").classList.remove("active")
        elem.classList.toggle('selected');
        teamSelected = elem.dataset.teamid;
        let teamRequest = {
            command: "performanceRequest",
            teamID: teamSelected,
        }
        socket.send(JSON.stringify(teamRequest))
        document.querySelector("#performanceGraph").classList.add("d-none")
        document.querySelector(".teams-show").classList.remove("d-none")
        document.querySelector(".save-button").classList.remove("d-none")
        first_show_animation()
        viewingGraph = false;
    })
})

document.querySelectorAll(".car").forEach(function (elem) {
    elem.addEventListener("click", function () {
        removeSelected()
        manageSaveButton(true, "performance")
        document.querySelector("#performanceGraphButton").classList.remove("active")
        elem.classList.toggle('selected');
        teamSelected = elem.dataset.teamid;
        let teamRequest = {
            command: "performanceRequest",
            teamID: teamSelected,
        }
        socket.send(JSON.stringify(teamRequest))
        document.querySelector("#performanceGraph").classList.add("d-none")
        document.querySelector(".teams-show").classList.remove("d-none")
        document.querySelector(".save-button").classList.remove("d-none")
        first_show_animation()
        viewingGraph = false;
    })
})

document.querySelectorAll(".engine").forEach(function (elem) {
    elem.addEventListener("click", function () {
        removeSelected()
        elem.classList.toggle('selected');
        engineSelected = elem.dataset.engineid;
        teamEngineSelected = elem.dataset.teamengine
        document.querySelector(".engines-show").classList.remove("d-none")
        resetBarsEngines(elem)
    })
})

function load_parts_stats(data) {
    for (let key in data) {
        if (key !== "engine") {
            let part = document.querySelector(`.part-performance[data-part='${key}']`)
            for (let stat in data[key]) {
                if (stat !== "15") {
                    let stat_input = part.querySelector(`.part-performance-stat[data-attribute='${stat}']`).querySelector(".custom-input-number")
                    if (stat === "7" || stat === "8" || stat === "9") {
                        stat_input.value = data[key][stat].toFixed(2) + " kN"
                    }
                    else {
                        stat_input.value = data[key][stat].toFixed(2) + " %"
                    }
                }
            }
        }
    }
}

function load_parts_list(data) {
    for (let key in data) {
        let list = document.querySelector(`.part-performance[data-part='${key}'] .parts-list`)
        let partLoadouts = document.querySelector(`.part-performance[data-part='${key}']`)
        list.innerHTML = ""
        let index = 1;
        for (let part in data[key]) {
            let partElem = document.createElement("div")
            partElem.classList.add("one-part")
            if (index === 1) {
                partElem.classList.add("one-part-default")
            }
            let partTitle = document.createElement("div")
            partTitle.classList.add("one-part-title")
            let partName = document.createElement("div")
            partName.dataset.designId = data[key][part][0]
            partName.classList.add("one-part-name")
            let partNameText = abreviations_dict[teamSelected] + "-" + pars_abreviations[key] + "-" + index
            partName.innerText = partNameText
            let subtitle = document.querySelector(`.part-performance[data-part='${key}'] .part-subtitle`)
            subtitle.innerText = partNameText
            subtitle.dataset.editing = data[key][part][0]
            partTitle.appendChild(partName)
            add_partName_listener(partName, subtitle)
            let loadoutContainer = document.createElement("div")
            loadoutContainer.classList.add("fitted-icons")
            let n_parts = document.createElement("div")
            n_parts.classList.add("n-parts")
            n_parts.innerText = "x" + data[key][part][6]
            loadoutContainer.appendChild(n_parts)
            add_n_parts_buttons(loadoutContainer)
            let loadout1 = document.createElement("i")
            loadout1.classList.add("bi", "bi-check", "loadout-1")
            loadoutContainer.appendChild(loadout1)
            if (data[key][part][4] === 1) {
                loadout1.classList.add("fitted")
                let number = document.createElement("div")
                number.classList.add("number")
                number.innerText = "1"
                loadout1.appendChild(number)
                partLoadouts.dataset.loadout1 = data[key][part][0]
            }
            loadout_listener(loadout1, "1", partLoadouts)
            let loadout2 = document.createElement("i")
            loadout2.classList.add("bi", "bi-check", "loadout-2")
            loadoutContainer.appendChild(loadout2)
            if (data[key][part][5] === 1) {
                loadout2.classList.add("fitted")
                let number = document.createElement("div")
                number.classList.add("number")
                number.innerText = "2"
                loadout2.appendChild(number)
                partLoadouts.dataset.loadout2 = data[key][part][0]
            }
            loadout_listener(loadout2, "2", partLoadouts)
            partTitle.appendChild(loadoutContainer)
            let posRelative = document.createElement("div")
            posRelative.classList.add("one-part-flag-and-text")
            if (data[key][part][1] !== data[key][part][2]) {
                let flag = document.createElement("img")
                flag.classList.add("one-part-flag")
                let code = data[key][part][3]
                let codeFlag = races_map[code]
                let flagSrc = codes_dict[codeFlag]
                flag.src = flagSrc
                let flagName = document.createElement("div")
                flagName.classList.add("one-part-flag-title")
                flagName.innerText = races_names[code]
                posRelative.appendChild(flag)
                posRelative.appendChild(flagName)
            }
            else {
                posRelative.innerText = "BASE"
            }
            partElem.appendChild(partTitle)
            partElem.appendChild(posRelative)
            partElem.dataset.partid = part
            list.appendChild(partElem)
            if (index === data[key].length) {
                partName.classList.add("editing")
            }
            index++;

        }
        add_new_part_button(list)
        if (list.scrollHeight > list.clientHeight) {
            list.classList.add("list-overflow");
        } else {
            list.classList.remove("list-overflow");
        }
    }
}

function add_new_part_button(list) {
    let new_part_div = document.createElement("div")
    new_part_div.classList.add("new-part")
    let icon = document.createElement("i")
    let generalPart = list.parentNode
    icon.classList.add("bi", "bi-plus-circle")
    icon.textContent = "Add new part"
    new_part_div.appendChild(icon)
    list.appendChild(new_part_div)
    icon.addEventListener("click", function () {
        let previousPart = list.childNodes[list.childNodes.length - 2]
        let previous_name = previousPart.querySelector(".one-part-name").innerText
        let new_name = previous_name.split("-")[0] + "-" + previous_name.split("-")[1] + "-" + (parseInt(previous_name.split("-")[2]) + 1)
        let part = document.createElement("div")
        part.classList.add("one-part")
        let partTitle = document.createElement("div")
        partTitle.classList.add("one-part-title")
        let partName = document.createElement("div")
        partName.dataset.designId = actualMaxDesign
        partName.classList.add("one-part-name")
        partName.innerText = new_name
        let subtitle = list.parentNode.querySelector(`.part-subtitle`)
        subtitle.dataset.editing = "-1"
        actualMaxDesign += 1
        subtitle.innerText = new_name
        partTitle.appendChild(partName)
        let parts = list.querySelectorAll(".one-part")
        parts.forEach(function (part) {
            part.querySelector(".one-part-name").classList.remove("editing")
        })
        add_partName_listener(partName, subtitle, "new")
        let loadoutContainer = document.createElement("div")
        loadoutContainer.classList.add("fitted-icons")
        let n_parts = document.createElement("div")
        n_parts.classList.add("n-parts")
        n_parts.innerText = "x0"
        loadoutContainer.appendChild(n_parts)
        add_n_parts_buttons(loadoutContainer)
        let loadout1 = document.createElement("i")
        loadout1.classList.add("bi", "bi-check", "loadout-1")
        loadoutContainer.appendChild(loadout1)
        loadout_listener(loadout1, "1", generalPart)
        let loadout2 = document.createElement("i")
        loadout2.classList.add("bi", "bi-check", "loadout-2")
        loadoutContainer.appendChild(loadout2)
        loadout_listener(loadout2, "2", generalPart)
        partTitle.appendChild(loadoutContainer)
        part.appendChild(partTitle)
        list.insertBefore(part, new_part_div)
        partName.classList.add("editing")
        new_part_div.remove()
    })
}

function add_n_parts_buttons(loadoutContainer) {
    let buttonsContainer = document.createElement("div")
    buttonsContainer.classList.add("n-parts-buttons")
    let up = document.createElement("i")
    up.classList.add("bi", "bi-chevron-up")
    let down = document.createElement("i")
    down.classList.add("bi", "bi-chevron-down")
    buttonsContainer.appendChild(up)
    buttonsContainer.appendChild(down)
    up.addEventListener("click", function () {
        let n_parts = loadoutContainer.querySelector(".n-parts")
        let n = parseInt(n_parts.innerText.split("x")[1])
        n += 1
        n_parts.innerText = "x" + n
    })
    down.addEventListener("click", function () {
        let fitted_parts = loadoutContainer.parentNode.querySelectorAll(".fitted")
        let fitted_parts_numb = fitted_parts.length
        let n_parts = loadoutContainer.querySelector(".n-parts")
        let n = parseInt(n_parts.innerText.split("x")[1])
        if (n > fitted_parts_numb) {
            n -= 1
            if (n < 0) {
                n = 0
            }
            n_parts.innerText = "x" + n
        }
        else {
            fitted_parts.forEach(function (part) {
                let errorClass = ""
                if (part.classList.contains("loadout-1")) {
                    errorClass = "loadout-1-error";
                }
                else if (part.classList.contains("loadout-2")) {
                    errorClass = "loadout-2-error";
                }
                part.classList.add(errorClass);
                setTimeout(() => {
                    part.classList.remove(errorClass);
                }, 500);
            })
        }
    })
    loadoutContainer.appendChild(buttonsContainer)
}

function load_one_part(data) {
    data = data[0]
    let key = Object.keys(data)[0]
    let part = document.querySelector(`.part-performance[data-part='${key}']`)
    for (let stat in data[key]) {
        if (stat !== "15") {
            let stat_input = part.querySelector(`.part-performance-stat[data-attribute='${stat}']`).querySelector(".custom-input-number")
            if (stat === "7" || stat === "8" || stat === "9") {
                stat_input.value = data[key][stat].toFixed(2) + " kN"
            }
            else {
                stat_input.value = data[key][stat].toFixed(2) + " %"
            }
        }
    }
}

function add_partName_listener(div, subtitle, type = "old") {
    div.addEventListener("click", function () {
        if (type === "new") {
            subtitle.dataset.editing = -1
        }
        else {
            subtitle.dataset.editing = div.dataset.designId
        }
        subtitle.innerText = div.innerText
        let parts = div.parentNode.parentNode.parentNode.querySelectorAll(".one-part")
        parts.forEach(function (part) {
            part.querySelector(".one-part-name").classList.remove("editing")
        })
        div.classList.add("editing")
        if (type === "old") {
            let data = {
                command: "partRequest",
                designID: div.dataset.designId
            }
            socket.send(JSON.stringify(data))
        }
    })
}

function loadout_listener(icon, loadout_n, partTitle) {
    icon.addEventListener("click", function () {
        let part_design = icon.parentNode.parentNode.querySelector(".one-part-name").dataset.designId;
        let n_parts_elem = icon.parentNode.querySelector(".n-parts");
        let n_parts = n_parts_elem.innerText.split("x")[1];
        let parts_fitted = icon.parentNode.parentNode.querySelectorAll(".fitted").length;

        if (parts_fitted < n_parts) {
            partTitle.dataset[`loadout${loadout_n}`] = part_design;
            if (loadout_n === "1") {
                let oldFitted = partTitle.querySelector(".loadout-1.fitted");
                if (oldFitted) {
                    oldFitted.classList.remove("fitted");
                    oldFitted.querySelector(".number").remove();
                }
                icon.classList.toggle("fitted");
                let number = document.createElement("div");
                number.classList.add("number");
                number.innerText = "1";
                icon.appendChild(number);
            } else {
                let oldFitted = partTitle.querySelector(".loadout-2.fitted");
                if (oldFitted) {
                    oldFitted.classList.remove("fitted");
                    oldFitted.querySelector(".number").remove();
                }
                icon.classList.toggle("fitted");
                let number = document.createElement("div");
                number.classList.add("number");
                number.innerText = "2";
                icon.appendChild(number);
            }
        } else {
            n_parts_elem.classList.add("n-parts-error");
            setTimeout(() => {
                n_parts_elem.classList.remove("n-parts-error");
            }, 500);
        }
    });
}
document.querySelector(".fit-button").addEventListener("click", function () {
    let data = {
        command: "fitParts",
        teamID: teamSelected

    }
    socket.send(JSON.stringify(data))
})

document.querySelectorAll(".part-performance-title .bi-caret-down-fill").forEach(function (elem) {
    elem.addEventListener("click", function () {
        elem.classList.toggle("clicked")
        let generalPart = elem.parentNode.parentNode
        elem.parentNode.querySelector(".part-buttons").classList.toggle("d-none")
        if (elem.classList.contains("clicked")) {
            generalPart.querySelector(".part-performance-stats").style.opacity = 0
            generalPart.querySelector(".part-performance-stats").style.height = "0"
            generalPart.querySelector(".part-performance-stats").style.pointerEvents = "none"
        }
        else {
            generalPart.querySelector(".part-performance-stats").style.opacity = 1
            generalPart.querySelector(".part-performance-stats").style.pointerEvents = "auto"
            //wait 0.2s and restore height
            setTimeout(() => {
                generalPart.querySelector(".part-performance-stats").style.height = "auto";
            }, 200);
        }
    })
})

document.querySelector(".performance-show").querySelectorAll(".part-name-buttons .bi-plus-lg").forEach(function (elem) {
    let intervalIds = [];

    elem.addEventListener("mousedown", function () {
        let part = elem.parentNode.parentNode.parentNode.parentNode;
        let inputs = part.querySelectorAll(".custom-input-number");

        inputs.forEach(function (input) {
            let increment;
            if (input.max === "100") {
                increment = 0.5
            }
            else {
                increment = 0.025
            }
            updateValue(input, increment);
            let intervalId = setInterval(() => {
                updateValue(input, increment);
            }, 100);
            intervalIds.push(intervalId);
        });
    });

    elem.addEventListener("mouseup", function () {
        intervalIds.forEach(clearInterval);
        intervalIds = [];
    });

    elem.addEventListener("mouseleave", function () {
        intervalIds.forEach(clearInterval);
        intervalIds = [];
    });
});

document.querySelector(".performance-show").querySelectorAll(".part-name-buttons .bi-dash-lg").forEach(function (elem) {
    let intervalIds = [];

    elem.addEventListener("mousedown", function () {
        let part = elem.parentNode.parentNode.parentNode.parentNode;
        let inputs = part.querySelectorAll(".custom-input-number");

        inputs.forEach(function (input) {
            if (input.max === "100") {
                increment = -0.5
            }
            else {
                increment = -0.025
            }
            updateValue(input, increment);
            let intervalId = setInterval(() => {
                updateValue(input, increment);
            }, 100);
            intervalIds.push(intervalId);
        });
    });

    elem.addEventListener("mouseup", function () {
        intervalIds.forEach(clearInterval);
        intervalIds = [];
    });

    elem.addEventListener("mouseleave", function () {
        intervalIds.forEach(clearInterval);
        intervalIds = [];
    });
});


document.querySelector(".performance-show").querySelectorAll('.stat-number .bi-plus-lg').forEach(button => {
    let intervalId;
    button.addEventListener('mousedown', function () {
        const input = this.previousElementSibling;
        updateValue(input, 0.01);
        intervalId = setInterval(() => {
            updateValue(input, 0.01);
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

document.querySelector(".engines-show").querySelectorAll('.bi-plus-lg').forEach(button => {
    let intervalId;
    let bar = button.parentNode.parentNode.querySelector(".engine-performance-progress");
    button.addEventListener('mousedown', function () {
        const input = this.previousElementSibling;
        updateValue(input, 0.1);
        bar.style.width = input.value.split(' ')[0] + "%";
        intervalId = setInterval(() => {
            updateValue(input, 0.1);
            bar.style.width = input.value.split(' ')[0] + "%";
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

document.querySelector(".performance-show").querySelectorAll('.stat-number .bi-dash-lg').forEach(button => {
    let intervalId;
    button.addEventListener('mousedown', function () {
        const input = this.nextElementSibling;
        updateValue(input, -0.01);
        intervalId = setInterval(() => {
            updateValue(input, -0.01);
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

document.querySelector(".engines-show").querySelectorAll('.bi-dash-lg').forEach(button => {
    let intervalId;
    let bar = button.parentNode.parentNode.querySelector(".engine-performance-progress");
    button.addEventListener('mousedown', function () {
        const input = this.nextElementSibling;
        updateValue(input, -0.1);
        bar.style.width = input.value.split(' ')[0] + "%";
        intervalId = setInterval(() => {
            updateValue(input, -0.1);
            bar.style.width = input.value.split(' ')[0] + "%";
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

document.querySelector(".performance-show").querySelectorAll(".new-or-existing-part div").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let parent = elem.parentNode;
        let options = parent.querySelectorAll("div");
        options.forEach(function (option) {
            option.classList.remove("active-part");
        })
        elem.classList.add("active-part");
        parent.parentNode.parentNode.dataset.new = elem.dataset.new;
    })
})


function updateValue(input, increment) {
    let value = input.value.split(' ')[0];
    let unit = input.value.split(' ')[1];
    value = (parseFloat(value) + increment).toFixed(2);
    if (value > parseFloat(input.max)) {
        value = parseFloat(input.max).toFixed(2);
    }
    if (value < parseFloat(input.min)) {
        value = parseFloat(input.min).toFixed(2);
    }
    input.value = value + ' ' + unit;
}


document.querySelector("#performanceGraphButton").addEventListener("click", function () {
    removeSelected()
    document.querySelector("#performanceGraphButton").classList.toggle("active")
    document.querySelector(".teams-show").classList.add("d-none")
    document.querySelector("#performanceGraph").classList.remove("d-none")
    document.querySelector(".save-button").classList.add("d-none")
    viewingGraph = true;
})

/**
 * Puts the bars of the engine to their appropiate values
 * @param {div} div element of the dom that contains the stats of the engine
 */
function resetBarsEngines(div) {
    let statsString = div.dataset.stats
    var statsArray = statsString.split(' ').map(function (item) {
        return parseFloat(item, 10) / 10;
    });
    document.querySelector(".engines-show").querySelectorAll(".custom-progress").forEach(function (elem, index) {
        elem.dataset.progress = statsArray[index]
        manage_bar(elem, elem.dataset.progress)
    })
}

/**
 * resets all bars to 0
 */
function resetBars() {
    document.querySelectorAll(".custom-progress").forEach(function (elem) {
        elem.dataset.progress = 0
        manage_bar(elem, elem.dataset.progress)
    })
}

// /**
//  * eventListeners for the confirm button for engines and teams
//  */
// document.getElementById("confirmEnginebtn").addEventListener("click", function () {
//     let performanes = "";
//     let progresses = ""
//     document.querySelector(".engines-show").querySelectorAll(".custom-progress").forEach(function (elem) {
//         var dataProgress = elem.dataset.progress;
//         performanes += dataProgress + ' ';
//         progresses += dataProgress * 10 + " "
//     });
//     performanes = performanes.slice(0, -1);
//     progresses = progresses.slice(0, -1);
//     document.querySelector(".selected").dataset.stats = progresses
//     let dataPerformance = {
//         command: "editEngine",
//         engineID: engineSelected,
//         teamEngineID: teamEngineSelected,
//         team: document.querySelector(".selected").dataset.teamname,
//         performanceArray: performanes,
//     }
//     socket.send(JSON.stringify(dataPerformance))
// })



/**
 * Manages the progression of the bars 
 * @param {div} bar bar that is about to be edited
 * @param {int} progress number that determines the progress of the bar 
 */
function manage_bar(bar, progress) {
    if (bar.dataset.type === "engine") {
        let whiteDiv = bar.querySelector(".white-part")
        let newProgress = progress * 10
        let newWidth = 0 + newProgress + "%"
        whiteDiv.style.width = newWidth;
    }
    else {
        let grayDiv = bar.querySelector(".gray-part")
        let greenDiv = bar.querySelector(".green-part")
        if (progress == 0) {
            grayDiv.style.width = "100%"
            greenDiv.style.width = "0%"
            bar.parentNode.querySelector(".performance-data").className = "performance-data bold-font"
        }
        else if (progress > 0) {
            grayDiv.style.width = "100%"
            let newProgress = progress * 10
            let newWidth = 0 + newProgress + "%"
            greenDiv.style.width = newWidth;
            bar.parentNode.querySelector(".performance-data").className = "performance-data bold-font positive"
        }
        else if (progress < 0) {
            greenDiv.style.width = "0%"
            let newProgress = progress * 10
            let newWidth = 100 + newProgress + "%"
            grayDiv.style.width = newWidth;
            bar.parentNode.querySelector(".performance-data").className = "performance-data bold-font negative"
        }
    }

    bar.parentNode.querySelector(".performance-data").innerHTML = progress * 10 + "%"
}

function load_performance_graph(data) {
    let labelsArray = []
    data[1].forEach(function (elem) {
        labelsArray.push(races_names[elem[2]])
    })
    labelsArray.unshift("")
    if (typeof performanceGraph !== 'undefined' && performanceGraph !== null) {
        performanceGraph.destroy();
    }
    createPerformanceChart(labelsArray)
    performanceGraph.update()
    let teamPerformances = {};

    // Inicializar un array vacío para cada equipo
    for (let i = 1; i <= 10; i++) {
        teamPerformances[i] = [];
    }
    teamPerformances[32] = [];
    let minValue = Number.POSITIVE_INFINITY;
    let maxValue = Number.NEGATIVE_INFINITY;
    let first = data[0][0]
    let performances = [first, ...data[0]]
    performances.forEach(race => {
        for (let team in race) {
            let value = race[team];
            teamPerformances[team].push(value);
            if (value < minValue) {
                minValue = value;
            }
            if (value > maxValue) {
                maxValue = value;
            }
        }
    });
    let yAxisMin = minValue - 5;
    let yAxisMax = maxValue + 5;
    for (let team in teamPerformances) {
        let color = colors_dict[team + "0"];
        let data = teamPerformances[team];
        performanceGraph.data.datasets.push({
            label: combined_dict[team],
            data: data,
            borderColor: color,
            backgroundColor: color,
            pointRadius: 0,
            fill: false,
            tension: 0.1,
            pointHitRadius: 7
        });
    }
    performanceGraph.options.scales.y.min = yAxisMin;
    performanceGraph.options.scales.y.max = yAxisMax;
    performanceGraph.update();
}

/**
 * Creates the head to head race chart
 * @param {Array} labelsArray array with all the labels for the races
 */
function createPerformanceChart(labelsArray) {
    const dataD = {
        labels: labelsArray,
    };
    performanceGraph = new Chart(
        document.getElementById('performanceGraph'),
        {
            type: 'line',
            data: dataD,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index'
                },
                scales: {
                    x: {
                        grid: {
                            color: '#292929'
                        },
                        ticks: {
                            color: "#dedde6",
                            font: {
                                family: "Formula1Bold"
                            }
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            color: '#292929'
                        },
                        ticks: {
                            color: "#dedde6",
                            font: {
                                family: "Formula1Bold"
                            }
                        }

                    }
                },
                plugins: {
                    datalabels: {
                        display: false
                    },
                    legend: {
                        labels: {
                            boxHeight: 2,
                            boxWidth: 25,
                            color: "#dedde6",
                            font: {
                                family: "Formula1"
                            }
                        },
                        display: false,
                    },
                    tooltip: {
                        titleFont: {
                            family: 'Formula1Bold',
                            size: 16

                        },
                        bodyFont: {
                            family: 'Formula1',
                            size: 14
                        }
                    }

                }


            }
        }
    );
}