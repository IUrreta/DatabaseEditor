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
    "UAE": "United Arab Emirates",
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
        raceMenu.appendChild(newDiv)
        newDiv.addEventListener("click", function(){
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
    console.log(drivers)
    drivers.forEach(function(driver){
        console.log(driver)
    })
}