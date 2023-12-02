

const names_full = {
    "BAH": "Bahrain",
    "AUS": "Australia",
    "SAU": "Saudi Arabia",
    "IMO": "Imola",
    "MIA": "Miami",
    "SPA": "Spain",
    "MON": "Monaco",
    "AZE": "Azerbaijan",
    "CAN": "Canada",
    "GBR": "Great Britain",
    "AUT": "Austria",
    "FRA": "France",
    "HUN": "Hungary",
    "BEL": "Belgium",
    "ITA": "Italy",
    "SGP": "Singapore",
    "JAP": "Japan",
    "USA": "United States",
    "MEX": "Mexico",
    "BRA": "Brazil",
    "UAE": "Abu Dhabi",
    "NED": "Netherlands",
    "VEG": "Vegas",
    "QAT": "Qatar"
  };

let yearSel;


function placeRaces(races){
    yearSel = races[0]
    raceMenu = document.querySelector("#raceMenu")
    raceMenu.innerHTML = ""
    console.log(races)
    races[1].forEach(function(race){
        let newDiv = document.createElement("div");
        newDiv.className = "race bold-font"
        newDiv.textContent = names_full[races_names[race[1]]]
        newDiv.dataset.raceid = race[0]
        let img = document.createElement("img")
        img.setAttribute("src", codes_dict[races_map[race[1]]])
        img.className = "race-flag"
        img.style.float = "right"
        newDiv.appendChild(img)
        raceMenu.appendChild(newDiv)
        newDiv.addEventListener("click", function(){
            if(raceMenu.querySelector(".selected")){
                raceMenu.querySelector(".selected").classList.remove("selected")
            }
            newDiv.classList.add("selected")
            let data = {
                command: "predict",
                race: newDiv.dataset.raceid,
                year : yearSel
            }
            socket.send(JSON.stringify(data))
        })
    })
}

function predictDrivers(drivers){
    document.querySelector("#predictionFirst").querySelector(".prediction-table-data").innerHTML = ""
    document.querySelector("#predictionSecond").querySelector(".prediction-table-data").innerHTML = ""
    console.log(drivers)
    drivers.forEach(function(driver){
        console.log(driver)
        let mainDiv = document.createElement("div")
        mainDiv.className = "driver-info"
        let name = driver.Name.split(" ")
        let nameDiv = document.createElement("div")
        nameDiv.classList = "driver-prediction"
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        spanLastName.dataset.teamid = driver.Team;
        spanName.textContent = name[0] + " "
        spanLastName.textContent = name[1].toUpperCase()
        spanLastName.classList.add("bold-font")
        manageColor(spanLastName, spanLastName)
        nameDiv.appendChild(spanName)
        nameDiv.appendChild(spanLastName)
        mainDiv.appendChild(nameDiv)
        let positionDiv = document.createElement("div")
        positionDiv.className = "position-prediction bold-font"
        let provisional = driver.result
        let positionNum = document.createElement("div")
        if(provisional === 1){
            provisional = provisional + "st"
            positionNum.style.color = "#FDE06B"
        }
        else if(provisional === 2){
            provisional = provisional + "nd"
            positionNum.style.color = "#AEB2B8"
        }
        else if(provisional === 3){
            provisional = provisional + "rd"
            positionNum.style.color = "#d7985a"
        }
        else{
            provisional = provisional + "th"
        }
        
        let positionDelta= document.createElement("div")
        positionNum.textContent = provisional
        let delta = driver.Prediction - driver.result
        if(delta > 0){
            positionDelta.innerText = "+" + delta
            positionDelta.style.color = "#5bd999"
        }
        else if (delta < 0){
            positionDelta.innerText =  delta
            positionDelta.style.color = "#e95656"
        }
        else if (delta === 0){
            positionDelta.innerText = " ="
        }
        positionDiv.appendChild(positionNum)
        positionDiv.appendChild(positionDelta)
        let predictionDiv = document.createElement("div")
        predictionDiv.className = "prediction-prediction bold-font"
        provisional = driver.Prediction
        if(provisional === 1){
            provisional = provisional + "st"
        }
        else if(provisional === 2){
            provisional = provisional + "nd"
        }
        else if(provisional === 3){
            provisional = provisional + "rd"
        }
        else{
            provisional = provisional + "th"
        }
        predictionDiv.textContent = provisional
        mainDiv.appendChild(predictionDiv)
        mainDiv.appendChild(positionDiv)
        if(driver.result <= 10){
            document.querySelector("#predictionFirst").querySelector(".prediction-table-data").appendChild(mainDiv)
        }
        else if(driver.result > 10){
            document.querySelector("#predictionSecond").querySelector(".prediction-table-data").appendChild(mainDiv)
        }
    })
}