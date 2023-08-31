const races_map = { 2: "bah0", 1: "aus0", 11: "sau0", 24: "imo0", 22: "mia0", 5: "spa0", 6: "mon0", 4: "aze0", 7: "can0", 10: "gbr0", 9: "aut0", 8: "fra0", 12: "hun0", 13: "bel0", 14: "ita0", 15: "sgp0", 17: "jap0", 19: "usa0", 18: "mex0", 20: "bra0", 21: "uae0", 23: "ned0", 25: "veg0", 26: "qat0" };
let seasonTable;
let default_points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
let races_ids = []

function createTable(calendar) {
    calendar.forEach(function (elem, index) {
        races_ids.push(calendar[index][0])
    })
    console.log(races_ids)
    seasonTable = new Tabulator("#seasonresults-table", {
        layout: "fitColumns",
        maxWidth: "1650px",
        responsiveLayout:"hide",
        columns: [{ title: "Driver", field: "driver", width: 175, headerSort: false, resizable:false, formatter: "html"},
        ...calendar.map((race, index) => ({
            title: '<span class="flag-header"><img src="' + codes_dict[races_map[race[1]]] + '" alt="Image 1"></span>',
            field: "race" + race[0],
            hozAlign: "center",
            headerSort: false,
            resizable:false
        })),
        {
            title: "Points",
            field: "points",
            hozAlign: "center",
            headerSort: false,
            resizable:false
        }],
        rowFormatter: function(row) {
            var rowData = row.getData();
            
            for (var key in rowData) {
                if (key !== "driver" && key !== "points") {
                    var cellValue = rowData[key];
                    
                    if (cellValue >= 25) {
                        row.getCell(key).getElement().style.backgroundColor = "gold";
                        row.getCell(key).getElement().style.color = "#18152e";
                    } else if (cellValue >= 18) {
                        row.getCell(key).getElement().style.backgroundColor = "silver";
                        row.getCell(key).getElement().style.color = "#18152e";
                    } else if (cellValue >= 15) {
                        row.getCell(key).getElement().style.backgroundColor = "#cd7f32";
                    }
                    if(!default_points.includes(cellValue) && cellValue !== "-"){
                        row.getCell(key).getElement().style.color = "#c90fd7";
                    }

                }
            }
        }

    });


}

function loadTable(allDrivers) {
    allDrivers.forEach(function (driver) {
        addDriver(driver)
    })
    seasonTable.setSort("points", "desc");
    let data = seasonTable.getData()
    data.forEach(row => {

        for (var key in row) {
            if (row[key] === 0) {
                row[key] = "";
            } else if (row[key] === undefined) {
                row[key] = "-"; // Reemplazar vacío por "-"
            }
        }
    });
    seasonTable.setData(data);
}

function addDriver(driverInfo) {
    let nameDiv = document.createElement("div");
    let name = driverInfo[0].split(" ")
    let spanName = document.createElement("span")
    let spanLastName = document.createElement("span")
    spanName.textContent = name[0] + " "
    spanLastName.textContent = " "+ name[1].toUpperCase()
    spanLastName.classList.add("bold-font")
    spanLastName.dataset.teamid = driverInfo[1]
    nameDiv.appendChild(spanName)
    nameDiv.appendChild(spanLastName)
    manageColor(spanLastName, spanLastName)
    
    let rowData = { driver: nameDiv.innerHTML };
    driverInfo.slice(2).forEach((pair, index) => {
        rowData["race" + pair[0]] = pair[2];
    });


    let totalPoints = 0;
    driverInfo.slice(2).forEach(function (elem) {
        totalPoints += elem[2]
    })
    rowData["points"] = totalPoints;
    seasonTable.addData(rowData);
}
