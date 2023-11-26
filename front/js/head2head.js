let driver1_selected = false;
let driver2_selected = false;
let driver1Sel;
let driver2Sel;
let pos_dict = { 1: "1st", 2: "2nd", 3: "3rd" }
let d1_team
let d2_team
let wins = false;
let poles = false;
let sprints = false;
let colors_dict = { "10": "#F91536", "11": "#f1f1f1", "20": "#F58020", "21": "#47c7fc", "30": "#3671C6", "31": "#ffd300", "40": "#6CD3BF", "41": "#fcfcfc", "50": "#2293D1", "51": "#fd48c7", "60": "#37BEDD", "61": "#f1f1f1", "70": "#B6BABD", "71": "#f62039", "80": "#5E8FAA", "81": "#f1f1f1", "90": "#C92D4B", "91": "#f1f1f1", "100": "#358C75", "101": "#c3dc00" }
let driverGraph;
let pointsGraph;
let qualiGraph;
let compData;
let annotationsToggle = true;
let h2hCount = 0;

const lightColors = ["#f1f1f1", "#47c7fc", "#ffd300", "#6CD3BF", "#fcfcfc", "#37BEDD",  "#B6BABD", "#c3dc00"]

Chart.register(ChartDataLabels);


/**
 * Puts the bars of the head to head with the correct width for the drivers selected
 * @param {object} data object with all the info of the comparision between both drivers
 */
function manage_h2h_bars(data) {
    let relValue
    let d1_width
    let d2_width
    compData = data
    if (data[7].some(elem => elem >= 2)) {
        data[4] = data[7]
        document.getElementById("bestrh2h").querySelector(".only-name").textContent = "WINS"
        wins = true
    }
    else {
        document.getElementById("bestrh2h").querySelector(".only-name").textContent = "BEST RACE"
        wins = false
    }
    if (data[8].some(elem => elem >= 2)) {
        data[5] = data[8]
        document.getElementById("bestqh2h").querySelector(".only-name").textContent = "POLES"
        poles = true
    }
    else {
        document.getElementById("bestqh2h").querySelector(".only-name").textContent = "BEST QUALI"
        poles = false
    }
    if (data[9].some(elem => elem >= 1)) {
        document.getElementById("bestrh2h").querySelector(".name-H2H").style.justifyContent = "space-between"
        document.getElementById("bestrh2h").querySelectorAll("i").forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        document.getElementById("bestrh2h").querySelector(".name-H2H").style.justifyContent = "center"
        document.getElementById("bestrh2h").querySelectorAll("i").forEach(function (elem) {
            elem.classList.add("d-none")
        })
    }

    document.querySelectorAll(".one-statH2H").forEach(function (elem, index) {
        if (elem.id === "bestrh2h" || elem.id === "bestqh2h") {
            if (!wins && elem.id === "bestrh2h") {
                d1_width = 100 - (data[index][0] - 1) * 5
                d2_width = 100 - (data[index][1] - 1) * 5
                if (data[index][0] <= 3) {
                    elem.querySelector(".driver1-number").textContent = pos_dict[data[index][0]]
                }
                else {
                    elem.querySelector(".driver1-number").textContent = data[index][0] + "th"
                }
                if (data[index][1] <= 3) {
                    elem.querySelector(".driver2-number").textContent = pos_dict[data[index][1]]
                }
                else {
                    elem.querySelector(".driver2-number").textContent = data[index][1] + "th"
                }
            }
            else if (wins && elem.id === "bestrh2h") {
                relValue = (100 / (data[index][0] + data[index][1])).toFixed(2)
                d1_width = data[index][0] * relValue
                d2_width = data[index][1] * relValue
                elem.querySelector(".driver1-number").textContent = data[index][0]
                elem.querySelector(".driver2-number").textContent = data[index][1]
            }
            if (!poles && elem.id === "bestqh2h") {
                d1_width = 100 - (data[index][0] - 1) * 5
                d2_width = 100 - (data[index][1] - 1) * 5
                if (data[index][0] <= 3) {
                    elem.querySelector(".driver1-number").textContent = pos_dict[data[index][0]]
                }
                else {
                    elem.querySelector(".driver1-number").textContent = data[index][0] + "th"
                }
                if (data[index][1] <= 3) {
                    elem.querySelector(".driver2-number").textContent = pos_dict[data[index][1]]
                }
                else {
                    elem.querySelector(".driver2-number").textContent = data[index][1] + "th"
                }
            }
            else if (poles && elem.id === "bestqh2h") {
                relValue = (100 / (data[index][0] + data[index][1])).toFixed(2)
                d1_width = data[index][0] * relValue
                d2_width = data[index][1] * relValue
                elem.querySelector(".driver1-number").textContent = data[index][0]
                elem.querySelector(".driver2-number").textContent = data[index][1]
            }
        }
        else {
            if (elem.id === "raceh2h" || elem.id === "qualih2h") {
                relValue = (100 / (data[0][0] + data[0][1])).toFixed(2)
            }
            else if (elem.id === "ptsh2h") {
                relValue = 100 / Math.max(data[index][0], data[index][1])
            }
            else if (elem.id === "dnfh2h" || elem.id === "podiumsh2h") {
                relValue = (100 / (data[index][0] + data[index][1])).toFixed(2)
            }
            if (relValue == Infinity) {
                relValue = 0
            }
            d1_width = data[index][0] * relValue
            d2_width = data[index][1] * relValue
            elem.querySelector(".driver1-number").textContent = data[index][0]
            elem.querySelector(".driver2-number").textContent = data[index][1]
        }
        if (d1_width > 100) {
            d1_width = 100
        }
        if (d2_width > 100) {
            d2_width = 100
        }
        fill_bars(elem, d1_width, d2_width)

    })
}
/**
 * Fills the bars for the elem with driver1 and 2 data
 * @param {div} elem general bar for the comparision
 * @param {Number} d1_width driver 1's width for his bar
 * @param {Number} d2_width driver 2's width for his bar
 */
function fill_bars(elem, d1_width, d2_width) {
    elem.querySelector(".driver1-bar").className = "driver1-bar"
    elem.querySelector(".driver2-bar").className = "driver2-bar"
    document.querySelector(".driver1-name").className = "driver1-name"
    document.querySelector(".driver2-name").className = "driver2-name"
    elem.querySelector(".driver1-bar").classList.add(team_dict[d1_team] + "bar-primary")
    document.querySelector(".driver1-name").classList.add(team_dict[d1_team] + "border-primary")
    if (d1_team === d2_team) {
        elem.querySelector(".driver2-bar").classList.add(team_dict[d2_team] + "bar-secondary")
        document.querySelector(".driver2-name").classList.add(team_dict[d2_team] + "border-secondary")
    }
    else {
        elem.querySelector(".driver2-bar").classList.add(team_dict[d2_team] + "bar-primary")
        document.querySelector(".driver2-name").classList.add(team_dict[d2_team] + "border-primary")
    }
    elem.querySelector(".driver1-bar").style.width = d1_width + "%"
    elem.querySelector(".driver2-bar").style.width = d2_width + "%"
}

/**
 * Toggles the sprint wins comparision
 */
function toggle_sprints() {
    let elem = document.querySelector("#bestrh2h")
    if (sprints) {
        elem.querySelector(".only-name").textContent = "SPRINT WINS"
        relValue = (100 / (compData[9][0] + compData[9][1])).toFixed(2)
        d1_width = compData[9][0] * relValue
        d2_width = compData[9][1] * relValue
        elem.querySelector(".driver1-number").textContent = compData[9][0]
        elem.querySelector(".driver2-number").textContent = compData[9][1]
    }
    else {
        if (wins) {
            elem.querySelector(".only-name").textContent = "WINS"
            relValue = (100 / (compData[4][0] + compData[4][1])).toFixed(2)
            d1_width = compData[4][0] * relValue
            d2_width = compData[4][1] * relValue
            elem.querySelector(".driver1-number").textContent = compData[4][0]
            elem.querySelector(".driver2-number").textContent = compData[4][1]
        }
        else {
            elem.querySelector(".only-name").textContent = "BEST RACE"
            d1_width = 100 - (compData[4][0] - 1) * 5
            d2_width = 100 - (compData[4][1] - 1) * 5
            if (compData[4][0] <= 3) {
                elem.querySelector(".driver1-number").textContent = pos_dict[compData[4][0]]
            }
            else {
                elem.querySelector(".driver1-number").textContent = compData[4][0] + "th"
            }
            if (compData[4][1] <= 3) {
                elem.querySelector(".driver2-number").textContent = pos_dict[compData[4][1]]
            }
            else {
                elem.querySelector(".driver2-number").textContent = compData[4][1] + "th"
            }
        }
    }
    fill_bars(elem, d1_width, d2_width)
}

/**
 * Adds listeners for the arrows to change between sprints and races
 */
function sprintsListeners() {
    document.querySelector("#bestrh2h").querySelectorAll("i").forEach(function (elem) {
        elem.removeEventListener('evento', change_sprintView);
        elem.addEventListener("click", change_sprintView)
    })
}

/**
 * Changes the sprint view
 */
function change_sprintView() {
    sprints = !sprints
    toggle_sprints()
}

/**
 * Event listener for the annotatiosn switch
 */
document.getElementById("annotationsToggle").addEventListener("click", function(){
    annotationsToggle = !annotationsToggle
    if (typeof driverGraph !== 'undefined' && driverGraph !== null) {
        driverGraph.options.plugins.annotation.annotations.line1.display = annotationsToggle
        driverGraph.options.plugins.annotation.annotations.line2.display = annotationsToggle
        driverGraph.options.plugins.annotation.annotations.line3.display = annotationsToggle
        driverGraph.options.plugins.annotation.annotations.line4.display = annotationsToggle
        driverGraph.update();
    }
    if (typeof qualiGraph !== 'undefined' && qualiGraph !== null) {
        qualiGraph.options.plugins.annotation.annotations.line1.display = annotationsToggle
        qualiGraph.options.plugins.annotation.annotations.line2.display = annotationsToggle
        qualiGraph.update();
    }

})

/**
 * Checks if both the selected drivers are in the new year's drivers to see if it can update the H2H
 * @param {object} drivers all drivers information
 */
function changeYearH2H(drivers){
    let ids = []
    drivers.forEach(function(elem){
        ids.push(elem[1])
    })
    let d1ID = Number(driver1Sel.dataset.driverid)
    let d2ID = Number(driver2Sel.dataset.driverid)
    let newA1;
    let newA2;
    if(ids.indexOf(d1ID) !== -1 && ids.indexOf(d2ID) !== -1){
        document.querySelector("#d1Menu").querySelectorAll("a").forEach(function(elem){
            if (Number(elem.dataset.driverid) === d1ID){
                newA1 = elem;
            }
        })
        document.querySelector("#d2Menu").querySelectorAll("a").forEach(function(elem){
            if (Number(elem.dataset.driverid) === d2ID){
                newA2 = elem;
            }
        })
        nameTitleD1(newA1)
        nameTitleD2(newA2)
        H2HReady()
    }
    else{
        resetH2H()
    }

}

/**
 * Loads all the drivers into the menus of driver selection
 * @param {Object} drivers object with all the driver info
 */
function load_drivers_h2h(drivers) {
    let dest = document.querySelector(".drivers-modal-zone")

    drivers.forEach(function (driver) {
        let newDiv = document.createElement("div");
        newDiv.className = "col modal-driver";
        newDiv.dataset.driverid = driver[1];
        newDiv.dataset.teamid = driver[2];
        let name = driver[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        spanName.textContent = name[0] + " "
        spanLastName.textContent = " " + name[1].toUpperCase()
        spanLastName.classList.add("bold-font")
        let h2hBut = document.createElement("div")
        h2hBut.innerText = "H2H"
        h2hBut.className = "H2Hradio"
        h2hBut.dataset.state = "unchecked"
        h2hBut.addEventListener("click", function(){
            if(h2hBut.dataset.state === "unchecked" && h2hCount < 2){
                h2hBut.dataset.state = "checked"
                h2hBut.classList.add("activated")
                h2hCount += 1
            }
            else if(h2hBut.dataset.state === "checked"){
                h2hBut.dataset.state = "unchecked"
                h2hBut.classList.remove("activated")
                h2hCount -= 1
            }
        })
        let graphBut = document.createElement("div")
        let graphIcon = document.createElement("i")
        graphIcon.className = "bi bi-graph-up"
        graphBut.appendChild(graphIcon)
        graphBut.className = "GraphButton"
        graphBut.dataset.state = "unchecked"
        graphBut.addEventListener("click", function(){
            if(graphBut.dataset.state === "unchecked"){
                graphBut.dataset.state = "checked"
                graphBut.classList.add("activated")
            }
            else if(graphBut.dataset.state === "checked"){
                graphBut.dataset.state = "unchecked"
                graphBut.classList.remove("activated")

            }
        })
        let nameAndSurName = document.createElement("div")
        let buttons = document.createElement("div")
        buttons.classList = "buttons-drivers-modal"
        nameAndSurName.appendChild(spanName)
        nameAndSurName.appendChild(spanLastName)
        buttons.appendChild(h2hBut)
        buttons.append(graphBut)
        newDiv.appendChild(nameAndSurName)
        newDiv.appendChild(buttons)
        manageColor(newDiv, spanLastName)
        dest.appendChild(newDiv)
    });

    /*
    if(driver1Sel && driver2Sel){
        changeYearH2H(drivers)
    }
    */
    
}

/**
 * Event listeners for the 3 types of graphs
 */
document.querySelector("#pointsProgression").addEventListener("click", function (elem) {
    document.querySelector("#graphTypeButton").innerText = "Points progression"
    document.querySelector("#qualiGraph").classList.add("d-none")
    document.querySelector("#driverGraph").classList.add("d-none")
    document.querySelector("#progressionGraph").classList.remove("d-none")
})

document.querySelector("#raceForm").addEventListener("click", function (elem) {
    document.querySelector("#graphTypeButton").innerText = "Race form"
    document.querySelector("#qualiGraph").classList.add("d-none")
    document.querySelector("#driverGraph").classList.remove("d-none")
    document.querySelector("#progressionGraph").classList.add("d-none")
})

document.querySelector("#qualiForm").addEventListener("click", function (elem) {
    document.querySelector("#graphTypeButton").innerText = "Qualifying form"
    document.querySelector("#qualiGraph").classList.remove("d-none")
    document.querySelector("#driverGraph").classList.add("d-none")
    document.querySelector("#progressionGraph").classList.add("d-none")
})

/**
 * Adds the eventlisteners for all the selectable items in the drivers selection menu
 * @param {a} aDriver2 <a> elem of the driver 2
 * @param {a} aDriver1 <a> elem of the driver 1
 */
function listeners_h2h(aDriver2, aDriver1) {
    aDriver1.addEventListener("click", function () {
        if (!driver1_selected) {
            driver1_selected = true
        }
        driver1Sel = aDriver1
        nameTitleD1(aDriver1)
        if (driver1_selected && driver2_selected) {
            H2HReady()
        }
    })
    aDriver2.addEventListener("click", function () {
        if (!driver2_selected) {
            driver2_selected = true
        }
        nameTitleD2(aDriver2)
        if (driver1_selected && driver2_selected) {
            H2HReady()
        }
    })
}

/**
 * Updates the driver 1 name card with the d1 information stored in aDriver1
 * @param {a} aDriver1 clickable element of the driver 1 dropdown
 */
function nameTitleD1(aDriver1){
    driver1Sel = aDriver1
    document.querySelector(".driver1-first").textContent = driver1Sel.firstChild.children[0].innerText
    document.querySelector(".driver1-second").textContent = driver1Sel.firstChild.children[1].innerText
    document.querySelector(".driver1-second").dataset.teamid = driver1Sel.firstChild.children[1].dataset.teamid
    d1_team = driver1Sel.firstChild.children[1].dataset.teamid
    document.querySelector(".driver1-second").className = "driver1-second bold-font"
    let newName = driver1Sel.firstChild.cloneNode(true)
    document.querySelector("#driver1Button").innerHTML = ""
    document.querySelector("#driver1Button").appendChild(newName)
    manageColor(document.querySelector(".driver1-second"), document.querySelector(".driver1-second"))
}

/**
 * Updates the driver 2 name card with the d1 information stored in aDriver2
 * @param {a} aDriver2 clickable element of the driver 2 dropdown
 */
function nameTitleD2(aDriver2){
    driver2Sel = aDriver2
    document.querySelector(".driver2-first").textContent = driver2Sel.firstChild.children[0].innerText
    document.querySelector(".driver2-second").textContent = driver2Sel.firstChild.children[1].innerText
    document.querySelector(".driver2-second").dataset.teamid = driver2Sel.firstChild.children[1].dataset.teamid
    document.querySelector(".driver2-second").className = "driver2-second bold-font"
    let newName2 = driver2Sel.firstChild.cloneNode(true)
    document.querySelector("#driver2Button").innerHTML = ""
    document.querySelector("#driver2Button").appendChild(newName2)
    d2_team = driver2Sel.firstChild.children[1].dataset.teamid
    manageColor(document.querySelector(".driver2-second"), document.querySelector(".driver2-second"))
}

/**
 * Sends the message that the H2H is properly configured to fetch results
 */
function H2HReady(){
    document.querySelector("#mainH2h").classList.remove("d-none")
    let data = {
        command: "H2HConfigured",
        d1: driver1Sel.dataset.driverid,
        d2: driver2Sel.dataset.driverid,
        year: document.querySelector("#yearButtonH2H").textContent
    }

    socket.send(JSON.stringify(data))
}


/**
 * Resets the H2H comparision
 */
function resetH2H() {
    document.querySelector("#mainH2h").classList.add("d-none")
    document.querySelector("#driver1Button").innerHTML = ""
    document.querySelector("#driver1Button").textContent = "Driver 1"
    document.querySelector("#driver2Button").innerHTML = ""
    document.querySelector("#driver2Button").textContent = "Driver 2"
    driver1_selected = false;
    driver2_selected = false;
    driver1Sel = null;
    driver2Sel = null;
}

/**
 * Prepares the data for the head to head graph
 * @param {object} data object with all the data of races in wich both drivers participated and their results 
 */
function load_h2h_graphs(data) {
    var labels = [];
    let d1_res = [];
    let d2_res = [];
    let d1_races = [];
    let d1_provisonal = [];
    let d2_races = [];
    let d2_provisonal = [];
    let d1_points_provisional = []
    let d2_points_provisional = []
    let d1_points = [0]
    let d2_points = [0]
    let d1_qualis = [];
    let d1_provisonal_q = [];
    let d2_qualis = [];
    let d2_provisonal_q = [];

    data[1].slice(3).forEach(function (elem) {
        d1_races.push(elem[0])
        d1_provisonal.push(elem[1])
        d1_provisonal_q.push(elem[4])
        let ptsThatRace = elem[2];
        if (ptsThatRace === -1) {
            ptsThatRace = 0;
        }
        if (elem.length === 8) {
            d1_points_provisional.push(ptsThatRace + elem[5])
        }
        else {
            d1_points_provisional.push(ptsThatRace)
        }
    })

    data[2].slice(3).forEach(function (elem) {
        d2_races.push(elem[0])
        d2_provisonal.push(elem[1])
        d2_provisonal_q.push(elem[4])
        let ptsThatRace = elem[2];
        if (ptsThatRace === -1) {
            ptsThatRace = 0;
        }
        if (elem.length === 8) {
            d2_points_provisional.push(ptsThatRace + elem[5])
        }
        else {
            d2_points_provisional.push(ptsThatRace)
        }
    })


    data[0].forEach(function (elem) {
        labels.push(races_names[elem[1]])
        let index1 = d1_races.indexOf(elem[0])
        let index2 = d2_races.indexOf(elem[0])
        if (index1 !== -1) {
            if (d1_provisonal[index1] === -1) {
                d1_res.push(NaN)
            }
            else {
                d1_res.push(d1_provisonal[index1])
            }
            d1_points.push(d1_points_provisional[index1] + d1_points[d1_points.length - 1])
            d1_qualis.push(d1_provisonal_q[index1])

        }
        else {
            d1_res.push(NaN)
            d1_qualis.push(NaN)
            if (data[3].indexOf(elem[0]) !== -1) {
                d1_points.push(d1_points[d1_points.length - 1])
            }
            else {
                d1_points.push(NaN)
            }

        }
        if (index2 !== -1) {
            if (d2_provisonal[index2] === -1) {
                d2_res.push(NaN)
            }
            else {
                d2_res.push(d2_provisonal[index2])
            }
            d2_points.push(d2_points_provisional[index2] + d2_points[d2_points.length - 1])
            d2_qualis.push(d2_provisonal_q[index2])
        }
        else {
            d2_res.push(NaN)
            d2_qualis.push(NaN)
            if (data[3].indexOf(elem[0]) !== -1) {
                d2_points.push(d2_points[d2_points.length - 1])
            }
            else {
                d2_points.push(NaN)
            }
        }
    })
    d1_points.shift()
    d2_points.shift()

    let d1_color = colors_dict[data[1][1] + "0"]
    let d2_color;
    if (data[1][1] === data[2][1]) {
        d2_color = colors_dict[data[2][1] + "1"]
    }
    else {
        d2_color = colors_dict[data[2][1] + "0"]
    }
    if (typeof driverGraph !== 'undefined' && driverGraph !== null) {
        driverGraph.destroy();
    }
    if (typeof pointsGraph !== 'undefined' && pointsGraph !== null) {
        pointsGraph.destroy();
    }
    if (typeof qualiGraph !== 'undefined' && qualiGraph !== null) {
        qualiGraph.destroy();
    }
    createRaceChart(labels, d1_res, d2_res, d1_color, d2_color, data[1][0], data[2][0])
    createQualiChart(labels, d1_qualis, d2_qualis, d1_color, d2_color, data[1][0], data[2][0])
    createPointsChart(labels, d1_points, d2_points, d1_color, d2_color, data[1][0], data[2][0])

}

/**
 * Finds tha last non NaN element in an array
 * @param {Array} arr array in which the function will look
 * @returns the indef on which is the last non NaN or -1 if there is none
 */
function findLastNonNaNIndex(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (!isNaN(arr[i])) {
            return i;
        }
    }
    return -1; // Devuelve -1 si todos los valores son NaN
}

/**
 * Creates the head to head race chart
 * @param {Array} labelsArray array with all the labels for the races
 * @param {Array} d1Results array with all the driver 1 results
 * @param {Array} d2Results array with all the driver 2 results
 * @param {string} d1_color color for the driver 1 line
 * @param {string} d2_color color for the driver 2 line
 * @param {string} d1_name name of the first driver
 * @param {string} d2_name name of the second driver
 */
function createRaceChart(labelsArray, d1Results, d2Results, d1_color, d2_color, d1_name, d2_name) {
    const dataD = {
        labels: labelsArray,
        datasets: [
            {
                label: d1_name,
                data: d1Results,
                borderColor: d1_color,
                pointBackgroundColor: d1_color,
                borderWidth: 2,
                fill: false,
            },
            {
                label: d2_name,
                data: d2Results,
                borderColor: d2_color,
                pointBackgroundColor: d2_color,
                borderWidth: 2,
                fill: false,

            },
        ]
    };
    driverGraph = new Chart(
        document.getElementById('driverGraph'),
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
                            color: '#191630'
                        },
                        ticks: {
                            color: "#dedde6",
                            font: {
                                family: "Formula1Bold"
                            }
                        }
                    },
                    y: {
                        reverse: true,
                        min: 1,
                        max: 20,
                        grid: {
                            color: '#191630'
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
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                display: annotationsToggle,
                                yMin: 1,
                                yMax: 1,
                                borderColor: '#FDE06B',
                                borderWidth: 1,
                            },
                            line2: {
                                type: 'line',
                                display: annotationsToggle,
                                yMin: 2,
                                yMax: 2,
                                borderColor: '#AEB2B8',
                                borderWidth: 1,
                            },
                            line3: {
                                type: 'line',
                                display: annotationsToggle,
                                yMin: 3,
                                yMax: 3,
                                borderColor: '#d7985a',
                                borderWidth: 1,
                            },
                            line4: {
                                type: 'line',
                                display: annotationsToggle,
                                yMin: 10,
                                yMax: 10,
                                borderColor: '#dedde6',
                                borderWidth: 1,
                            }
                        }
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

/**
 * Creates the head to head qualifying chart
 * @param {Array} labelsArray array with all the labels for the races
 * @param {Array} d1Quali array with all the driver 1 quali results
 * @param {Array} d2Quali array with all the driver 2 quali results
 * @param {string} d1_color color for the driver 1 line
 * @param {string} d2_color color for the driver 2 line
 * @param {string} d1_name name of the first driver
 * @param {string} d2_name name of the second driver
 */
function createQualiChart(labelsArray, d1Quali, d2Quali, d1_color, d2_color, d1_name, d2_name) {
    const dataD = {
        labels: labelsArray,
        datasets: [
            {
                label: d1_name,
                data: d1Quali,
                borderColor: d1_color,
                pointBackgroundColor: d1_color,
                borderWidth: 2,
                fill: false,
            },
            {
                label: d2_name,
                data: d2Quali,
                borderColor: d2_color,
                pointBackgroundColor: d2_color,
                borderWidth: 2,
                fill: false,

            },
        ]
    };
    qualiGraph = new Chart(
        document.getElementById('qualiGraph'),
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
                            color: '#191630'
                        },
                        ticks: {
                            color: "#dedde6",
                            font: {
                                family: "Formula1Bold"
                            }
                        }
                    },
                    y: {
                        reverse: true,
                        min: 1,
                        max: 20,
                        grid: {
                            color: '#191630'
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
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                display: annotationsToggle,
                                yMin: 15,
                                yMax: 15,
                                borderColor: 'red',
                                borderWidth: 1,
                                label: {
                                    display: true,
                                    color: "white",
                                    backgroundColor: "red",
                                    content: 'Q2',
                                    position: 'start',
                                    font: {
                                        family: "Formula1Bold",
                                        size: 12
                                    }
                                }
                            },
                            line2: {
                                type: 'line',
                                display: annotationsToggle,
                                yMin: 10,
                                yMax: 10,
                                borderColor: 'red',
                                borderWidth: 1,
                                label: {
                                    color: "white",
                                    display: true,
                                    backgroundColor: "red",
                                    content: 'Q3',
                                    position: 'start',
                                    font: {
                                        family: "Formula1Bold",
                                        size: 12
                                    }
                                }
                            }
                        }
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

/**
 * Creates the head to head qualifying chart
 * @param {Array} labelsArray array with all the labels for the races
 * @param {Array} d1Points array with all the driver 1 points
 * @param {Array} d2Points array with all the driver 2 poìnts
 * @param {string} d1_color color for the driver 1 line
 * @param {string} d2_color color for the driver 2 line
 * @param {string} d1_name name of the first driver
 * @param {string} d2_name name of the second driver
 */
function createPointsChart(labelsArray, d1Points, d2Points, d1_color, d2_color, d1_name, d2_name) {
    const dataD = {
        labels: labelsArray,
        datasets: [
            {
                label: d1_name,
                data: d1Points,
                borderColor: d1_color,
                pointBackgroundColor: d1_color,
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                datalabels: {
                    color: function(){
                        if(lightColors.indexOf(d1_color) !== -1){
                            return "#272727"
                        }
                        else{
                            return '#eeeef1'
                        }
                    },
                    backgroundColor: d1_color,
                    display: function(context) {
                        if (context.dataIndex === findLastNonNaNIndex(context.dataset.data)) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    borderRadius: 5,
                    font: {
                        family: "Formula1Bold"
                    }

                },
            },
            {
                label: d2_name,
                data: d2Points,
                borderColor: d2_color,
                pointBackgroundColor: d2_color,
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                datalabels: {
                    color: function(){
                        if(lightColors.indexOf(d2_color) !== -1){
                            return "#272727"
                        }
                        else{
                            return '#eeeef1'
                        }
                    },          
                    backgroundColor: d2_color,
                    display: function(context) {
                        if (context.dataIndex === findLastNonNaNIndex(context.dataset.data)) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    borderRadius: 5,
                    font: {
                        family: "Formula1Bold"
                    }

                },

            },
        ]
    };
    pointsGraph = new Chart(
        document.getElementById('progressionGraph'),
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
                            color: '#191630'
                        },
                        ticks: {
                            color: "#dedde6",
                            font: {
                                family: "Formula1Bold"
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#191630'
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
                    legend: {
                        labels: {
                            boxHeight: 2,
                            boxWidth: 25,
                            color: "#dedde6",
                            font: {
                                family: "Formula1"
                            }
                        },
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