// calendar
export let codes_dict = {
    "bah0": "../assets/images/bahrain.png", "sau0": "../assets/images/saudi.jpg", "aus0": "../assets/images/australia.png", "aze0": "../assets/images/azerbaiyan.png",
    "mia0": "../assets/images/usa.png", "imo0": "../assets/images/italy.png", "mon0": "../assets/images/monaco.png", "spa0": "../assets/images/spain.png", "can0": "../assets/images/canada.png",
    "aut0": "../assets/images/austria.png", "gbr0": "../assets/images/gbr.png", "hun0": "../assets/images/hungry.png", "bel0": "../assets/images/balgium.png", "ned0": "../assets/images/ned.png",
    "ita0": "../assets/images/italy.png", "jap0": "../assets/images/japan.png", "sgp0": "../assets/images/singapore.png", "qat0": "../assets/images/qatar.png", "usa0": "../assets/images/usa.png", "mex0": "../assets/images/mexico.png",
    "bra0": "../assets/images/brazil.png", "veg0": "../assets/images/usa.png", "uae0": "../assets/images/uae.png", "chi0": "../assets/images/china.png"
}
export let countries_dict = {
    "bah0": "Bahrain", "sau0": "Saudi Arabia", "aus0": "Australia", "aze0": "Azerbaijan",
    "mia0": "Miami", "imo0": "Imola", "mon0": "Monaco", "spa0": "Spain", "can0": "Canada",
    "aut0": "Austria", "gbr0": "United Kingdom", "hun0": "Hungary", "bel0": "Belgium", "ned0": "Netherlands",
    "ita0": "Italy", "sgp0": "Singapore", "jap0": "Japan", "qat0": "Qatar", "usa0": "USA", "mex0": "Mexico",
    "bra0": "Brazil", "veg0": "Vegas", "uae0": "Abu Dhbai", "chi0": "China"
};

export let weather_dict = {
    0: "bi bi-sun", 1: "bi bi-cloud-sun", 2: "bi bi-cloud", 3: "bi bi-cloud-drizzle", 4: "bi bi-cloud-rain", 5: "bi bi-cloud-rain-heavy"
}

//h2h
export const lightColors = ["#f1f1f1", "#47c7fc", "#ffd300", "#6CD3BF", "#fcfcfc", "#37BEDD", "#B6BABD", "#c3dc00", "#d0e610", "#fac51c", "#b09247", "#f7c82f"]
export const default_dict = {
    1: "Ferrari",
    2: "McLaren",
    3: "Red Bull",
    4: "Mercedes",
    5: "Alpine",
    6: "Williams",
    7: "Haas",
    8: "Alpha Tauri",
    9: "Alfa Romeo",
    10: "Aston Martin",
    32: "Custom Team"
}

export let combined_dict = {
    1: "Ferrari",
    2: "McLaren",
    3: "Red Bull",
    4: "Mercedes",
    5: "Alpine",
    6: "Williams",
    7: "Haas",
    8: "Alpha Tauri",
    9: "Alfa Romeo",
    10: "Aston Martin",
    11: "Prema Racing (F2)",
    12: "Virtuosi Racing (F2)",
    13: "Carlin (F2)",
    14: "Hitech GP (F2)",
    15: "ART Grand Prix (F2)",
    16: "MP Motorsport (F2)",
    17: "PHM Racing (F2)",
    18: "DAMS (F2)",
    19: "Campos Racing (F2)",
    20: "VAR Racing (F2)",
    21: "Trident (F2)",
    22: "Prema Racing (F3)",
    23: "Trident (F3)",
    24: "ART Grand Prix (F3)",
    25: "Hitech GP (F3)",
    26: "VAR Racing (F3)",
    27: "MP Motorsport (F3)",
    28: "Campos Racing (F3)",
    29: "Carlin (F3)",
    30: "Jenzzer Motorsport (F3)",
    31: "PHM Racing (F3)",
    32: "Custom Team"
}

export function getUpdatedName(teamId) {
    return combined_dict[teamId]
}

export function getCombinedDict() {
    return combined_dict
}

//performance
export const pars_abreviations = { "chassis": "C", "front_wing": "FW", "rear_wing": "RW", "underfloor": "UF", "sidepods": "SP", "suspension": "S" }
export const part_codes_abreviations = { 3: "C", 4: "FW", 5: "RW", 6: "UF", 7: "SP", 8: "S" }
export const part_full_names = { 3: "Chassis", 4: "Front Wing", 5: "Rear Wing", 6: "Underfloor", 7: "Sidepods", 8: "Suspension" }

export let abreviations_dict = {
    1: "FE",
    2: "MC",
    3: "RB",
    4: "MER",
    5: "ALP",
    6: "WIL",
    7: "HA",
    8: "AT",
    9: "ALFA",
    10: "AM",
    32: "CUS"
}

export let engine_stats_dict = new Map([
    [10, "Power"],
    [6, "Fuel efficiency"],
    [11, "Performance threshold"],
    [12, "Performance loss"],
    [14, "Engine durability"],
    [18, "ERS durability"],
    [19, "Gearbox durability"]
]);

export const theme_colors = {
    "default-theme": {
        "labels": "#dedde6",
        "grid": "#292929",
        "general_secondary": "#f1f1f1",
    },
    "light-theme": {
        "labels": "#252525",
        "grid": "#d6d6d6",
        "general_secondary": "#1f1f1f",
    },
    "og-theme": {
        "labels": "#dedde6",
        "grid": "#323046",
        "general_secondary": "#f1f1f1",
    },
    "vaporwave-theme": {
        "labels": "#dedde6",
        "grid": "#5329b5",
        "general_secondary": "#f1f1f1",
    }
}

//predictions
export const names_full = {
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
    "QAT": "Qatar",
    "CHI": "China"
};

//seasonViewer
export let driversTableLogosDict = {
    "stake": "logo-stake-table", "audi": "logo-up-down-extra", "alfa": "logo-merc-table", "sauber": "logo-sauber-table", "visarb": "logo-visarb-table", "hugo": "logo-hugo-table",
    "brawn": "logo-brawn-table", "toyota": "logo-toyota-table", "alphatauri": "logo-alphatauri-table", "porsche": "logo-porsche-table",
    "renault": "logo-renault-table", "andretti": "logo-andretti-table", "lotus": "logo-lotus-table", "alpine": "logo-alpine-table",
    "cadillac": "logo-cadillac-table", "ford": "logo-ford-table", "racingpoint": "logo-racingpoint-table", "jordan": "logo-jordan-table"
}

export const races_map = { 2: "bah0", 1: "aus0", 11: "sau0", 24: "imo0", 22: "mia0", 5: "spa0", 6: "mon0", 4: "aze0", 7: "can0", 10: "gbr0", 9: "aut0", 8: "fra0", 12: "hun0", 13: "bel0", 14: "ita0", 15: "sgp0", 17: "jap0", 19: "usa0", 18: "mex0", 20: "bra0", 21: "uae0", 23: "ned0", 25: "veg0", 26: "qat0", 3: "chi0" };
export const invertedRacesMap = { "bah0": 2, "aus0": 1, "sau0": 11, "imo0": 24, "mia0": 22, "spa0": 5, "mon0": 6, "aze0": 4, "can0": 7, "gbr0": 10, "aut0": 9, "fra0": 8, "hun0": 12, "bel0": 13, "ita0": 14, "sgp0": 15, "jap0": 17, "usa0": 19, "mex0": 18, "bra0": 20, "uae0": 21, "ned0": 23, "veg0": 25, "qat0": 26, "chi0": 3 };
export const races_names = { 2: "BAH", 1: "AUS", 11: "SAU", 24: "IMO", 22: "MIA", 5: "SPA", 6: "MON", 4: "AZE", 7: "CAN", 10: "GBR", 9: "AUT", 8: "FRA", 12: "HUN", 13: "BEL", 14: "ITA", 15: "SGP", 17: "JAP", 19: "USA", 18: "MEX", 20: "BRA", 21: "UAE", 23: "NED", 25: "VEG", 26: "QAT", 3: "CHI" };
export const contintntRacesRegions = {
    "Europe": [24, 5, 6, 10, 9, 12, 13, 14, 23],
    "Asia": [17, 3, 15, 1],
    "America": [19, 20, 18, 25, 22],
    "Middle East": [2, 11, 21, 26, 4],
}
export const continentDict = {
    24: "Europe", 5: "Europe", 6: "Europe", 10: "Europe", 9: "Europe", 8: "Europe", 12: "Europe", 13: "Europe", 14: "Europe", 23: "Europe",
    17: "Asia", 3: "Asia", 15: "Asia", 1: "Asia",
    19: "America", 20: "America", 18: "America", 25: "America", 22: "America",
    2: "Middle East", 11: "Middle East", 21: "Middle East", 26: "Middle East", 4: "Middle East"
}
export const teams_full_name_dict = { 'FERRARI': 1, 'MCLAREN': 2, 'RED BULL': 3, 'MERCEDES': 4, 'ALPINE': 5, 'WILLIAMS': 6, 'HAAS': 7, 'ALPHA TAURI': 8, 'ALFA ROMEO': 9, 'ASTON MARTIN': 10 }
export let logos_disc = {
    1: '../assets/images/ferrari.png',
    2: '../assets/images/mclaren.png',
    3: '../assets/images/redbull.png',
    4: '../assets/images/mercedes.png',
    5: '../assets/images/alpine.png',
    6: '../assets/images/Williams_2026_logo.svg',
    7: '../assets/images/haas.png',
    8: '../assets/images/alphatauri.png',
    9: '../assets/images/alfaromeo.png',
    10: '../assets/images/astonMartin.png',
    11: '../assets/images/prema.png',
    12: '../assets/images/invicta.png',
    13: '../assets/images/carlin.png',
    14: '../assets/images/hitech.png',
    15: '../assets/images/art.png',
    16: '../assets/images/mp.png',
    17: '../assets/images/phm.png',
    18: '../assets/images/dams.png',
    19: '../assets/images/campos.png',
    20: '../assets/images/var.png',
    21: '../assets/images/trident.png',
    22: '../assets/images/prema.png',
    23: '../assets/images/trident.png',
    24: '../assets/images/art.png',
    25: '../assets/images/hitech.png',
    26: '../assets/images/var.png',
    27: '../assets/images/mp.png',
    28: '../assets/images/campos.png',
    29: '../assets/images/carlin.png',
    30: '../assets/images/jenzer.png',
    31: '../assets/images/phm.png',
    32: '../assets/images/placeholder.png'
};



export const points_race = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, "DNF": 0
}
export const points_sprint = {
    1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1,
    9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, "-1": 0
}
export let default_points = ["25", "18", "15", "12", "10", "8", "6", "4", "2", "1", "DNF", "0", "", "-"]

//stats
export let typeStaff_dict = { 0: "fulldriverlist", 1: "fullTechnicalList", 2: "fullEngineerList", 3: "fullAeroList", 4: "fullDirectorList" }
export let mentality_dict = { 0: "enthusiastic", 1: "positive", 2: "neutral", 3: "negative", 4: "demoralized" }
export let teamOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 32, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
export const mentality_bonuses = { 0: 7, 1: 4, 2: 0, 3: -2, 4: -6 }
export const mentalityModifiers = {
    5: -8,
    9: -7,
    15: -6,
    20: -5,
    24: -4,
    29: -3,
    35: -2,
    39: -1,
    59: 0,
    63: 1,
    69: 2,
    77: 3,
    79: 4,
    83: 5,
    85: 6,
    96: 7,
    100: 8
};
export const mentality_to_global_menatality = {
    0: 95,
    1: 79,
    2: 59,
    3: 24,
    4: 5,
}

//transfers
export const f1_teams = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 32]
export const f2_teams = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
export const f3_teams = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
export const staff_positions = { 1: "technical-chief", 2: "race-engineer", 3: "head-aero", 4: "sporting-director" }
export const staff_pics = { 1: "../assets/images/technicalChief.png", 2: "../assets/images/raceEngineer2.png", 3: "../assets/images/headAero.png", 4: "../assets/images/sportingDirector.png" }
export let team_dict = { 1: "fe", 2: "mc", 3: "rb", 4: "me", 5: "al", 6: "wi", 7: "ha", 8: "at", 9: "af", 10: "as", 11: "pre", 12: "vir", 13: "car", 14: "hit", 15: "art", 16: "mp", 17: "phm", 18: "dam", 19: "cam", 20: "var", 21: "tri", 22: "pre", 23: "tri", 24: "art", 25: "hit", 26: "var", 27: "mp", 28: "cam", 29: "car", 30: "jen", 31: "phm", 32: "ct", 33: "f2", 34: "f3" }
export let inverted_dict = { 'ferrari': 1, 'mclaren': 2, 'redbull': 3, 'merc': 4, 'alpine': 5, 'williams': 6, 'haas': 7, 'alphatauri': 8, 'alfaromeo': 9, 'astonmartin': 10, 'custom': 32 }


// news
export const countries_data = {
    "BAH": { "country": "Bahrain", "adjective": "Bahrain", "circuit": "Bahrain" },
    "AUS": { "country": "Australia", "adjective": "Australian", "circuit": "Albert Park" },
    "SAU": { "country": "Saudi Arabia", "adjective": "Saudi Arabian", "circuit": "Jeddah" },
    "IMO": { "country": "Imola", "adjective": "Emilia Romagna", "circuit": "Imola" },
    "MIA": { "country": "Miami", "adjective": "Miami", "circuit": "Miami" },
    "SPA": { "country": "Spain", "adjective": "Spanish", "circuit": "Barcelona" },
    "MON": { "country": "Monaco", "adjective": "Monaco", "circuit": "Monaco" },
    "AZE": { "country": "Azerbaijan", "adjective": "Azerbaijan", "circuit": "Baku" },
    "CAN": { "country": "Canada", "adjective": "Canadian", "circuit": "Montreal" },
    "GBR": { "country": "Great Britain", "adjective": "British", "circuit": "Silverstone" },
    "AUT": { "country": "Austria", "adjective": "Austrian", "circuit": "Red Bull Ring" },
    "FRA": { "country": "France", "adjective": "French", "circuit": "Paul Ricard" },
    "HUN": { "country": "Hungary", "adjective": "Hungarian", "circuit": "Hungaroring" },
    "BEL": { "country": "Belgium", "adjective": "Belgian", "circuit": "Spa" },
    "ITA": { "country": "Italy", "adjective": "Italian", "circuit": "Monza" },
    "SGP": { "country": "Singapore", "adjective": "Singapore", "circuit": "Marina Bay" },
    "JAP": { "country": "Japan", "adjective": "Japanese", "circuit": "Suzuka" },
    "USA": { "country": "United States", "adjective": "United States", "circuit": "COTA" },
    "MEX": { "country": "Mexico", "adjective": "Mexican", "circuit": "Mexico City" },
    "BRA": { "country": "Brazil", "adjective": "Brazilian", "circuit": "Interlagos" },
    "UAE": { "country": "Abu Dhabi", "adjective": "Abu Dhabi", "circuit": "Yas Marina" },
    "NED": { "country": "Netherlands", "adjective": "Netherlands", "circuit": "Zandvoort" },
    "VEG": { "country": "Vegas", "adjective": "Vegas", "circuit": "Las Vegas" },
    "QAT": { "country": "Qatar", "adjective": "Qatar", "circuit": "Lusail" },
    "CHI": { "country": "China", "adjective": "Chinese", "circuit": "Shanghai" }
};

export function getParamMap(data) {
    return {
        1: {
            pole_driver: data.pole_driver,
            season_year: data.seasonYear,
            circuit: data.circuit,
            country: data.country,
            adjective: data.adjective
        },
        2: {
            winner: data.winnerName,
            season_year: data.seasonYear,
            circuit: data.circuit,
            country: data.country,
            adjective: data.adjective
        },
        4: {
            driver1: data.driver1,
            driver2: data.driver2,
            driver3: data.driver3,
            team1: data.team1,
            team2: data.team2,
            team3: data.team3
        },
        6: {
            driver1: data.driver1,
            team1: data.team1,
            team2: data.team2,
            season_year: data.season_year
        },
        7: {
            driver1: data.driver1,
            team1: data.team1
        },
        8: {
            driver_name: data.driver_name,
            circuit: data.circuit,
            country: data.country,
            adjective: data.adjective,
            season_year: data.season_year
        },
        9: {
            driver_name: data.driver_name,
            circuit: data.circuit,
            country: data.country,
            adjective: data.adjective,
            season_year: data.season_year
        },
        10: {
            driver1: data.driver1,
            team1: data.team1
        },
        11: {
            team1: data.teamId,
        },
        12: {
            team1: data.teamId,
        },
        13: {
            driver1: data.driver1,
            driver2: data.driver2,
            team: data.team
        },
        14: {
            driver1: data.driver1,
            driver2: data.driver2
        },
        15: {
            season_year: data.season,
            driver1: data.driver1,
        },
        16: {
            happy_driver: data.randomHappyDriver?.name,
            unhappy_driver: data.randomUnHappyDriver?.name,
            happy_team: data.happyTeam,
            unhappy_team: data.unhappyTeam,
            circuit: data.circuit,
            country: data.country,
            adjective: data.adjective
        },
        17: {
            driver1: data.driver1,
            team1: data.team1,
            season_year: data.season_year
        },
        18: {
            driver1: data.driver1,
            team2: data.team2
        },
        19: {
            season_year: data.season_year
        },
        20: {
            f2_champion: data.f2_champion,
            f3_champion: data.f3_champion,
            season_year: data.season_year
        },
        100: {
            component: data.component
        },
        101: {
            team: data.team,
            driver_out: data.driver_out?.name ?? "",
            driver_in: data.driver_in?.name ?? ""
        },
        102: {
            team: data.teamName,
            country: data.country,
            amount: data.investmentAmount,
            share: data.investmentShare
        },
        103: {
            team: data.team,
            adjective: data.adjective,
            component: data.component,
            country: data.country,
            circuit: data.circuit
        },
        105: {
            original_race: data.originalCountry,
            substitute_race: data.substituteCountry,
            reason: data.reason
        },
        106: {
            driver: data.driver_affected?.name ?? "",
            team: data.team ?? "",
            next_race:
                data.condition?.races_affected?.[0]?.country ??
                data.condition?.expectedReturnCountry ??
                "",
            condition:
                data.condition?.condition ??
                data.condition?.type ??
                "",
            reserve_driver: data.reserve_driver?.name ?? "",
            reason: data.condition?.reason ?? "",
            races_affected_count: Array.isArray(data.condition?.races_affected)
                ? data.condition.races_affected.length
                : 0,
            expected_return: data.condition?.expectedReturnCountry ?? "",
            end_date: data.condition?.end_date ?? ""
        },
        107: {
            type: data.changeType ?? "",
            change_area: data.mainChangeArea ?? ""
        },
        108: {
            driver1: data.driver1,
            driver2: data.driver2,
            driver3: data.driver3
        }
    };
}

export const opinionDict = {
    "0": "Positive",
    "1": "Neutral",
    "2": "Negative"
}


// renderer
export const difficultyConfig = {
    "default": {
        visible: ["defaultDif"],
        lightDif: { className: "dif-warning", text: "" },
        researchDif: { className: "dif-warning", text: "" },
        statDif: { className: "dif-warning", text: "" },
        designTimeDif: { className: "dif-warning", text: "" },
        buildDif: { className: "dif-warning", text: "" }
    },
    "reduced weight": {
        visible: ["lightDif"],
        lightDif: { className: "dif-warning extra-hard", text: "Lightweight parts" },
    },
    "extra-hard": {
        visible: ["lightDif", "researchDif", "statDif"],
        lightDif: { className: "dif-warning extra-hard", text: "Lightweight parts" },
        researchDif: { className: "dif-warning extra-hard", text: "Small research boost" },
        statDif: { className: "dif-warning extra-hard", text: "Stats boost +0.5%" },
    },
    "brutal": {
        visible: ["lightDif", "researchDif", "statDif", "designTimeDif"],
        lightDif: { className: "dif-warning extra-hard", text: "Lightweight parts" },
        researchDif: { className: "dif-warning brutal", text: "Moderate research boost" },
        statDif: { className: "dif-warning brutal", text: "Stats boost +0.8%" },
        designTimeDif: { className: "dif-warning brutal", text: "Design times reduced 5%" },
    },
    "unfair": {
        visible: ["lightDif", "researchDif", "statDif", "designTimeDif"],
        lightDif: { className: "dif-warning extra-hard", text: "Lightweight parts" },
        researchDif: { className: "dif-warning unfair", text: "Large research boost" },
        statDif: { className: "dif-warning unfair", text: "Stats boost +1.5%" },
        designTimeDif: { className: "dif-warning unfair", text: "Design times reduced 11%" },
    },
    "insane": {
        visible: ["lightDif", "researchDif", "statDif", "designTimeDif", "buildDif"],
        lightDif: { className: "dif-warning extra-hard", text: "Lightweight parts" },
        researchDif: { className: "dif-warning insane", text: "Huge research boost" },
        statDif: { className: "dif-warning insane", text: "Stats boost +2%" },
        designTimeDif: { className: "dif-warning insane", text: "Design times reduced 16%" },
        buildDif: { className: "dif-warning insane", text: "+1 part when design completed" },
    },
    "impossible": {
        visible: ["lightDif", "researchDif", "statDif", "designTimeDif", "buildDif"],
        lightDif: { className: "dif-warning impossible", text: "ULTRA-lightweight parts" },
        researchDif: { className: "dif-warning impossible", text: "Massive research boost" },
        statDif: { className: "dif-warning impossible", text: "Stats boost +3%" },
        designTimeDif: { className: "dif-warning impossible", text: "Design times reduced 20%" },
        buildDif: { className: "dif-warning impossible", text: "+2 parts when design completed" },
    }
};

export const weightDifConfig = {0 : {text: "Disabled", className: "disabled"}, 1 : {text: "Lightweight parts", className: "extra-hard"},
        5 : {text: "ULTRA Lightweight parts", className: "impossible"}}

export const defaultDifficultiesConfig = {0 : {text: "Disabled", className: "disabled"}, 1 : {text: "Extra Hard", className: "extra-hard"},
        2 : {text: "Brutal", className: "brutal"}, 3 : {text: "Unfair", className: "unfair"},
        4 : {text: "Insane", className: "insane"}, 5 : {text: "Impossible", className: "impossible"}}

export const defaultTurningPointsFrequencyPreset = 2;

export const turningPointsFrequencyLabels = [
    "Much less",
    "Less",
    "Default",
    "More",
    "Most"
];

export const turningPointsTuningByType = {
    dsq: {
        chance: [0.02, 0.05, 0.08, 0.15, 0.25],
        max: [1, 1, 2, 3, 4],
    },
    midSeasonTransfers: {
        chance: [0.15, 0.3, 0.5, 0.7, 0.9],
        max: [1, 2, 3, 3, 3],
    },
    technicalDirective: {
        chance: [0.1, 0.25, 0.4, 0.6, 0.8],
        max: [1, 1, 2, 2, 2],
    },
    investment: {
        chance: [0.02, 0.05, 0.1, 0.2, 0.35],
        max: [1, 1, 1, 2, 3],
    },
    raceSubstitution: {
        chance: [0.02, 0.05, 0.1, 0.2, 0.35],
        max: [1, 1, 1, 2, 3],
    },
    injury: {
        chance: [0.05, 0.12, 0.2, 0.35, 0.5],
        max: [1, 1, 2, 3, 3],
    },
    engineRegulation: {
        chance: [0.15, 0.3, 0.5, 0.75, 0.9],
        max: [1, 1, 1, 1, 1],
    },
    youngDrivers: {
        chance: [0.25, 0.5, 1, 1, 1],
        max: [1, 1, 1, 1, 1],
    },
};
