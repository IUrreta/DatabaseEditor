const races_map = { 2: "bah0", 1: "aus0", 11: "sau0", 24: "imo0", 22: "mia0", 5: "spa0", 6: "mon0", 4: "aze0", 7: "can0", 10: "gbr0", 9: "aut0", 8: "fra0", 12: "hun0", 13: "bel0", 14: "ita0", 15: "sgp0", 17: "jap0", 19: "usa0", 18: "mex0", 20: "bra0", 21: "uae0", 23: "ned0", 25: "veg0", 26: "qat0" };
const races_names = { 2: "BAH", 1: "AUS", 11: "SAU", 24: "IMO", 22: "MIA", 5: "SPA", 6: "MON", 4: "AZE", 7: "CAN", 10: "GBR", 9: "AUT", 8: "FRA", 12: "HUN", 13: "BEL", 14: "ITA", 15: "SGP", 17: "JAP", 19: "USA", 18: "MEX", 20: "BRA", 21: "UAE", 23: "NED", 25: "VEG", 26: "QAT" };
let seasonTable;
let default_points = ["25", "18", "15", "12", "10", "8", "6", "4", "2", "1", "DNF", "0", "", "-"]
let races_ids = []
let seasonResults;
let calendarData;
let pointsOrPos = "points"

/**
 * Creates the main table for the calendar of the season selected
 * @param {Object} calendar calendar of the year selected
 */
function createTable(calendar) {
    calendarData = calendar;
    calendar.forEach(function (elem, index) {
        races_ids.push(calendar[index][0])
    })
    seasonTable = new Tabulator("#seasonresults-table", {
        layout: "fitColumns",
        maxWidth: "1650px",
        responsiveLayout: "hide",
        columns: [{ title: "Driver", field: "driver", width: 175, headerSort: false, resizable: false, formatter: "html", headerHozAlign: "center" },
        ...calendar.map((race, index) => ({
            title: '<div class="flag-header"><img src="' + codes_dict[races_map[race[1]]] + '" alt="Image 1"><div class="text-in-front bold-font">' + races_names[race[1]] + '</div></div>',
            field: "race" + race[0],
            hozAlign: "center",
            headerSort: false,
            resizable: false
        })),
        { title: "Points", field: "points", hozAlign: "center", headerSort: false, headerHozAlign: "center", resizable: false },
        { title: "Position", field: "pos", hozAlign: "center", visible: false}

        ],
        rowFormatter: function (row) {
            var rowData = row.getData();
            for (var key in rowData) {
                if (key !== "driver" && key !== "points" && key !== "pos") {
                    let cellValue = rowData[key];
                    if (cellValue !== undefined) {
                        if (pointsOrPos === "points") {
                            let splitted = cellValue.split("(")
                            if (parseInt(splitted[0]) >= 25) {
                                row.getCell(key).getElement().style.backgroundColor = "#FDE06B";
                                row.getCell(key).getElement().style.color = "#18152e";
                            } else if (parseInt(splitted[0]) >= 18) {
                                row.getCell(key).getElement().style.backgroundColor = "#AEB2B8";
                                row.getCell(key).getElement().style.color = "#18152e";
                            } else if (parseInt(splitted[0]) >= 15) {
                                row.getCell(key).getElement().style.backgroundColor = "#d7985a";
                                row.getCell(key).getElement().style.color = "#18152e";
                            }
                            if (cellValue[cellValue.length - 1] === "s") {
                                row.getCell(key).getElement().innerText = row.getCell(key).getElement().innerText.slice(0, -1)
                                row.getCell(key).getElement().style.color = "#c90fd7";
                            }
                        }
                        else if (pointsOrPos === "pos") {
                            let splitted = cellValue.split("(")
                            if (parseInt(splitted[0]) === 1) {
                                row.getCell(key).getElement().style.backgroundColor = "#FDE06B";
                                row.getCell(key).getElement().style.color = "#18152e";
                            } else if (parseInt(splitted[0]) == 2) {
                                row.getCell(key).getElement().style.backgroundColor = "#AEB2B8";
                                row.getCell(key).getElement().style.color = "#18152e";
                            } else if (parseInt(splitted[0]) === 3) {
                                row.getCell(key).getElement().style.backgroundColor = "#d7985a";
                                row.getCell(key).getElement().style.color = "#18152e";
                            }
                            if (cellValue[cellValue.length - 1] === "s") {
                                row.getCell(key).getElement().innerText = row.getCell(key).getElement().innerText.slice(0, -1)
                                row.getCell(key).getElement().style.color = "#c90fd7";
                            }
                        }

                    }
                }
            }
        }

    });


}

/**
 * Even listener for the positions and points pill
 */
document.getElementById("pospill").addEventListener("click", function () {
    if (seasonTable) {
        seasonTable.destroy()
    }
    pointsOrPos = "pos"
    createTable(calendarData)
    setTimeout(function () {
        loadTable(seasonResults)
    }, 10);



})

document.getElementById("pointspill").addEventListener("click", function () {
    if (seasonTable) {
        seasonTable.destroy()
    }
    pointsOrPos = "points"
    createTable(calendarData)
    setTimeout(function () {
        loadTable(seasonResults)
    }, 10);
})

/**
 * Creates the year selector menu
 * @param {String} actualYear current year of the save
 */
function generateYearsMenu(actualYear) {
    var yearMenu = document.querySelector("#yearMenu");
    yearMenu.innerHTML = ""
    for (let year = actualYear; year >= 2023; year--) {
        let a = document.createElement("a");
        a.textContent = year.toString();
        a.classList = "dropdown-item"
        a.style.cursor = "pointer"
        yearMenu.appendChild(a);
        a.addEventListener("click", function () {
            document.getElementById("yearButton").textContent = a.textContent
            let dataYear = {
                command: "yearSelected",
                year: a.textContent
            }

            socket.send(JSON.stringify(dataYear))
        })
    }
}

/**
 * Loads the data into the table
 * @param {Object} allDrivers all driver's results of the season
 */
function loadTable(allDrivers) {
    seasonResults = allDrivers;
    allDrivers.forEach(function (driver) {
        addDriver(driver)
    })
    seasonTable.setSort("pos", "asc");
    formatTable()
    document.querySelector(".tabulator-tableholder").style.maxHeight = document.querySelector(".tabulator-table").offsetHeight + "px";
    document.querySelector(".tabulator-tableholder").style.overflow = "hidden";
}

/**
 * Formats the table for special vlaues
 */
function formatTable() {
    let data = seasonTable.getData()
    data.forEach(row => {
        for (var key in row) {
            if (key !== "driver" && key !== "points" && key !== "pos") {
                if (row[key] !== undefined) {
                    let val = row[key].split("(")
                    if (val.length == 2) {
                        if (val[0] === "0") {
                            val[0] = ""
                        }
                        else if (val[0] === "-1") {
                            val[0] = "DNF"
                        }
                        if (val[1] === "0)") {
                            val[1] = ""
                        }
                        else {
                            val[1] = "(" + val[1]
                        }
                        row[key] = val[0] + val[1]
                    }
                    else if (val.length == 1) {
                        if (row[key] === "0") {
                            row[key] = "";
                        }
                        if (row[key] === "-1") {
                            row[key] = "DNF";
                        }
                    }
                }
                else {
                    row[key] = "-"
                }
            }
        }
    });
    seasonTable.setData(data);
}

/**
 * Adds one driver into the table
 * @param {Object} driverInfo one driver's season results
 */
function addDriver(driverInfo) {
    let nameDiv = document.createElement("div");
    let name = driverInfo[0].split(" ")
    let spanName = document.createElement("span")
    let spanLastName = document.createElement("span")
    spanName.textContent = name[0] + " "
    spanLastName.textContent = " " + name[1].toUpperCase()
    spanLastName.classList.add("bold-font")
    spanLastName.dataset.teamid = driverInfo[1]
    nameDiv.appendChild(spanName)
    nameDiv.appendChild(spanLastName)
    manageColor(spanLastName, spanLastName)
    let rowData = { driver: nameDiv.innerHTML, pos:driverInfo[2] }
    let raceValue;
    let sprintvalue;
    if (pointsOrPos === "points") {
        raceValue = 2;
        sprintvalue = 4;
    }
    else if (pointsOrPos === "pos") {
        raceValue = 1;
        sprintvalue = 5;
    }



    driverInfo.slice(3).forEach((pair, index) => {
        if (pair.length === 4) {
            rowData["race" + pair[0]] = "" + pair[raceValue];
        }
        else if (pair.length === 6) {
            rowData["race" + pair[0]] = pair[raceValue] + "(" + pair[sprintvalue] + ")"
        }
        if (pair[3] === 1) {
            rowData["race" + pair[0]] += "s"
        }

    });


    let totalPoints = 0;
    driverInfo.slice(3).forEach(function (elem) {
        if (elem[2] != "-1") {
            totalPoints += elem[2]
        }

        if (elem.length === 6) {
            totalPoints += elem[4]
        }
    })
    rowData["points"] = totalPoints;
    seasonTable.addData(rowData);
}
