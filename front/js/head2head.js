let driver1_selected = false;
let driver2_selected = false;
let driver1Sel;
let driver2Sel;

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
    driver1Menu.innerHTML = ""
    let driver2Menu = document.querySelector("#d2Menu")
    driver2Menu.innerHTML = ""
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
        let a = document.createElement("a");
        a.dataset.driverid = elem[1]
        nameDiv.appendChild(spanName)
        nameDiv.appendChild(spanLastName)
        a.appendChild(nameDiv)
        a.classList = "dropdown-item"
        a.style.cursor = "pointer"
        let a2 = a.cloneNode(true)
        driver1Menu.appendChild(a2);
        driver2Menu.appendChild(a);
        listeners_h2h(a, a2)
    })
}

function listeners_h2h(aDriver2, aDriver1){
    aDriver1.addEventListener("click", function(){
        if(!driver1_selected){
            driver1_selected = true
        }
        driver1Sel = aDriver1
        console.log(driver1Sel)
        if(driver1_selected && driver2_selected){
            let data = {
                command: "H2HConfigured",
                d1: driver1Sel.dataset.driverid,
                d2: driver2Sel.dataset.driverid,
                year: document.querySelector("#yearButtonH2H").textContent
            }

            socket.send(JSON.stringify(data))
        }
    })
    aDriver2.addEventListener("click", function(){
        if(!driver2_selected){
            driver2_selected = true
        }
        driver2Sel = aDriver2
        console.log(driver2Sel)
        if(driver1_selected && driver2_selected){
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