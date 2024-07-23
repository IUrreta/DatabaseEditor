const teamsPill = document.getElementById("teamsPill");
const enginesPill = document.getElementById("enginesPill");

const teamsDiv = document.getElementById("teamsDiv");
const enginesDiv = document.getElementById("enginesDiv");

const divsTeamsArray = [teamsDiv, enginesDiv]


let teamSelected;
let engineSelected;
let teamEngineSelected;
let performanceGraph;
let teamsEngine = "teams"
let viewingGraph = true;

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

                if (performanceBarProgress) {
                    performanceBarProgress.style.width = teams[key] + '%';
                    performanceBarProgress.dataset.overall = teams[key];
                }
            }
        }
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

function order_by(criterion) {
    let teams = document.querySelectorAll(".team-performance");
    let teamsArray = Array.from(teams);
    teamsArray.sort(function (a, b) {
        return b.querySelector(".performance-bar-progress").dataset[criterion] - a.querySelector(".performance-bar-progress").dataset[criterion];
    })
    teamsArray.forEach(function (team) {
        document.getElementById("teamsDiv").appendChild(team);
        let bar = team.querySelector(".performance-bar-progress");
        bar.style.width = bar.dataset[criterion] + "%";
    })
}


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

function gather_engines_data(){
    let engines = document.querySelectorAll(".engine-performance")
    let enginesData = {}
    engines.forEach(function(engine){
        let engineID = engine.dataset.engineid
        let engineStats = {}
        engine.querySelectorAll(".engine-performance-stat").forEach(function(stat){
            let attribute = stat.dataset.attribute
            let value = stat.querySelector(".custom-input-number").value.split(" ")[0]
            engineStats[attribute] = value
        })
        enginesData[engineID] = engineStats
    })
    return enginesData

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
        console.log(engine)
        for (let key in engineStats) {
            let value = engineStats[key];
            let attribute = engine.querySelector(`.engine-performance-stat[data-attribute="${key}"]`);
            console.log(attribute)
            let input = attribute.querySelector(".custom-input-number");
            console.log(input)
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
        document.querySelector(".performance-graph-button").classList.remove("active")
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

document.querySelector(".performance-show").querySelectorAll('.bi-plus-lg').forEach(button => {
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

document.querySelector(".performance-show").querySelectorAll('.bi-dash-lg').forEach(button => {
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


function updateValue(input, increment) {
    let value = input.value.split(' ')[0];
    let unit = input.value.split(' ')[1];
    value = parseFloat(value) + increment;
    input.value = value.toFixed(2) + ' ' + unit;
}


document.querySelector(".performance-graph-button").addEventListener("click", function () {
    removeSelected()
    document.querySelector(".performance-graph-button").classList.toggle("active")
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
            tension: 0.1
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