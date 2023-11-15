document.querySelector("#teamMenu").querySelectorAll("a").forEach(function(elem){
    elem.addEventListener("click", function(){
        document.querySelector("#teamButton").innerText = elem.textContent
        document.querySelector(".team-header").innerText = elem.textContent
    })
    
})

document.querySelector("#objectiveMenu").querySelectorAll("a").forEach(function(elem){
    elem.addEventListener("click", function(){
        document.querySelector("#objectiveButton").innerText = elem.textContent
    })
    
})

document.querySelector("#objAndYear").querySelector(".bi-plus-lg").addEventListener("click", function(){
    document.querySelector("#longTermInput").value = Number(document.querySelector("#longTermInput").value) + 1
})

document.querySelector("#objAndYear").querySelector(".bi-dash-lg").addEventListener("click", function(){
    document.querySelector("#longTermInput").value = Number(document.querySelector("#longTermInput").value) - 1
})

document.querySelector("#seasonObjective").querySelector(".bi-plus-lg").addEventListener("click", function(){
    document.querySelector("#seasonObjectiveInput").value = Number(document.querySelector("#seasonObjectiveInput").value) + 1
})

document.querySelector("#seasonObjective").querySelector(".bi-dash-lg").addEventListener("click", function(){
    document.querySelector("#seasonObjectiveInput").value = Number(document.querySelector("#seasonObjectiveInput").value) - 1
})

document.querySelector("#carDevButton").addEventListener("click", function(){
    if(document.querySelector("#operationButton").dataset.state === "show"){
        document.querySelector("#operationButton").click()
    }
    if(document.querySelector("#carDevButton").dataset.state === "show"){
        document.querySelector("#carDevButton").dataset.state = "hide"
        document.querySelector("#carDevButton").innerText = "Show"
    }
    else{
        document.querySelector("#carDevButton").dataset.state = "show"
        document.querySelector("#carDevButton").innerText = "Hide"
        
    }

    
})

document.querySelector("#operationButton").addEventListener("click", function(){
    if(document.querySelector("#carDevButton").dataset.state === "show"){
        document.querySelector("#carDevButton").click()
    }
    if(document.querySelector("#operationButton").dataset.state === "show"){
        document.querySelector("#operationButton").dataset.state = "hide"
        document.querySelector("#operationButton").innerText = "Show"
    }
    else{
        document.querySelector("#operationButton").dataset.state = "show"
        document.querySelector("#operationButton").innerText = "Hide"
    }


})