document.querySelector("#teamMenu").querySelectorAll("a").forEach(function(elem){
    elem.addEventListener("click", function(){
        document.querySelector("#teamButton").innerText = elem.textContent
        document.querySelector(".team-header").innerText = elem.textContent
    })
    
})