let driverStatTitle = document.getElementById("driverStatsTitle")
let statPanelShown = 0;
let typeOverall = "driver";
let typeEdit;

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
        ovr = calculateOverall(statsString, "driver")
        ovrDiv.innerHTML = ovr
        ovrDiv.classList.add("bold-font")
        newDiv.appendChild(ovrDiv)
        document.getElementById(divPosition).appendChild(newDiv)


    })

    document.querySelector("#edit_stats").querySelectorAll(".custom-input-number").forEach(function (elem) {
        elem.addEventListener("change",function () {
            document.getElementById("confirmbtn").className = "btn custom-confirm"
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
        newDiv.dataset.staffid = staff[1];
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
        ovr = calculateOverall(statsString, "staff")
        ovrDiv.innerHTML = ovr
        ovrDiv.classList.add("bold-font")
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
        },400);
    }
    else if(oldovr < ovr){
        document.getElementById("ovrholder").innerHTML = ovr;
        document.getElementById("ovrholder").className = "overall-holder bold-font alertPos";
        setTimeout(() => {
            document.getElementById("ovrholder").className = "overall-holder bold-font"
        },400);
    }

}

/**
 * eventListeenr for the confirm button for the stats
 */
document.getElementById("confirmbtn").addEventListener("click",function () {
    let stats = ""
    document.querySelectorAll(".elegible").forEach(function (elem) {
        stats += elem.value + " "
    })
    stats = stats.slice(0,-1);

    let id;
    if(document.querySelector(".clicked").dataset.driverid){
        id = document.querySelector(".clicked").dataset.driverid
    }
    else{
        id = document.querySelector(".clicked").dataset.staffid
    }
    let driverName = getName(document.querySelector(".clicked"))
    document.querySelector(".clicked").dataset.stats = stats
    let new_ovr = calculateOverall(stats, typeOverall)
    document.querySelector(".clicked").childNodes[1].innerHTML = new_ovr

    let dataStats = {
        command: "editStats",
        driverID: id,
        driver: driverName,
        statsArray: stats,
        typeStaff: typeEdit
    }

    socket.send(JSON.stringify(dataStats))

})

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

function listeners_plusLess(){
    document.querySelector("#edit_stats").querySelectorAll(".bi-plus-lg").forEach(function(elem){
        elem.addEventListener("mousedown", function(){
            let input = elem.parentNode.parentNode.querySelector("input")
            let val = parseInt(input.value) + 1;
            if (val >= 99){
                val = 99
            }
            input.value = val
            recalculateOverall()
        })

    })
    document.querySelector("#edit_stats").querySelectorAll(".bi-dash-lg").forEach(function(elem){
        elem.addEventListener("mousedown", function(){
            let input = elem.parentNode.parentNode.querySelector("input")
            let val = parseInt(input.value) - 1;
            if (val <= 0){
                val = 0
            }
            input.value = val
            recalculateOverall()
        })
    })
}

/**
 * Loads the stats into the input numbers
 * @param {div} div div of the staff that is about to be edited
 */
function load_stats(div) {
    let statsArray = div.dataset.stats.split(" ").map(Number);

    let inputArray = document.querySelectorAll(".elegible")
    inputArray.forEach(function (input,index) {
        inputArray[index].value = statsArray[index]
    });
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