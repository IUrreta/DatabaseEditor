let teamCod;

document.querySelector("#teamMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click",function () {
        document.querySelector("#teamButton").innerText = elem.textContent;
        teamCod = elem.dataset.teamid;
        fillLevels()
    })
})

document.querySelector("#objectiveMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click",function () {
        document.querySelector("#objectiveButton").innerText = elem.textContent
    })

})

document.querySelector("#objAndYear").querySelector(".bi-chevron-up").addEventListener("click",function () {
    document.querySelector("#longTermInput").value = Number(document.querySelector("#longTermInput").value) + 1
})

document.querySelector("#objAndYear").querySelector(".bi-chevron-down").addEventListener("click",function () {
    document.querySelector("#longTermInput").value = Number(document.querySelector("#longTermInput").value) - 1
})

document.querySelector("#seasonObjective").querySelector(".bi-chevron-up").addEventListener("click",function () {
    document.querySelector("#seasonObjectiveInput").value = Number(document.querySelector("#seasonObjectiveInput").value) + 1
})

document.querySelector("#seasonObjective").querySelector(".bi-chevron-down").addEventListener("click",function () {
    document.querySelector("#seasonObjectiveInput").value = Number(document.querySelector("#seasonObjectiveInput").value) - 1
})

document.querySelector("#carDevButton").addEventListener("click",function () {
    if (document.querySelector("#operationButton").dataset.state === "show") {
        document.querySelector("#operationButton").click()
    }
    if (document.querySelector("#carDevButton").dataset.state === "show") {
        document.querySelector("#carDevButton").dataset.state = "hide"
        document.querySelector("#carDevButton").innerText = "Show"
    }
    else {
        document.querySelector("#carDevButton").dataset.state = "show"
        document.querySelector("#carDevButton").innerText = "Hide"

    }


})

document.querySelector("#operationButton").addEventListener("click",function () {
    if (document.querySelector("#carDevButton").dataset.state === "show") {
        document.querySelector("#carDevButton").click()
    }
    if (document.querySelector("#operationButton").dataset.state === "show") {
        document.querySelector("#operationButton").dataset.state = "hide"
        document.querySelector("#operationButton").innerText = "Show"
    }
    else {
        document.querySelector("#operationButton").dataset.state = "show"
        document.querySelector("#operationButton").innerText = "Hide"
    }


})



function fillLevels(){
    document.querySelectorAll('.facility-level-indicator').forEach((indicator) => {
        let value = indicator.getAttribute('data-value');
        let levels = indicator.querySelectorAll('.level');
    
        for (let i = 0; i < value; i++) {
            levels[i].className="level"
            levels[i].classList.add(team_dict[teamCod] + 'activated');
        }
    });
}


document.querySelector("#edit_teams").querySelectorAll(".bi-chevron-right").forEach(function (elem) {
    elem.addEventListener("click",function () {
        let indicator = elem.parentNode.querySelector(".facility-level-indicator")
        let value = parseInt(indicator.getAttribute('data-value')) + 1;
        if(value > 5){
            value = 5
        }

        indicator.setAttribute('data-value',value);
        let levels = indicator.querySelectorAll('.level');

        if (value <= levels.length) {
            levels[value - 1].classList.add(team_dict[teamCod] + 'activated');
        }
    })
})

document.querySelector("#edit_teams").querySelectorAll(".bi-chevron-left").forEach(function (elem) {
    elem.addEventListener("click",function () {
        let indicator = elem.parentNode.querySelector(".facility-level-indicator")
        let value = parseInt(indicator.getAttribute('data-value')) - 1;
        if(value < 0){
            value = 0
        }

        indicator.setAttribute('data-value',value);
        let levels = indicator.querySelectorAll('.level');

        if (value < levels.length) {
            levels[value].className = "level"
        }
    })

})