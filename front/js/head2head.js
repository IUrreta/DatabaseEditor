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
let graph;
let compData;

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
        document.getElementById("bestrh2h").querySelectorAll("i").forEach(function(elem){
            elem.classList.remove("d-none")
        })
    }
    else{
        document.getElementById("bestrh2h").querySelector(".name-H2H").style.justifyContent  = "center"
        document.getElementById("bestrh2h").querySelectorAll("i").forEach(function(elem){
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

function fill_bars(elem, d1_width, d2_width){
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

function toggle_sprints(){
    let elem = document.querySelector("#bestrh2h")
    if(sprints){
        elem.querySelector(".only-name").textContent = "SPRINT WINS"
        relValue = (100 / (compData[9][0] + compData[9][1])).toFixed(2)
        d1_width = compData[9][0] * relValue
        d2_width = compData[9][1] * relValue
        elem.querySelector(".driver1-number").textContent = compData[9][0]
        elem.querySelector(".driver2-number").textContent = compData[9][1]
    }
    else{
        if(wins){
            elem.querySelector(".only-name").textContent = "WINS"
            relValue = (100 / (compData[4][0] + compData[4][1])).toFixed(2)
            d1_width = compData[4][0] * relValue
            d2_width = compData[4][1] * relValue
            elem.querySelector(".driver1-number").textContent = compData[4][0]
            elem.querySelector(".driver2-number").textContent = compData[4][1]
        }
        else{
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

function sprintsListeners(){
    document.querySelector("#bestrh2h").querySelectorAll("i").forEach(function(elem){
        elem.removeEventListener('evento', change_sprintView);
        elem.addEventListener("click", change_sprintView)
    })
}

function change_sprintView(){
    sprints = !sprints
    toggle_sprints()
}

/**
 * Loads all the drivers into the menus of driver selection
 * @param {Object} drivers object with all the driver info
 */
function load_drivers_h2h(drivers) {
    let driver1Menu = document.querySelector("#d1Menu")
    driver1Menu.innerHTML = ""
    let driver2Menu = document.querySelector("#d2Menu")
    driver2Menu.innerHTML = ""
    drivers.forEach(function (elem) {
        let nameDiv = document.createElement("div");
        let name = elem[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        spanName.textContent = name[0] + " "
        spanLastName.textContent = " " + name[1].toUpperCase()
        spanLastName.classList.add("bold-font")
        spanLastName.dataset.teamid = elem[2]
        let a = document.createElement("a");
        a.dataset.driverid = elem[1]
        nameDiv.appendChild(spanName)
        nameDiv.appendChild(spanLastName)
        a.appendChild(nameDiv)
        a.classList = "dropdown-item"
        a.classList.add(team_dict[elem[2]] + "border-down")
        a.style.cursor = "pointer"
        let a2 = a.cloneNode(true)
        driver1Menu.appendChild(a2);
        driver2Menu.appendChild(a);
        listeners_h2h(a, a2)
    })
}

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
        document.querySelector(".driver1-first").textContent = driver1Sel.firstChild.children[0].innerText
        document.querySelector(".driver1-second").textContent = driver1Sel.firstChild.children[1].innerText
        document.querySelector(".driver1-second").dataset.teamid = driver1Sel.firstChild.children[1].dataset.teamid
        d1_team = driver1Sel.firstChild.children[1].dataset.teamid
        document.querySelector(".driver1-second").className = "driver1-second bold-font"
        let newName = aDriver1.firstChild.cloneNode(true)
        document.querySelector("#driver1Button").innerHTML = ""
        document.querySelector("#driver1Button").appendChild(newName)
        manageColor(document.querySelector(".driver1-second"), document.querySelector(".driver1-second"))
        if (driver1_selected && driver2_selected) {
            document.querySelector("#mainH2h").classList.remove("d-none")
            let data = {
                command: "H2HConfigured",
                d1: driver1Sel.dataset.driverid,
                d2: driver2Sel.dataset.driverid,
                year: document.querySelector("#yearButtonH2H").textContent
            }

            socket.send(JSON.stringify(data))
        }
    })
    aDriver2.addEventListener("click", function () {
        if (!driver2_selected) {
            driver2_selected = true
        }
        driver2Sel = aDriver2
        document.querySelector(".driver2-first").textContent = driver2Sel.firstChild.children[0].innerText
        document.querySelector(".driver2-second").textContent = driver2Sel.firstChild.children[1].innerText
        document.querySelector(".driver2-second").dataset.teamid = driver2Sel.firstChild.children[1].dataset.teamid
        document.querySelector(".driver2-second").className = "driver2-second bold-font"
        let newName2 = aDriver2.firstChild.cloneNode(true)
        document.querySelector("#driver2Button").innerHTML = ""
        document.querySelector("#driver2Button").appendChild(newName2)
        d2_team = driver2Sel.firstChild.children[1].dataset.teamid
        manageColor(document.querySelector(".driver2-second"), document.querySelector(".driver2-second"))
        if (driver1_selected && driver2_selected) {
            document.querySelector("#mainH2h").classList.remove("d-none")
            let data = {
                command: "H2HConfigured",
                d1: driver1Sel.dataset.driverid,
                d2: driver2Sel.dataset.driverid,
                year: document.querySelector("#yearButtonH2H").textContent
            }

            socket.send(JSON.stringify(data))
        }
    })
}

function resetH2H(){
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
function load_h2h_graph(data) {
    var labels = [];
    let d1_res = [];
    let d2_res = [];
    let d1_races = [];
    let d1_provisonal = [];
    let d2_races = [];
    let d2_provisonal = [];
    
    data[1].slice(3).forEach(function (elem) {
        d1_races.push(elem[0])
        d1_provisonal.push(elem[1])
    })

    data[2].slice(3).forEach(function (elem) {
        d2_races.push(elem[0])
        d2_provisonal.push(elem[1])
    })


    data[0].forEach(function (elem) {
        labels.push(races_names[elem[1]])
        let index1 = d1_races.indexOf(elem[0])
        let index2 = d2_races.indexOf(elem[0])
        if(index1 !== -1){
            if(d1_provisonal[index1] === -1){
                d1_res.push(NaN)
            }
            else{
                d1_res.push(d1_provisonal[index1])
            }
            
        }
        else{
            d1_res.push(NaN)
        }
        if(index2 !== -1){
            if(d2_provisonal[index2] === -1){
                d2_res.push(NaN)
            }
            else{
                d2_res.push(d2_provisonal[index2])
            }
        }
        else{
            d2_res.push(NaN)
        }
    })

    let d1_color = colors_dict[data[1][1] + "0"]
    let d2_color;
    if (data[1][1] === data[2][1]) {
        d2_color = colors_dict[data[2][1] + "1"]
    }
    else {
        d2_color = colors_dict[data[2][1] + "0"]
    }
    if (typeof graph !== 'undefined' && graph !== null) {
        graph.destroy();
    }
    createChart(labels, d1_res, d2_res, d1_color, d2_color, data[1][0], data[2][0])

}

/**
 * Creates the head to head chart
 * @param {Array} labelsArray array with all the labels for the races
 * @param {Array} d1Results array with all the driver 1 results
 * @param {Array} d2Results array with all the driver 2 results
 * @param {string} d1_color color for the driver 1 line
 * @param {string} d2_color color for the driver 2 line
 * @param {string} d1_name name of the first driver
 * @param {string} d2_name name of the second driver
 */
function createChart(labelsArray, d1Results, d2Results, d1_color, d2_color, d1_name, d2_name) {
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
    graph = new Chart(
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
                        afterDataLimits: (scale) => {
                            scale.max = 20;
                            scale.min = 0.5;
                          },
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
                plugins:{
                    legend: {
                        labels: {
                            usePointStyle: true,
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