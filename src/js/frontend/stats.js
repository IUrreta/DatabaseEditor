import { team_dict, mentalityModifiers, teamOrder, mentality_dict } from "./config";
import { insert_space, manageColor, format_name } from "./transfers";


let driverStatTitle = document.getElementById("driverStatsTitle")
export let statPanelShown = 0;
export let typeOverall = "driver";
export let typeEdit;
let oldNum;
let editStatsItems = [];
let timer;
const clearIcon2 = document.querySelector("#filterContainer .bi-x");

export function setStatPanelShown(value) {
    statPanelShown = value;
}

export function setTypeOverall(value) {
    typeOverall = value;
}

export function setTypeEdit(value) {
    typeEdit = value;
}

/**
 * Removes all the staff from their list
 */
export function removeStatsDrivers(staffOnly = false) {
    document.querySelectorAll(".staff-list").forEach(function (elem) {
        if (elem.id === "fulldriverlist" && staffOnly === false) {
            elem.innerHTML = ""
        }
        else if (elem.id !== "fulldriverlist") {
            elem.innerHTML = ""
        }
    })
}

/**
 * Places the drivers that the backend fetched on the driver list
 * @param {Object} driversArray Object with all the drivers that the backend fetched
 */
export function place_drivers_editStats(driversArray) {
    let divPosition;
    driversArray.forEach((driver) => {
        divPosition = "fulldriverlist"

        let newDiv = document.createElement("div");
        let ovrDiv = document.createElement("div");
        let ovrSpan = document.createElement("span");

        newDiv.className = "col normal-driver";
        newDiv.dataset.driverid = driver[1];
        let nameDiv = document.createElement("div");
        nameDiv.className = "name-div-edit-stats"
        newDiv.dataset.teamid = driver[2];
        newDiv.dataset.type = 0;
        let name = driver[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        format_name(driver[0], name, spanName, spanLastName)
        newDiv.dataset.name = insert_space(name[0]) + " " + name.slice(1).join(" ")
        spanLastName.classList.add("bold-font")
        spanLastName.classList.add("surname")
        nameDiv.appendChild(spanName)
        nameDiv.appendChild(spanLastName)
        manageColor(newDiv, spanLastName)
        newDiv.appendChild(nameDiv)
        newDiv.classList.add(team_dict[driver[2]] + "-transparent")
        let statsString = '';

        for (let i = 5; i <= 15; i++) {
            statsString += driver[i] + ' ';
        }
        newDiv.dataset.stats = statsString;

        newDiv.dataset.superLicense = driver["superlicense"]
        newDiv.dataset.age = driver["age"]
        newDiv.dataset.retirement = driver["retirement_age"]
        newDiv.dataset.numWC = driver["wants1"]
        newDiv.dataset.number = driver["driver_number"]
        newDiv.dataset.raceFormula = driver["race_formula"]
        newDiv.dataset.driverCode = driver["driver_code"]
        newDiv.dataset.isRetired = driver[4]
        if (driver["nationality"] !== "") {
            let country_code = driver["nationality"]
            let flag = document.createElement("img")
            flag.className = "name-flag"
            flag.src = `https://flagsapi.com/${country_code}/flat/24.png`
            nameDiv.appendChild(flag)
        }
        if (driver["mentality0"] >= 0) {
            newDiv.dataset.mentality0 = driver["mentality0"]
            newDiv.dataset.mentality1 = driver["mentality1"]
            newDiv.dataset.mentality2 = driver["mentality2"]
            newDiv.dataset.globalMentality = driver["global_mentality"]
        }
        let mentality = driver["global_mentality"]

        newDiv.dataset.marketability = driver["marketability"]
        let ovr = calculateOverall(statsString, "driver")
        ovrSpan.textContent = ovr
        ovrDiv.appendChild(ovrSpan)
        ovrDiv.classList.add("bold-font")
        ovrDiv.classList.add("small-ovr")
        newDiv.appendChild(ovrDiv)
        newDiv.addEventListener('click', () => {
            let elementosClicked = document.querySelectorAll('.clicked');
            elementosClicked.forEach(item => item.classList.remove('clicked'));
            newDiv.classList.toggle('clicked');
            driverStatTitle.value = newDiv.dataset.name
            load_stats(newDiv)
            if (statPanelShown == 0) {
                document.getElementById("editStatsPanel").className = "left-panel-stats"
                statPanelShown = 1
            }
            recalculateOverall()

        });
        document.getElementById(divPosition).appendChild(newDiv)


    })

    document.querySelector("#edit_stats").querySelectorAll(".custom-input-number").forEach(function (elem) {
        elem.addEventListener("change", function () {
            if (elem.value > 100) {
                elem.value = 100;
            }
            recalculateOverall()
        });
    });

    manage_order(0)

}

export function initStatsDrivers() {
    editStatsItems = [...document.querySelectorAll(".normal-driver")].map(el => {
        const first = el.children[0]?.children[0]?.textContent || "";
        const last = el.children[0]?.children[1]?.textContent || "";
        return { el, name: (first + " " + last).toLowerCase() };
    });
}



/**
 * Places the staff that the backend fetched on their respective staff list
 * @param {Object} staffArray Object with all the staff that the backend fetched
 */
export function place_staff_editStats(staffArray) {
    let divPosition;

    staffArray.forEach((staff) => {
        let statsString = '';

        if (staff[3] == 1) {
            divPosition = "fullTechnicalList"
            for (let i = 4; i <= 9; i++) {
                statsString += staff[i] + ' ';
            }
        }
        else if (staff[3] == 2) {
            divPosition = "fullEngineerList"
            for (let i = 4; i <= 6; i++) {
                statsString += staff[i] + ' ';
            }
        }
        else if (staff[3] == 3) {
            divPosition = "fullAeroList"
            for (let i = 4; i <= 11; i++) {
                statsString += staff[i] + ' ';
            }
        }
        else if (staff[3] == 4) {
            divPosition = "fullDirectorList"
            for (let i = 4; i <= 7; i++) {
                statsString += staff[i] + ' ';
            }
        }
        statsString = statsString.slice(0, -1);


        let newDiv = document.createElement("div");
        let ovrDiv = document.createElement("div");
        let ovrSpan = document.createElement("span")


        newDiv.className = "col normal-driver";
        newDiv.dataset.driverid = staff[1];
        newDiv.dataset.type = staff[3];
        let nameDiv = document.createElement("div");
        nameDiv.className = "name-div-edit-stats"
        newDiv.dataset.teamid = staff[2];
        let name = staff[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        format_name(staff[0], name, spanName, spanLastName)
        newDiv.dataset.name = insert_space(name[0]) + " " + name.slice(1).join(" ")
        spanLastName.classList.add("bold-font")
        spanLastName.classList.add("surname")
        nameDiv.appendChild(spanName)
        nameDiv.appendChild(spanLastName)
        manageColor(newDiv, spanLastName)
        newDiv.appendChild(nameDiv)
        newDiv.classList.add(team_dict[staff[2]] + "-transparent")
        newDiv.dataset.stats = statsString;

        newDiv.dataset.age = staff["age"]
        newDiv.dataset.retirement = staff["retirement_age"]
        newDiv.dataset.raceFormula = staff["race_formula"]
        newDiv.dataset.isRetired = staff[4]
        if (staff["nationality"] !== "") {
            let country_code = staff["nationality"]
            let flag = document.createElement("img")
            flag.className = "name-flag"
            flag.src = `https://flagsapi.com/${country_code}/flat/24.png`
            nameDiv.appendChild(flag)
        }
        if (staff["mentality0"] >= 0) {
            newDiv.dataset.mentality0 = staff["mentality0"]
            newDiv.dataset.mentality1 = staff["mentality1"]
            newDiv.dataset.mentality2 = staff["mentality2"]
            newDiv.dataset.globalMentality = staff["global_mentality"]
        }
        let mentality = staff["global_mentality"]
        let ovr = calculateOverall(statsString, "staff")
        ovrSpan.textContent = ovr

        ovrDiv.appendChild(ovrSpan)
        ovrDiv.classList.add("bold-font")
        ovrDiv.classList.add("small-ovr")
        newDiv.appendChild(ovrDiv)
        newDiv.addEventListener('click', () => {
            let elementosClicked = document.querySelectorAll('.clicked');
            elementosClicked.forEach(item => item.classList.remove('clicked'));
            newDiv.classList.toggle('clicked');
            driverStatTitle.value = newDiv.dataset.name
            load_stats(newDiv)
            if (statPanelShown == 0) {
                document.getElementById("editStatsPanel").className = "left-panel-stats"
                statPanelShown = 1
            }
            recalculateOverall()
        });

        document.getElementById(divPosition).appendChild(newDiv)

    })

}

function getMentalityModifier(mentality) {
    let keys = Object.keys(mentalityModifiers).map(Number).sort((a, b) => a - b);

    let nextKey = keys.find(key => key > mentality);

    return nextKey !== undefined ? mentalityModifiers[nextKey] : null;
}

/**
 * changes the overall placed in the overall square
 */
function recalculateOverall() {
    let stats = ""
    document.querySelectorAll(".elegible").forEach(function (elem) {
        stats += elem.value + " "
    })
    stats = stats.slice(0, -1);
    let oldovr = document.getElementById("ovrholder").innerHTML;
    let ovr = calculateOverall(stats, typeOverall);
    if (oldovr > ovr) {
        document.getElementById("ovrholder").innerHTML = ovr;
        document.getElementById("ovrholder").className = "overall-holder bold-font alertNeg";
        setTimeout(() => {
            document.getElementById("ovrholder").className = "overall-holder bold-font"
        }, 150);
    }
    else if (oldovr < ovr) {
        document.getElementById("ovrholder").innerHTML = ovr;
        document.getElementById("ovrholder").className = "overall-holder bold-font alertPos";
        setTimeout(() => {
            document.getElementById("ovrholder").className = "overall-holder bold-font"
        }, 150);
    }

}

/**
 * eventListeenr for the confirm button for the stats
 */


/**
 * Gets the named with a space between name and lastname
 * @param {*} html element with the name bad formatted
 * @returns the name formatted
 */
export function getName(html) {
    let name = ""
    html.querySelectorAll('span').forEach(function (elem) {
        name += elem.innerText + " "
    })

    name = name.slice(0, -1)

    return name;

}

/**
 * Mathematic calculations to get a staff's overall value
 * @param {string} stats all stats spearated by a space between them
 * @param {string} type type of staff
 * @returns the number of his overall value
 */
export function calculateOverall(stats, type) {
    let statsArray = stats.split(" ").map(Number);
    let rating;
    if (type === "driver") {
        let cornering = statsArray[0];
        let braking = statsArray[1];
        let control = statsArray[2];
        let smoothness = statsArray[3];
        let adaptability = statsArray[4];
        let overtaking = statsArray[5];
        let defence = statsArray[6];
        let reactions = statsArray[7];
        let accuracy = statsArray[8];

        rating = (cornering + braking * 0.75 + reactions * 0.5 + control * 0.75 + smoothness * 0.5 + accuracy * 0.75 + adaptability * 0.25 + overtaking * 0.25 + defence * 0.25) / 5;
    }
    else if (type === "staff") {
        let suma = 0;
        for (let i = 0; i < statsArray.length; i++) {
            suma += statsArray[i];
        }
        rating = suma / statsArray.length;
    }
    return Math.round(rating)
}

function updateStat(input, increment) {
    let val = parseInt(input.value) + increment;
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    input.value = val;
    recalculateOverall();
    manage_stat_bar(input, val);
}


document.querySelectorAll(".attirbutes-panel .bi-plus-lg").forEach(button => {
    let intervalId;
    button.addEventListener('mousedown', function () {
        let input = this.parentNode.parentNode.querySelector("input");
        updateStat(input, 1);
        intervalId = setInterval(() => {
            updateStat(input, 1);
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

document.querySelectorAll(".attirbutes-panel .bi-dash-lg").forEach(button => {
    let intervalId;
    button.addEventListener('mousedown', function () {
        let input = this.parentNode.parentNode.querySelector("input");
        updateStat(input, -1);
        intervalId = setInterval(() => {
            updateStat(input, -1);
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

document.querySelectorAll(".age-holder .bi-plus-lg").forEach(function (elem) {
    elem.addEventListener('mousedown', function (event) {
        let intervalId;
        let input = event.target.parentNode.parentNode.querySelector(".age-ret");
        function updateRetirement(increment) {
            let age = parseInt(input.innerText.split(" ")[1]) + increment;

            input.innerText = input.dataset.text + " " + age;
        }
        updateRetirement(1);
        intervalId = setInterval(() => {
            updateRetirement(1);
        }, 100);
        this.addEventListener('mouseup', function () {
            clearInterval(intervalId);
        });
        this.addEventListener('mouseleave', function () {
            clearInterval(intervalId);
        });
    });
});

document.querySelectorAll(".age-holder .bi-dash-lg").forEach(function (elem) {
    elem.addEventListener('mousedown', function (event) {
        let intervalId;
        let input = event.target.parentNode.parentNode.querySelector(".age-ret");
        function updateRetirement(increment) {
            let age = parseInt(input.innerText.split(" ")[1]) + increment;
            input.innerText = input.dataset.text + " " + age;
        }
        updateRetirement(-1);
        intervalId = setInterval(() => {
            updateRetirement(-1);
        }, 100);
        this.addEventListener('mouseup', function () {
            clearInterval(intervalId);
        });
        this.addEventListener('mouseleave', function () {
            clearInterval(intervalId);
        });
    });
});

document.querySelector("#nameFilter").addEventListener("input", function (event) {
    const val = event.target.value;
    clearIcon2.classList.toggle("d-none", val === "");

    clearTimeout(timer);
    timer = setTimeout(() => {
        const q = val.trim().toLowerCase();
        if (!q) { for (const { el } of editStatsItems) el.classList.remove("d-none"); return; }
        for (const { el, name } of editStatsItems) el.classList.toggle("d-none", !name.includes(q));
    }, 150);
})

document.querySelectorAll(".text-filter-container .bi-x").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let input = elem.parentNode.querySelector("input")
        input.value = ""
        elem.classList.add("d-none")
        let event = new Event('input', {
            bubbles: true,
            cancelable: true
        });
        input.dispatchEvent(event);
    })
})

document.querySelector("#filterIcon").addEventListener("click", function () {
    document.getElementById("edit_stats").querySelector(".category-filters").classList.toggle("show")
    document.getElementById("edit_stats").querySelector(".filter-container").classList.toggle("focused")
})

document.getElementById("edit_stats").querySelectorAll(".filter-pills").forEach(function (elem) {
    elem.addEventListener("click", function (event) {
        let isActive = elem.classList.contains('active');

        document.getElementById("edit_stats").querySelectorAll('.filter-pills').forEach(function (el) {
            el.classList.remove('active');
        });

        if (!isActive) {
            elem.classList.add('active');
        }
    })
})

document.querySelector("#F1filter").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            if (parseInt(elem.dataset.raceFormula) === 1) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector("#F2filter").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            if (parseInt(elem.dataset.raceFormula) === 2) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector("#F3filter").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            if (parseInt(elem.dataset.raceFormula) === 3) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector("#freefilter").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            if (parseInt(elem.dataset.raceFormula) === 4) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector(".order-space").querySelectorAll("i").forEach(function (elem) {
    elem.addEventListener("click", function (event) {
        let parent = elem.parentNode
        let state = parent.dataset.state
        let orderNumUp = document.querySelector(".bi-sort-numeric-up-alt")
        let orderNumDown = document.querySelector(".bi-sort-numeric-down")
        parent.dataset.state = (parseInt(state) + 1) % 3
        if (parent.dataset.state == 0) {
            orderNumUp.classList.remove("active")
            orderNumUp.classList.remove("hidden")
            orderNumDown.classList.add("hidden")
        }
        else if (parent.dataset.state == 1) {
            orderNumDown.classList.add("hidden")
            orderNumDown.classList.add("active")
            orderNumUp.classList.add("active")
            orderNumUp.classList.remove("hidden")

        }
        else if (parent.dataset.state == 2) {
            orderNumUp.classList.remove("active")
            orderNumUp.classList.add("hidden")
            orderNumDown.classList.add("active")
            orderNumDown.classList.remove("hidden")
        }
        manage_order(parseInt(parent.dataset.state))
    })
})


/**
 * Adds eventListeners to all the elements of the staff dropdown
 */
export function listenersStaffGroups() {
    document.querySelectorAll('#staffMenu a').forEach(item => {
        item.addEventListener("click", function () {
            const staffButton = document.getElementById('staffDropdown');
            let staffSelected = item.innerHTML
            let staffCode = item.dataset.spacestats
            if (staffCode === "driverStats") {
                typeOverall = "driver"
                typeEdit = "0"
                document.getElementById("driverSpecialAttributes").classList.remove("d-none")
                document.querySelector("#superLicenseSwitch").classList.remove("d-none")
                document.querySelector("#driverCode").classList.remove("d-none")
            }
            else {
                typeOverall = "staff"
                document.getElementById("driverSpecialAttributes").classList.add("d-none")
                document.querySelector("#superLicenseSwitch").classList.add("d-none")
                document.querySelector("#driverCode").classList.add("d-none")
                if (staffCode === "chiefStats") {
                    typeEdit = "1"
                }
                if (staffCode === "engineerStats") {
                    typeEdit = "2"
                }
                if (staffCode === "aeroStats") {
                    typeEdit = "3"
                }
                if (staffCode === "directorStats") {
                    typeEdit = "4"
                }

            }
            staffButton.innerHTML = staffSelected;
            change_elegibles(item.dataset.spacestats)
            document.querySelectorAll(".staff-list").forEach(function (elem) {
                elem.classList.add("d-none")
                if (item.dataset.list == elem.id) {
                    elem.classList.remove("d-none")
                }
            })
            document.querySelector(".left-panel-stats").classList.add("d-none")
            statPanelShown = 0;
        });

    });
    document.getElementById("driverStatsDrop").click()
}

function manage_order(state) {
    let elements = document.querySelectorAll(".normal-driver");
    let array = Array.from(elements);

    // Crear un objeto para almacenar los padres originales
    let parents = {};
    array.forEach(elem => {
        parents[elem.dataset.driverid] = elem.parentNode; // Asumiendo que cada .normal-driver tiene un data-id único
    });

    let sortedArray = array.sort(function (a, b) {
        let ovrA = parseInt(a.children[1].innerText);
        let ovrB = parseInt(b.children[1].innerText);
        let teamA = parseInt(a.dataset.teamid);
        let teamB = parseInt(b.dataset.teamid);

        if (state == 0) {
            if (teamA === 0) return 1;
            if (teamB === 0) return -1;

            let indexA = teamOrder.indexOf(teamA);
            let indexB = teamOrder.indexOf(teamB);

            if (indexA !== indexB) {
                return indexA - indexB;
            }

            return ovrB - ovrA;
        } else if (state == 1) {
            return ovrB - ovrA;
        } else {
            return ovrA - ovrB;
        }
    });

    // Limpiar los contenedores
    document.querySelectorAll(".staff-list").forEach(function (elem) {
        elem.innerHTML = "";
    });

    // Volver a colocar los elementos ordenados en sus padres originales
    sortedArray.forEach(function (elem) {
        let parent = parents[elem.dataset.driverid];
        parent.appendChild(elem);
    });
}



export function manage_stat_bar(element, value) {
    let container = element.parentNode.parentNode.parentNode
    let bar = container.querySelector(".one-stat-progress")
    let percentage = value + "%"
    bar.style.width = percentage
}


/**
 * Loads the stats into the input numbers
 * @param {div} div div of the staff that is about to be edited
 */
function load_stats(div) {
    let statsArray = div.dataset.stats.split(" ").map(Number);

    let inputArray = document.querySelectorAll(".elegible")
    inputArray.forEach(function (input, index) {
        let value = statsArray[index]
        input.value = value
        manage_stat_bar(input, value)
    });
    let actualAge = document.querySelector(".actual-age")
    let retirementAge = document.querySelector(".actual-retirement")
    let numberButton = document.querySelector("#numberButton")
    let numberWC = document.querySelector("#driverNumber1")
    let codeInput = document.querySelector("#driverCode")
    codeInput.value = div.dataset.driverCode
    oldNum = div.dataset.number
    actualAge.innerText = "Age " + div.dataset.age
    retirementAge.innerText = "Ret " + div.dataset.retirement
    numberButton.querySelector(".front-gradient").innerText = div.dataset.number
    if (div.dataset.numWC === "0") {
        numberWC.checked = false
    }
    else {
        numberWC.checked = true
    }
    if (div.dataset.superLicense === "1") {
        document.querySelector("#superLicense").checked = true
    }
    else {
        document.querySelector("#superLicense").checked = false
    }
    if (div.dataset.isRetired === "1") {
        document.querySelector("#retiredInput").checked = true
    }
    else {
        document.querySelector("#retiredInput").checked = false
    }
    if (div.dataset.mentality0) {
        for (let i = 0; i < 3; i++) {
            let mentality = div.dataset["mentality" + i]
            let indicator = document.getElementById("mentality" + i)
            indicator.parentNode.parentNode.classList.remove("d-none")
            indicator.dataset.value = mentality
            let inverted_value = 5 - mentality
            let levels = indicator.querySelectorAll('.mentality-level');
            let mentality_class = mentality_dict[mentality]
            for (let j = 0; j < 5; j++) {
                levels[j].className = "mentality-level"
                if (j <= inverted_value - 1) {
                    levels[j].classList.add(mentality_class)
                }
            }
            let nameEmoji = indicator.parentNode.parentNode.querySelector(".mentality-and-emoji")
            nameEmoji.innerText = capitalizeFirstLetter(mentality_class)
            nameEmoji.className = "mentality-and-emoji"
            nameEmoji.classList.add(mentality_class)
        }
    }
    else {
        for (let i = 0; i < 3; i++) {
            let indicator = document.getElementById("mentality" + i)
            indicator.parentNode.parentNode.classList.add("d-none")
        }
    }
    if (div.dataset.marketability) {
        document.querySelector("#marketability").classList.remove("d-none")
        document.getElementById("marketabilityInput").value = div.dataset.marketability
        document.getElementById("marketabilityBar").style.width = div.dataset.marketability + "%"
    }
    else {
        document.querySelector("#marketability").classList.add("d-none")
    }
}

document.querySelectorAll(".bar-container .bi-chevron-right").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let indicator = elem.parentNode.querySelector(".mentality-level-indicator")
        let value = parseInt(indicator.getAttribute('data-value')) - 1;
        if (value < 0) {
            value = 0
        }
        let inverted_value = 5 - value

        indicator.setAttribute('data-value', value);
        let levels = indicator.querySelectorAll('.mentality-level');
        let mentality_class = mentality_dict[value]
        for (let j = 0; j < 5; j++) {
            levels[j].className = "mentality-level"
            if (j <= inverted_value - 1) {
                levels[j].classList.add(mentality_class)
            }
        }
        let nameEmoji = elem.parentNode.parentNode.querySelector(".mentality-and-emoji")
        nameEmoji.innerText = capitalizeFirstLetter(mentality_class)
        nameEmoji.className = "mentality-and-emoji"
        nameEmoji.classList.add(mentality_class)
    })
})

document.querySelectorAll(".bar-container .bi-chevron-left").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let indicator = elem.parentNode.querySelector(".mentality-level-indicator")
        let value = parseInt(indicator.getAttribute('data-value')) + 1;
        if (value > 4) {
            value = 4
        }
        let inverted_value = 5 - value
        indicator.setAttribute('data-value', value);
        let levels = indicator.querySelectorAll('.mentality-level');
        let mentality_class = mentality_dict[value]
        for (let j = 0; j < 5; j++) {
            levels[j].className = "mentality-level"
            if (j <= inverted_value - 1) {
                levels[j].classList.add(mentality_class)
            }
        }
        let nameEmoji = elem.parentNode.parentNode.querySelector(".mentality-and-emoji")
        nameEmoji.innerText = capitalizeFirstLetter(mentality_class)
        nameEmoji.className = "mentality-and-emoji"
        nameEmoji.classList.add(mentality_class)
    })
})

function capitalizeFirstLetter(str) {
    if (!str) return str; // Manejo de cadena vacía
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


/**
 * Generates the name title on the main panel of the edit stats
 * @param {div} html div from the staff selected
 * @returns the html necessary to put in the name with correct color
 */
function manage_stats_title(html) {
    let colorClass = ""
    if (html.dataset.teamid != 0) {
        colorClass = team_dict[html.dataset.teamid] + "font"
    }
    let spanName = document.createElement("span")
    let spanLastName = document.createElement("span")
    let name = "<span>" + html.children[0].children[0].innerText + " </span>" + "<span class='" + colorClass + "'>" + html.children[0].children[1].innerText + "</span>"

    //let name = html.substring(0,html.length - 2).trim();

    return name;

}

/**
 * Changes the input number that are taken into account to change stats 
 * @param {div} divID div that contains the correct input numbers  
 */
export function change_elegibles(divID) {
    document.querySelectorAll(".elegible").forEach(function (elem) {
        elem.classList.remove("elegible")

    })
    let divStats = document.getElementById(divID)
    divStats.querySelectorAll(".custom-input-number").forEach(function (elem) {
        elem.classList.add("elegible")
    })
    if (divID === "driverStats") {
        document.getElementById("growthInput").classList.add("elegible")
        document.getElementById("agressionInput").classList.add("elegible")

    }
    document.querySelectorAll(".main-panel-stats").forEach(function (elem) {
        elem.className = "main-panel-stats d-none"
    })
    divStats.classList.remove("d-none")

}