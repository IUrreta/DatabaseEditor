let driver1_selected = false;
let driver2_selected = false;
let driver1Sel;
let driver2Sel;
let pos_dict = {1: "1st", 2:"2nd", 3: "3rd"}
let d1_team
let d2_team

function manage_h2h_bars(data){
    console.log(data)
    let relValue
    let d1_width
    let d2_width
    document.querySelectorAll(".one-statH2H").forEach(function(elem, index){
        if(elem.id === "bestrh2h" || elem.id === "bestqh2h"){
            d1_width = 100 - (data[index][0] - 1) *5
            d2_width = 100 - (data[index][1] - 1) *5
            if(data[index][0] <= 3){
                elem.querySelector(".driver1-number").textContent = pos_dict[data[index][0]]
            }
            else{
                elem.querySelector(".driver1-number").textContent = data[index][0]+"th"
            }
            if(data[index][1] <= 3){
                elem.querySelector(".driver2-number").textContent = pos_dict[data[index][1]]
            }
            else{
                elem.querySelector(".driver2-number").textContent = data[index][1]+"th"
            }
        }
        else{
            if(elem.id === "raceh2h" || elem.id === "qualih2h" || elem.id === "podiumsh2h" || elem.id === "dnfh2h"){
                relValue = (100 /(data[0][0] + data[0][1])).toFixed(2)
            }
            else if(elem.id === "ptsh2h"){
                relValue = 100 / Math.max(data[index][0], data[index][1])
            }
            d1_width = data[index][0] * relValue 
            d2_width = data[index][1] * relValue
            elem.querySelector(".driver1-number").textContent = data[index][0]
            elem.querySelector(".driver2-number").textContent = data[index][1]
        }
        if(d1_width > 100){
            d1_width = 100
        }
        if(d2_width > 100){
            d2_width = 100
        }
        elem.querySelector(".driver1-bar").className = "driver1-bar"
        elem.querySelector(".driver2-bar").className = "driver2-bar"
        document.querySelector(".driver1-name").className = "driver1-name"
        document.querySelector(".driver2-name").className = "driver2-name"
        elem.querySelector(".driver1-bar").classList.add(team_dict[d1_team]+"bar-primary")
        document.querySelector(".driver1-name").classList.add(team_dict[d1_team]+"border-primary")
        if(d1_team === d2_team){
            elem.querySelector(".driver2-bar").classList.add(team_dict[d2_team]+"bar-secondary") 
            document.querySelector(".driver2-name").classList.add(team_dict[d2_team]+"border-secondary")
        }
        else{
            elem.querySelector(".driver2-bar").classList.add(team_dict[d2_team]+"bar-primary") 
            document.querySelector(".driver2-name").classList.add(team_dict[d2_team]+"border-primary")
        }
        elem.querySelector(".driver1-bar").style.width = d1_width+ "%"
        elem.querySelector(".driver2-bar").style.width = d2_width+ "%"

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
        document.querySelector(".driver1-first").textContent = driver1Sel.firstChild.children[0].innerText
        document.querySelector(".driver1-second").textContent = driver1Sel.firstChild.children[1].innerText
        document.querySelector(".driver1-second").dataset.teamid = driver1Sel.firstChild.children[1].dataset.teamid
        d1_team = driver1Sel.firstChild.children[1].dataset.teamid
        document.querySelector(".driver1-second").className = "driver1-second bold-font"
        let newName = aDriver1.firstChild.cloneNode(true)
        document.querySelector("#driver1Button").innerHTML = ""
        document.querySelector("#driver1Button").appendChild(newName)
        manageColor(document.querySelector(".driver1-second"), document.querySelector(".driver1-second"))
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
        document.querySelector(".driver2-first").textContent = driver2Sel.firstChild.children[0].innerText
        document.querySelector(".driver2-second").textContent = driver2Sel.firstChild.children[1].innerText
        document.querySelector(".driver2-second").dataset.teamid = driver2Sel.firstChild.children[1].dataset.teamid
        document.querySelector(".driver2-second").className = "driver2-second bold-font"
        let newName2 = aDriver2.firstChild.cloneNode(true)
        document.querySelector("#driver2Button").innerHTML = ""
        document.querySelector("#driver2Button").appendChild(newName2)
        d2_team = driver2Sel.firstChild.children[1].dataset.teamid
        manageColor(document.querySelector(".driver2-second"), document.querySelector(".driver2-second"))
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