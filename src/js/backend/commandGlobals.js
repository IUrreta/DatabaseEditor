// commandGlobals.js
export const teamReplaceDict = {
    "Alpha Tauri": "Alpha Tauri", "Alpine": "Alpine", "Alfa Romeo": "Alfa Romeo", "Aston Martin": "Aston Martin",
    "Ferrari": "Ferrari", "Haas": "Haas", "McLaren": "McLaren", "Mercedes": "Mercedes",
    "Red Bull": "Red Bull", "Williams": "Williams", "Renault": "Renault", "F2": "Formula 2", "F3": "Formula 3", "Custom Team": "Custom Team"
};

export const prettyNames = {
    "visarb": "Visa Cashapp RB", "toyota": "Toyota", "hugo": "Hugo Boss", "alphatauri": "Alpha Tauri", "brawn": "Brawn GP", "porsche": "Porsche",
    "alpine": "Alpine", "renault": "Renault", "andretti": "Andretti", "lotus": "Lotus", "cadillac": "Cadillac", "alfa": "Alfa Romeo",
    "audi": "Audi", "sauber": "Sauber", "stake": "Stake Sauber", "redbull": "Red Bull", "ford": "Ford", "aston": "Aston Martin",
    "racingpoint": "Racing Point", "jordan": "Jordan"
};

let path = null;
let yearIteration = null;
let isCreateATeam = false;
let currentDate = null;

export function setGlobals({dbPath, year, createTeam, date }) {
    path = dbPath || path;
    yearIteration = year || yearIteration;
    isCreateATeam = createTeam || isCreateATeam;
    currentDate = date || currentDate;
}

export function getGlobals() {
    return { path, yearIteration, isCreateATeam, currentDate };
}
