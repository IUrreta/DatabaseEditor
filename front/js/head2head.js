
function manage_h2h_bars(data){
    console.log(data)
    let relValue
    let d1_width
    let d2_width
    document.querySelectorAll(".one-statH2H").forEach(function(elem, index){
        if(elem.id === "raceh2h" || elem.id === "qualih2h" || elem.id === "podiumsh2h" || elem.id === "dnfh2h"){
            relValue = (100 /(data[0][0] + data[0][1])).toFixed(2)

        }
        else if(elem.id === "ptsh2h" || elem.id === "bestrh2h" || elem.id === "bestqh2h"){
            relValue = 100 / Math.max(data[index][0], data[index][0])
        }
        d1_width = data[index][0] * relValue 
        d2_width = data[index][1] * relValue
        if(d1_width > 100){
            d1_width = 100
        }
        if(d2_width > 100){
            d2_width = 100
        }
        elem.querySelector(".driver1-bar").style.width = d1_width+ "%"
        elem.querySelector(".driver2-bar").style.width = d2_width+ "%"
        elem.querySelector(".driver1-number").textContent = data[index][0]
        elem.querySelector(".driver2-number").textContent = data[index][1]
    })

}

function load_drivers_h2h(drivers){
    let driver1Menu = document.querySelector("#d1Menu")
    console.log(driver1Menu)
    let driver2Menu = document.querySelector("#d2Menu")
    drivers.forEach(function(elem){
        let nameDiv = document.createElement("div");
        let name = elem[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        spanName.textContent = name[0] + " "
        spanLastName.textContent = " " + name[1].toUpperCase()
        spanLastName.classList.add("bold-font")
        spanLastName.dataset.teamid = elem[2]
        manageColor(spanLastName, spanLastName)
        nameDiv.dataset.driverid = elem[1]
        nameDiv.appendChild(spanName)
        nameDiv.appendChild(spanLastName)
        let a = document.createElement("a");
        a.appendChild(nameDiv)
        a.classList = "dropdown-item"
        a.style.cursor = "pointer"
        let a2 = a.cloneNode(true)
        driver1Menu.appendChild(a2);
        driver2Menu.appendChild(a);
    })
}