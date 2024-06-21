const teamsPill = document.getElementById("teamsPill");
const enginesPill = document.getElementById("enginesPill");

const teamsDiv = document.getElementById("teamsDiv");
const enginesDiv = document.getElementById("enginesDiv");

const divsTeamsArray = [teamsDiv,enginesDiv]


let teamSelected;
let engineSelected;
let teamEngineSelected;
let performanceGraph;

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
    console.log(teams)
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
    console.log(teams)
    for (let key in teams) {
        for (let attribute in teams[key]) {
            let team = document.querySelector(`#teamsDiv .team-performance[data-teamid='${key}']`);
            let bar = team.querySelector(`.performance-bar-progress`);
            let attributeValue = teams[key][attribute];
            bar.dataset[attribute] = attributeValue.toFixed(3);
        }
    }
}

function order_by(criterion){
    let teams = document.querySelectorAll(".team-performance");
    let teamsArray = Array.from(teams);
    teamsArray.sort(function(a,b){
        return b.querySelector(".performance-bar-progress").dataset[criterion] - a.querySelector(".performance-bar-progress").dataset[criterion];
    })
    teamsArray.forEach(function(team){
        document.getElementById("teamsDiv").appendChild(team);
        let bar = team.querySelector(".performance-bar-progress");
        bar.style.width = bar.dataset[criterion] + "%";
    })
}


document.querySelector("#attributeMenu").querySelectorAll("a").forEach(function(elem){
    elem.addEventListener("click",function(){
        order_by(elem.dataset.attribute);
        document.querySelector("#attributeButton").innerText = elem.innerText;
    })
})
    

/**
 * Pills that manage engines and teams screens and lists
 */
teamsPill.addEventListener("click",function () {
    manageTeamsEngines("show","hide")
    document.querySelector(".engines-show").classList.add("d-none")
    document.querySelector(".teams-show").classList.add("d-none")
    removeSelected()
})

enginesPill.addEventListener("click",function () {
    manageTeamsEngines("hide","show")
    document.querySelector(".teams-show").classList.add("d-none")
    document.querySelector(".engines-show").classList.add("d-none")
    removeSelected()
})

/**
 * manages if to show or hide teams/engines list
 * @param  {Array} divs state of the list divs of engines and teams
 */
function manageTeamsEngines(...divs) {
    divsTeamsArray.forEach(function (div,index) {
        if (divs[index] === "show") {
            div.className = "main-columns-drag-section"
        }
        else {
            div.className = "main-columns-drag-section d-none"
        }
    })
}

/**
 * Manages the engine stats for all manufacturers
 * @param {Object} msg engine stats for all manufacturers
 */
function manage_engineStats(msg) {
    msg.forEach(function (elem) {
        let engineId = elem[0]
        let engineStats = ""
        elem[1].forEach(function (stat) {
            engineStats += stat + " "
        })
        engineStats.trim()
        place_engineStats(engineId,engineStats)
    })
}

/**
 * Places the stats engineStats of engineid in its div
 * @param {string} engineId if of the engine to place the stats in
 * @param {string} engineStats string with all the stats of the engineid manufacturer
 */
function place_engineStats(engineId,engineStats) {
    var element = document.querySelector('[data-engineId="' + engineId + '"]');
    element.setAttribute('data-stats',"");
    if (element) {
        element.setAttribute('data-stats',engineStats);
    }
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
    elem.addEventListener("click",function () {
        removeSelected()
        manageSaveButton(true)
        elem.classList.toggle('selected');
        teamSelected = elem.dataset.teamid;
        let teamRequest = {
            command: "performanceRequest",
            teamID: teamSelected,
        }
        socket.send(JSON.stringify(teamRequest))
        document.querySelector("#performanceGraph").classList.add("d-none")
        document.querySelector(".teams-show").classList.remove("d-none")
    })
})

document.querySelectorAll(".engine").forEach(function (elem) {
    elem.addEventListener("click",function () {
        removeSelected()
        elem.classList.toggle('selected');
        engineSelected = elem.dataset.engineid;
        teamEngineSelected = elem.dataset.teamengine
        document.querySelector(".engines-show").classList.remove("d-none")
        resetBarsEngines(elem)
    })
})

function load_parts_stats(data) {
    console.log(data)
    for (let key in data) {
        let part = document.querySelector(`.part-performance[data-part='${key}']`)
        console.log(`.part-performance[data-part='${key}']`)
        for (let stat in data[key]) {
            if (stat !== "15"){
                console.log(`.part-performance-stat[data-attribute='${stat}']`)
                let stat_input = part.querySelector(`.part-performance-stat[data-attribute='${stat}']`).querySelector(".custom-input-number")
                if (stat === "7" || stat === "8" || stat === "9" ){
                    stat_input.value = data[key][stat].toFixed(2) + " kN"
                }
                else{
                    stat_input.value = data[key][stat].toFixed(2) + " %"
                }
            }
        }
    }
}

document.querySelector(".performance-show").querySelectorAll('.bi-plus-lg').forEach(button => {
    let intervalId;
    button.addEventListener('mousedown', function() {
      const input = this.previousElementSibling; 
      updateValue(input, 0.01);
      intervalId = setInterval(() => {
        updateValue(input, 0.01);
      }, 100); 
    });

    button.addEventListener('mouseup', function() {
      clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function() {
      clearInterval(intervalId);
    });
  });

    document.querySelector(".performance-show").querySelectorAll('.bi-dash-lg').forEach(button => {
    let intervalId;
    button.addEventListener('mousedown', function() {
        const input = this.nextElementSibling;
        updateValue(input, -0.01);
        intervalId = setInterval(() => {
        updateValue(input, -0.01);
        }, 100);
    });
    
    button.addEventListener('mouseup', function() {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function() {
        clearInterval(intervalId);
    });
});

  
  function updateValue(input, increment) {
    let value = input.value.split(' ')[0];
    let unit = input.value.split(' ')[1]; 
    value = parseFloat(value) + increment; 
    input.value = value.toFixed(2) + ' ' + unit; 
  }

/**
 * Puts the bars of the engine to their appropiate values
 * @param {div} div element of the dom that contains the stats of the engine
 */
function resetBarsEngines(div) {
    let statsString = div.dataset.stats
    var statsArray = statsString.split(' ').map(function (item) {
        return parseFloat(item,10) / 10;
    });
    document.querySelector(".engines-show").querySelectorAll(".custom-progress").forEach(function (elem,index) {
        elem.dataset.progress = statsArray[index]
        manage_bar(elem,elem.dataset.progress)
    })
}

/**
 * resets all bars to 0
 */
function resetBars() {
    document.querySelectorAll(".custom-progress").forEach(function (elem) {
        elem.dataset.progress = 0
        manage_bar(elem,elem.dataset.progress)
    })
}

/**
 * eventListeners for the confirm button for engines and teams
 */
document.getElementById("confirmEnginebtn").addEventListener("click",function () {
    let performanes = "";
    let progresses = ""
    document.querySelector(".engines-show").querySelectorAll(".custom-progress").forEach(function (elem) {
        var dataProgress = elem.dataset.progress;
        performanes += dataProgress + ' ';
        progresses += dataProgress * 10 + " "
    });
    performanes = performanes.slice(0,-1);
    progresses = progresses.slice(0,-1);
    document.querySelector(".selected").dataset.stats = progresses
    let dataPerformance = {
        command: "editEngine",
        engineID: engineSelected,
        teamEngineID: teamEngineSelected,
        team: document.querySelector(".selected").dataset.teamname,
        performanceArray: performanes,
    }
    socket.send(JSON.stringify(dataPerformance))
})

document.getElementById("confirmPerformancebtn").addEventListener("click",function () {
    let performanes = "";

    document.querySelector(".teams-show").querySelectorAll('.custom-progress').forEach(function (element) {
        var dataProgress = element.dataset.progress;

        performanes += dataProgress + ' ';
    });
    performanes = performanes.slice(0,-1);
    let dataPerformance = {
        command: "editPerformance",
        teamID: teamSelected,
        performanceArray: performanes,
        teamName: document.querySelector(".selected").dataset.teamname
    }

    socket.send(JSON.stringify(dataPerformance))
})

/**
 * eventlisteners for the buttons to add or remove from a bar, depending on if its an engine bar or team
 */
document.querySelector("#car_performance").querySelectorAll(".bi-dash-lg").forEach(function (elem) {
    elem.addEventListener("click",function () {
        let performanceArea = elem.parentNode.parentNode
        let bar = performanceArea.querySelector(".custom-progress")

        if (bar.dataset.type === "engine") {
            if (bar.dataset.progress > 0) {
                let value = parseFloat(bar.dataset.progress,10) - 0.125
                bar.dataset.progress = value
            }
        }
        else {
            if (bar.dataset.progress >= -9) {
                let value = parseInt(bar.dataset.progress,10) - 1
                bar.dataset.progress = value
            }
        }

        manage_bar(bar,bar.dataset.progress)
    })
})

document.querySelector("#car_performance").querySelectorAll(".bi-plus-lg").forEach(function (elem) {
    elem.addEventListener("click",function () {
        let performanceArea = elem.parentNode.parentNode
        let bar = performanceArea.querySelector(".custom-progress")
        if (bar.dataset.type === "engine") {
            let value = parseFloat(bar.dataset.progress,10) + 0.125
            if (value > 10) {
                value = 10
            }
            bar.dataset.progress = value
        }
        else {
            if (bar.dataset.progress <= 9) {
                let value = parseInt(bar.dataset.progress,10) + 1
                bar.dataset.progress = value
            }
        }
        manage_bar(bar,bar.dataset.progress)
    })
})

/**
 * eventListeners on Alpine and AT teams and Renault engine to change the icon
 */
document.getElementById("alpineTeam").addEventListener("click",function () {
    document.getElementById("alpineTeam").firstElementChild.classList.add("d-none")
    document.getElementById("alpineTeam").children[1].classList.remove("d-none")
})

document.getElementById("alphaTauriTeam").addEventListener("click",function () {
    document.getElementById("alphaTauriTeam").firstElementChild.classList.add("d-none")
    document.getElementById("alphaTauriTeam").children[1].classList.remove("d-none")
})

document.getElementById("renaultengine").addEventListener("click",function () {
    document.getElementById("renaultengine").firstElementChild.classList.add("d-none")
    document.getElementById("renaultengine").children[1].classList.remove("d-none")
})

/**
 * Manages the progression of the bars 
 * @param {div} bar bar that is about to be edited
 * @param {int} progress number that determines the progress of the bar 
 */
function manage_bar(bar,progress) {
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

function load_performance_graph(data){
    let labelsArray = []
    data[1].forEach(function (elem) {
        labelsArray.push(races_names[elem[2]])
    })
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
    let minValue = Number.POSITIVE_INFINITY;
    let maxValue = Number.NEGATIVE_INFINITY;
    data[0].forEach(race => {
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
    console.log(labelsArray)
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