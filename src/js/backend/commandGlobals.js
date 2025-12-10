// commandGlobals.js

/**
 * Dictionary mapping original team names to their display names.
 * @type {Object.<string, string>}
 */
export const teamReplaceDict = {
    "Alpha Tauri": "Alpha Tauri", "Alpine": "Alpine", "Alfa Romeo": "Alfa Romeo", "Aston Martin": "Aston Martin",
    "Ferrari": "Ferrari", "Haas": "Haas", "McLaren": "McLaren", "Mercedes": "Mercedes",
    "Red Bull": "Red Bull", "Williams": "Williams", "Renault": "Renault", "F2": "Formula 2", "F3": "Formula 3", "Custom Team": "Custom Team"
};

/**
 * Dictionary mapping internal team keys to pretty display names.
 * @type {Object.<string, string>}
 */
export const prettyNames = {
    "visarb": "Visa Cashapp RB", "toyota": "Toyota", "hugo": "Hugo Boss", "alphatauri": "Alpha Tauri", "brawn": "Brawn GP", "porsche": "Porsche",
    "alpine": "Alpine", "renault": "Renault", "andretti": "Andretti", "lotus": "Lotus", "alfa": "Alfa Romeo",
    "audi": "Audi", "sauber": "Sauber", "stake": "Stake Sauber"
};

let path = null;
let yearIteration = null;
let isCreateATeam = false;
let currentDate = null;

/**
 * Sets global variables for the application state.
 * @param {Object} params - The parameters to set.
 * @param {string} [params.dbPath] - The path to the database.
 * @param {string} [params.year] - The current year iteration.
 * @param {boolean} [params.createTeam] - Flag indicating if a team is being created.
 * @param {string} [params.date] - The current date in the game.
 */
export function setGlobals({dbPath, year, createTeam, date }) {
    path = dbPath || path;
    yearIteration = year || yearIteration;
    isCreateATeam = createTeam || isCreateATeam;
    currentDate = date || currentDate;
}

/**
 * Retrieves the global variables.
 * @returns {Object} An object containing the global state: path, yearIteration, isCreateATeam, and currentDate.
 */
export function getGlobals() {
    return { path, yearIteration, isCreateATeam, currentDate };
}
