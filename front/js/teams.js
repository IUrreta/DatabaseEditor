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