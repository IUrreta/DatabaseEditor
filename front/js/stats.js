const { stat } = require("original-fs");

let driverStatTitle = document.getElementById("driverStatsTitle")
let statPanelShown = 0;
let typeOverall = "driver";
let typeEdit;
let mentality_dict = {0:"enthusiastic", 1:"positive", 2:"neutral", 3:"negative", 4:"demoralized"}

/**
 * Removes all the staff from their list
 */
function removeStatsDrivers() {
    document.querySelectorAll(".staff-list").forEach(function(elem){
        elem.innerHTML = ""
    })
}

/**
 * Places the drivers that the backend fetched on the driver list
 * @param {Object} driversArray Object with all the drivers that the backend fetched
 */
function place_drivers_editStats(driversArray) {
    let divPosition;
    driversArray.forEach((driver) => {
        divPosition = "fulldriverlist"

        let newDiv = document.createElement("div");
        let ovrDiv = document.createElement("div");

        newDiv.className = "col normal-driver";
        newDiv.dataset.driverid = driver[1];
        let nameDiv = document.createElement("div");
        newDiv.dataset.teamid = driver[2];
        let name = driver[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        spanName.textContent = name[0] + " "
        spanLastName.textContent = " "+ name[1].toUpperCase()
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
        newDiv.addEventListener('click',() => {
            let elementosClicked = document.querySelectorAll('.clicked');
            elementosClicked.forEach(item => item.classList.remove('clicked'));
            newDiv.classList.toggle('clicked');
            driverStatTitle.innerHTML = manage_stats_title(newDiv);
            load_stats(newDiv)
            if (statPanelShown == 0) {
                document.getElementById("editStatsPanel").className = "left-panel-stats"
                statPanelShown = 1
            }

            recalculateOverall()

        });
        if (game_version === 2024 && driver.length > 20){
            newDiv.dataset.age = driver[driver.length - 4]
            newDiv.dataset.retirement = driver[driver.length - 5]
            newDiv.dataset.numWC = driver[driver.length - 6]
            newDiv.dataset.number = driver[driver.length - 7]
            newDiv.dataset.mentality0 = driver[driver.length - 3]
            newDiv.dataset.mentality1 = driver[driver.length - 2]
            newDiv.dataset.mentality2 = driver[driver.length - 1]
        }
        else{
            newDiv.dataset.age = driver[driver.length - 1]
            newDiv.dataset.retirement = driver[driver.length - 2]
            newDiv.dataset.numWC = driver[driver.length - 3]
            newDiv.dataset.number = driver[driver.length - 4]
        }

        ovr = calculateOverall(statsString, "driver")
        ovrDiv.innerHTML = ovr
        ovrDiv.classList.add("bold-font")
        ovrDiv.classList.add("small-ovr")
        newDiv.appendChild(ovrDiv)
        document.getElementById(divPosition).appendChild(newDiv)


    })

    document.querySelector("#edit_stats").querySelectorAll(".custom-input-number").forEach(function (elem) {
        elem.addEventListener("change",function () {
            if (elem.value > 99) {
                elem.value = 99;
            }
            recalculateOverall()
        });
    });
}

/**
 * Places the staff that the backend fetched on their respective staff list
 * @param {Object} staffArray Object with all the staff that the backend fetched
 */
function place_staff(staffArray) {
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
        statsString = statsString.slice(0,-1);


        let newDiv = document.createElement("div");
        let ovrDiv = document.createElement("div");

        newDiv.className = "col normal-driver";
        newDiv.dataset.driverid = staff[1];
        let nameDiv = document.createElement("div");
        newDiv.dataset.teamid = staff[2];
        let name = staff[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        spanName.textContent = name[0] + " "
        spanLastName.textContent = " "+ name[1].toUpperCase()
        spanLastName.classList.add("bold-font")
        spanLastName.classList.add("surname")
        nameDiv.appendChild(spanName)
        nameDiv.appendChild(spanLastName)
        manageColor(newDiv, spanLastName)
        newDiv.appendChild(nameDiv)
        newDiv.classList.add(team_dict[staff[2]] + "-transparent")
        newDiv.dataset.stats = statsString;
        newDiv.addEventListener('click',() => {
            let elementosClicked = document.querySelectorAll('.clicked');
            elementosClicked.forEach(item => item.classList.remove('clicked'));
            newDiv.classList.toggle('clicked');
            driverStatTitle.innerHTML = manage_stats_title(newDiv);
            load_stats(newDiv)
            if (statPanelShown == 0) {
                document.getElementById("editStatsPanel").className = "left-panel-stats"
                statPanelShown = 1
            }

            recalculateOverall()

        });
        if (game_version === 2024 && staff[staff.length - 1] !== -1){
            newDiv.dataset.age = staff[staff.length - 4]
            newDiv.dataset.retirement = staff[staff.length - 5]
            newDiv.dataset.mentality0 = staff[staff.length - 3]
            newDiv.dataset.mentality1 = staff[staff.length - 2]
            newDiv.dataset.mentality2 = staff[staff.length - 1]
        }
        else{
            newDiv.dataset.age = staff[staff.length - 2]
            newDiv.dataset.retirement = staff[staff.length - 3]
        }
        ovr = calculateOverall(statsString, "staff")
        ovrDiv.innerHTML = ovr
        ovrDiv.classList.add("bold-font")
        ovrDiv.classList.add("small-ovr")
        newDiv.appendChild(ovrDiv)
        document.getElementById(divPosition).appendChild(newDiv)

    })

}

/**
 * changes the overall placed in the overall square
 */
function recalculateOverall() {
    let stats = ""
    document.querySelectorAll(".elegible").forEach(function (elem) {
        stats += elem.value + " "
    })
    stats = stats.slice(0,-1);
    let oldovr = document.getElementById("ovrholder").innerHTML;
    let ovr = calculateOverall(stats, typeOverall);
    if (oldovr > ovr) {
        document.getElementById("ovrholder").innerHTML = ovr;
        document.getElementById("ovrholder").className = "overall-holder bold-font alertNeg";
        setTimeout(() => {
            document.getElementById("ovrholder").className = "overall-holder bold-font"
        },300);
    }
    else if(oldovr < ovr){
        document.getElementById("ovrholder").innerHTML = ovr;
        document.getElementById("ovrholder").className = "overall-holder bold-font alertPos";
        setTimeout(() => {
            document.getElementById("ovrholder").className = "overall-holder bold-font"
        },300);
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
function getName(html) {
    let name = ""
    html.querySelectorAll('span').forEach(function(elem){
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
function calculateOverall(stats, type) {
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
    else if(type === "staff"){
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
    if (val > 99) val = 99;
    if (val < 0) val = 0;
    input.value = val;
    recalculateOverall();
    manage_stat_bar(input, val);
}

function listeners_plusLess(){
    document.querySelectorAll("#editStatsPanel .bi-plus-lg").forEach(button => {
        let intervalId;
        button.addEventListener('mousedown', function() {
            let input = this.parentNode.parentNode.querySelector("input");
            updateStat(input, 1);
            intervalId = setInterval(() => {
                updateStat(input, 1);
            }, 100);
        });

        button.addEventListener('mouseup', function() {
            clearInterval(intervalId);
        });

        button.addEventListener('mouseleave', function() {
            clearInterval(intervalId);
        });
    });

    document.querySelectorAll("#editStatsPanel .bi-dash-lg").forEach(button => {
        let intervalId;
        button.addEventListener('mousedown', function() {
            let input = this.parentNode.parentNode.querySelector("input");
            updateStat(input, -1);
            intervalId = setInterval(() => {
                updateStat(input, -1);
            }, 100);
        });

        button.addEventListener('mouseup', function() {
            clearInterval(intervalId);
        });

        button.addEventListener('mouseleave', function() {
            clearInterval(intervalId);
        });
    });

    document.querySelector(".retirement-buttons .bi-plus-lg").addEventListener('mousedown', function() {
        let intervalId;
        let retirement = document.querySelector(".actual-retirement");
        function updateRetirement(increment) {
            let age = parseInt(retirement.innerText.split(" ")[1]) + increment;
            retirement.innerText = "Ret " + age;
        }
        updateRetirement(1);
        intervalId = setInterval(() => {
            updateRetirement(1);
        }, 100);
        this.addEventListener('mouseup', function() {
            clearInterval(intervalId);
        });
        this.addEventListener('mouseleave', function() {
            clearInterval(intervalId);
        });
    });

    document.querySelector(".retirement-buttons .bi-dash-lg").addEventListener('mousedown', function() {
        let intervalId;
        let retirement = document.querySelector(".actual-retirement");
        function updateRetirement(increment) {
            let age = parseInt(retirement.innerText.split(" ")[1]) + increment;
            retirement.innerText = "Ret " + age;
        }
        updateRetirement(-1);
        intervalId = setInterval(() => {
            updateRetirement(-1);
        }, 100);
        this.addEventListener('mouseup', function() {
            clearInterval(intervalId);
        });
        this.addEventListener('mouseleave', function() {
            clearInterval(intervalId);
        });
    });

    document.querySelector("#nameFilter").addEventListener("input", function(event){
        console.log("change")
        let text = event.target.value
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function(elem){
            let first_name = elem.children[0].children[0].innerText
            let last_name = elem.children[0].children[1].innerText
            let full_name = first_name + " " + last_name
            let minus = full_name.toLowerCase()
            let name = text.toLowerCase()
            if(minus.includes(name)){
                elem.classList.remove("d-none")
            }
            else{
                elem.classList.add("d-none")
            }
        })
    })

    document.querySelector("#filterIcon").addEventListener("click", function(){
        document.querySelector(".category-filters").classList.toggle("show")
        document.querySelector(".filter-container").classList.toggle("focused")
    })

    document.querySelectorAll(".filter-pills").forEach(function(elem){
        elem.addEventListener("click", function(event){
            let isActive = elem.classList.contains('active');

            document.querySelectorAll('.filter-pills').forEach(function(el) {
                el.classList.remove('active');
            });

            if (!isActive) {
                elem.classList.add('active');
            }
        })
    })

    document.querySelector("#F1filter").addEventListener("click", function(event){
        if (!event.target.classList.contains("active")){
            let elements = document.querySelectorAll(".normal-driver")
            elements.forEach(function(elem){
                elem.classList.remove("d-none")
            })
        }
        else{
            let elements = document.querySelectorAll(".normal-driver")
            elements.forEach(function(elem){
                if(parseInt(elem.dataset.teamid) <= 10 && parseInt(elem.dataset.teamid) > 0){
                    elem.classList.remove("d-none")
                }
                else{
                    elem.classList.add("d-none")
                }
            })
        }
    })

    document.querySelector("#F2filter").addEventListener("click", function(event){
        if (!event.target.classList.contains("active")){
            let elements = document.querySelectorAll(".normal-driver")
            elements.forEach(function(elem){
                elem.classList.remove("d-none")
            })
        }
        else{
            let elements = document.querySelectorAll(".normal-driver")
            elements.forEach(function(elem){
                if(parseInt(elem.dataset.teamid) <= 21 && parseInt(elem.dataset.teamid) > 10){
                    elem.classList.remove("d-none")
                }
                else{
                    elem.classList.add("d-none")
                }
            })
        }
    })

    document.querySelector("#F3filter").addEventListener("click", function(event){
        if (!event.target.classList.contains("active")){
            let elements = document.querySelectorAll(".normal-driver")
            elements.forEach(function(elem){
                elem.classList.remove("d-none")
            })
        }
        else{
            let elements = document.querySelectorAll(".normal-driver")
            elements.forEach(function(elem){
                if(parseInt(elem.dataset.teamid) <= 31 && parseInt(elem.dataset.teamid) > 21){
                    elem.classList.remove("d-none")
                }
                else{
                    elem.classList.add("d-none")
                }
            })
        }
    })

    document.querySelector("#freefilter").addEventListener("click", function(event){
        if (!event.target.classList.contains("active")){
            let elements = document.querySelectorAll(".normal-driver")
            elements.forEach(function(elem){
                elem.classList.remove("d-none")
            })
        }
        else{
            let elements = document.querySelectorAll(".normal-driver")
            elements.forEach(function(elem){
                if(parseInt(elem.dataset.teamid) == 0){
                    elem.classList.remove("d-none")
                }
                else{
                    elem.classList.add("d-none")
                }
            })
        }
    })

    document.querySelector(".order-space").querySelectorAll("i").forEach(function(elem){
        console.log(elem)
        elem.addEventListener("click", function(event){
            let parent = elem.parentNode
            let state = parent.dataset.state
            let orderNumUp = document.querySelector(".bi-sort-numeric-up-alt")
            let orderNumDown = document.querySelector(".bi-sort-numeric-down")
            parent.dataset.state = (parseInt(state) + 1) % 3
            console.log("state: " + state)
            if (parent.dataset.state == 0){
                orderNumUp.classList.remove("active")
                orderNumUp.classList.remove("hidden")
                orderNumDown.classList.add("hidden")
            }
            else if (parent.dataset.state == 1){
                orderNumDown.classList.add("hidden")
                orderNumDown.classList.add("active")
                orderNumUp.classList.add("active")
                orderNumUp.classList.remove("hidden")

            }
            else if (parent.dataset.state == 2){
                orderNumUp.classList.remove("active")
                orderNumUp.classList.add("hidden")
                orderNumDown.classList.add("active")
                orderNumDown.classList.remove("hidden")
            }
            manage_order(parseInt(parent.dataset.state))
        })
    })
}

function manage_order(state) {
    let elements = document.querySelectorAll(".normal-driver");
    let array = Array.from(elements);
    
    // Crear un objeto para almacenar los padres originales
    let parents = {};
    array.forEach(elem => {
        parents[elem.dataset.driverid] = elem.parentNode; // Asumiendo que cada .normal-driver tiene un data-id único
    });

    let sortedArray = array.sort(function(a, b) {
        let ovrA = parseInt(a.children[1].innerText);
        let ovrB = parseInt(b.children[1].innerText);
        let teamA = parseInt(a.dataset.teamid);
        let teamB = parseInt(b.dataset.teamid);
        if (state == 0) {
            if (teamA === 0) return 1;
            if (teamB === 0) return -1;
            return teamA - teamB;
        } else if (state == 1) {
            return ovrB - ovrA;
        } else {
            return ovrA - ovrB;
        }
    });

    // Limpiar los contenedores
    document.querySelectorAll(".staff-list").forEach(function(elem) {
        elem.innerHTML = "";
    });

    // Volver a colocar los elementos ordenados en sus padres originales
    sortedArray.forEach(function(elem) {
        let parent = parents[elem.dataset.driverid];
        parent.appendChild(elem);
    });
}



function manage_stat_bar(element, value){
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
    inputArray.forEach(function (input,index) {
        let value = statsArray[index]
        input.value = value
        //get sibling of input
        manage_stat_bar(input, value)
    });
    let actualAge = document.querySelector(".actual-age")
    let retirementAge = document.querySelector(".actual-retirement")
    let numberButton = document.querySelector("#numberButton")
    let numberWC = document.querySelector("#driverNumber1")
    actualAge.innerText = "Age " + div.dataset.age
    retirementAge.innerText = "Ret " + div.dataset.retirement
    numberButton.innerText = div.dataset.number
    console.log(div.dataset.numWC)
    if (div.dataset.numWC === "0"){
        numberWC.checked = false
    }
    else{
        numberWC.checked = true
    }
    if(div.dataset.mentality0){
        for (i = 0; i < 3; i++){
            let mentality = div.dataset["mentality" + i]
            let indicator = document.getElementById("mentality" + i)
            indicator.parentNode.parentNode.classList.remove("d-none")
            indicator.dataset.value = mentality
            let inverted_value = 5 - mentality
            let levels = indicator.querySelectorAll('.mentality-level');
            let mentality_class = mentality_dict[mentality]
            for (j = 0; j < 5; j++){
                levels[j].className = "mentality-level"
                if (j <= inverted_value - 1){
                    levels[j].classList.add(mentality_class)
                }
            }
            let nameEmoji = indicator.parentNode.parentNode.querySelector(".mentality-and-emoji")
            nameEmoji.innerText = capitalizeFirstLetter(mentality_class)
            nameEmoji.className = "mentality-and-emoji"
            nameEmoji.classList.add(mentality_class)
        }
    }
    else{
        for (i = 0; i < 3; i++){
            let indicator = document.getElementById("mentality" + i)
            indicator.parentNode.parentNode.classList.add("d-none")
        }
    }
}

document.querySelectorAll(".bar-container .bi-chevron-right").forEach(function(elem){
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
        console.log(value)
        for (j = 0; j < 5; j++){
            levels[j].className = "mentality-level"
            if (j <= inverted_value - 1){
                levels[j].classList.add(mentality_class)
            }
        }
        let nameEmoji = elem.parentNode.parentNode.querySelector(".mentality-and-emoji")
        nameEmoji.innerText = capitalizeFirstLetter(mentality_class)
        nameEmoji.className = "mentality-and-emoji"
        nameEmoji.classList.add(mentality_class)
    })
})

document.querySelectorAll(".bar-container .bi-chevron-left").forEach(function(elem){
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
        for (j = 0; j < 5; j++){
            levels[j].className = "mentality-level"
            if (j <= inverted_value - 1){
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
    let colorClass =""
    if(html.dataset.teamid != 0){
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
function change_elegibles(divID) {
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