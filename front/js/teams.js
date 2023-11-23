let teamCod;

document.querySelector("#teamMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click",function () {
        document.querySelector("#teamButton").innerText = elem.textContent;
        teamCod = elem.dataset.teamid;
        let data = {
            command: "teamRequest",
            teamID: teamCod,
        }

        socket.send(JSON.stringify(data))
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



function fillLevels(teamData){
    teamData.pop()
    teamData.forEach(function(elem){
        let num = elem[0];
        let level = num % 10;
        let facilityID = Math.floor(num / 10);
        console.log(facilityID)
        let facility = document.querySelector("#facility" + facilityID)
        console.log(level)
        let indicator = facility.querySelector('.facility-level-indicator')
        indicator.dataset.value = level
        let value = level
        let levels = indicator.querySelectorAll('.level');
    
        for (let i = 0; i < 5; i++) {
            levels[i].className="level"
            if(i <= value -1){
                levels[i].classList.add(team_dict[teamCod] + 'activated');
            }
        }
        facility.querySelector("input").value = elem[1]
    })
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