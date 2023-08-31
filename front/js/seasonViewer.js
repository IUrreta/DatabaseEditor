const races_map = { 2: "bah0", 1: "aus0", 11: "sau0", 24: "imo0", 22: "mia0", 5: "spa0", 6: "mon0", 4: "aze0", 7: "can0", 10: "gbr0", 9: "aut0", 8: "fra0", 12: "hun0", 13: "bel0", 14: "ita0", 15: "sgp0", 17: "jap0", 19: "usa0", 18: "mex0", 20: "bra0", 21: "uae0", 23: "ned0", 25: "veg0", 26: "qat0" };
let seasonTable;

function createTable(calendar) {
    seasonTable = new Tabulator("#seasonresults-table", {
        layout: "fitColumns",
        columns: [{ title: "Driver", field: "driver", width: 175 },
        ...calendar.map((race, index) => ({
            title: '<span class="flag-header"><img src="' + codes_dict[races_map[race]] + '" alt="Image 1"></span>',
            field: "race" + index,
            hozAlign: "center",
            headerSort: false,
        })),
        {
            title: "Points",
            field: "points",
            hozAlign: "center",
        }],
    });
}

function loadTable(allDrivers) {
    allDrivers.forEach(function (driver) {
        addDriver(driver)
    })
    seasonTable.setSort("points", "desc");
}

function addDriver(driverInfo) {
    let driverName = driverInfo[0]
    let rowData = { driver: driverName };
    driverInfo.slice(2).forEach((pair, index) => {
        rowData["race" + index] = pair[1];
    });
    let totalPoints = 0;
    driverInfo.slice(2).forEach(function(elem){
        totalPoints += elem[1]
    })
    rowData["points"] = totalPoints;
    seasonTable.addData(rowData);
}
