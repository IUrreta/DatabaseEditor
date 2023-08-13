const teamsPill = document.getElementById("teamsPill");
const enginesPill = document.getElementById("enginesPill");

const teamsDiv = document.getElementById("teamsDiv");
const enginesDiv = document.getElementById("enginesDiv");

const divsTeamsArray = [teamsDiv, enginesDiv]


let teamSelected;

teamsPill.addEventListener("click", function () {
    manageTeamsEngines("show", "hide")
    document.querySelector(".engines-show").classList.add("d-none")
    document.querySelector(".teams-show").classList.remove("d-none")
})

enginesPill.addEventListener("click", function () {
    manageTeamsEngines("hide", "show")
    document.querySelector(".teams-show").classList.add("d-none")
    document.querySelector(".engines-show").classList.remove("d-none")
})

function manageTeamsEngines(...divs) {
    divsTeamsArray.forEach(function (div, index) {
        if (divs[index] === "show") {
            div.className = "main-columns-drag-section"
        }
        else {
            div.className = "main-columns-drag-section d-none"
        }
    })
}

document.querySelectorAll(".team").forEach(function (elem) {
    elem.addEventListener("click",function () {
        let elemsSelected = document.querySelectorAll('.selected');
        elemsSelected.forEach(item => item.classList.remove('selected'));
        elem.classList.toggle('selected');
        teamSelected = elem.dataset.teamid;
        console.log(elem.dataset.teamid)
        document.querySelector(".teams-show").classList.remove("d-none")
        resetBars()
    })
})

document.querySelectorAll(".engine").forEach(function (elem) {
    elem.addEventListener("click",function () {
        let elemsSelected = document.querySelectorAll('.selected');
        elemsSelected.forEach(item => item.classList.remove('selected'));
        elem.classList.toggle('selected');
        teamSelected = elem.dataset.teamid;
        console.log(elem.dataset.teamid)
        document.querySelector(".engines-show").classList.remove("d-none")
        resetBars()
    })
})

function resetBars() {
    document.querySelectorAll(".custom-progress").forEach(function (elem) {
        elem.dataset.progress = 0
        manage_bar(elem,elem.dataset.progress)
    })
}

document.getElementById("confirmPerformancebtn").addEventListener("click",function () {
    let performanes= "";

    document.querySelector(".teams-show").querySelectorAll('.custom-progress').forEach(function (element) {
        var dataProgress = element.dataset.progress;

        performanes += dataProgress + ' ';
    });
    performanes = performanes.slice(0,-1);
    document.querySelector(".selected").dataset.teamname
    let dataPerformance = {
        command: "editPerformance",
        teamID: teamSelected,
        performanceArray: performanes,
        teamName : document.querySelector(".selected").dataset.teamname
    }

    socket.send(JSON.stringify(dataPerformance))
})


document.querySelectorAll(".bi-dash-circle").forEach(function (elem) {
    elem.addEventListener("click",function () {
        let performanceArea = elem.parentNode.parentNode
        let bar = performanceArea.querySelector(".custom-progress")
        
        if(bar.dataset.type === "engine"){
            if (bar.dataset.progress > 0) {
                let value = parseFloat(bar.dataset.progress,10) - 0.25
                bar.dataset.progress = value
            }
        }
        else{
            if (bar.dataset.progress >= -9) {
                let value = parseInt(bar.dataset.progress,10) - 1
                bar.dataset.progress = value
            }
        }
        
        manage_bar(bar,bar.dataset.progress)
    })
})

document.querySelectorAll(".bi-plus-circle").forEach(function (elem) {
    elem.addEventListener("click",function () {
        let performanceArea = elem.parentNode.parentNode
        let bar = performanceArea.querySelector(".custom-progress")
        if(bar.dataset.type === "engine"){
            if (bar.dataset.progress < 10) {
                let value = parseFloat(bar.dataset.progress,10) + 0.25
                bar.dataset.progress = value
            }
        }
        else{
            if (bar.dataset.progress <= 9) {
                let value = parseInt(bar.dataset.progress,10) + 1
                bar.dataset.progress = value
            }
        }
        manage_bar(bar,bar.dataset.progress)
    })
})

function manage_bar(bar,progress) {
    if(bar.dataset.type ==="engine"){
        let whiteDiv = bar.querySelector(".white-part")
        let newProgress = progress * 10
        let newWidth = 0 + newProgress + "%"
        whiteDiv.style.width = newWidth;
    }
    else{
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