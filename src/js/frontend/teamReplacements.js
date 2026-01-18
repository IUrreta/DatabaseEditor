import { Command } from "../backend/command.js";

export const names_configs = {
    "visarb": "VISA CASHAPP RB", "toyota": "TOYOTA", "hugo": "HUGO BOSS", "alphatauri": "ALPHA TAURI", "brawn": "BRAWN GP", "porsche": "PORSCHE",
    "alpine": "ALPINE", "renault": "RENAULT", "andretti": "ANDRETTI", "lotus": "LOTUS", "cadillac": "CADILLAC",
    "alfa": "ALFA ROMEO", "audi": "AUDI", "sauber": "SAUBER", "stake": "STAKE SAUBER", "williams": "WILLIAMS", "bmw": "BMW", "haas": "HAAS",
    "redbull": "RED BULL", "ford": "FORD", "aston": "ASTON MARTIN", "racingpoint": "RACING POINT", "jordan": "JORDAN"
};
export const pretty_names = {
    "visarb": "Visa Cashapp RB", "toyota": "Toyota", "hugo": "Hugo Boss", "alphatauri": "Alpha Tauri", "brawn": "Brawn GP", "porsche": "Porsche",
    "alpine": "Alpine", "renault": "Renault", "andretti": "Andretti", "lotus": "Lotus", "cadillac": "Cadillac",
    "alfa": "Alfa Romeo", "audi": "Audi", "sauber": "Sauber", "stake": "Stake Sauber", "williams": "Williams", "bmw": "BMW", "haas": "Haas",
    "redbull": "Red Bull", "ford": "Ford", "aston": "Aston Martin", "racingpoint": "Racing Point", "jordan": "Jordan"
};
export const abreviations_for_replacements = {
    "visarb": "VCARB", "toyota": "TOY", "hugo": "HUGO", "alphatauri": "AT", "brawn": "BGP", "porsche": "POR",
    "alpine": "ALP", "renault": "REN", "andretti": "AND", "lotus": "LOT", "cadillac": "CAD", "alfa": "ALFA", "audi": "AUDI", "sauber": "SAU",
    "stake": "STK", "williams": "WIL", "bmw": "BMW", "haas": "HA", "redbull": "RBR", "ford": "FOR", "aston": "AM", "racingpoint": "RP", "jordan": "JOR"
};
export const logos_configs = {
    "visarb": "../assets/images/visarb.png", "toyota": "../assets/images/toyota.svg", "hugo": "../assets/images/hugoboss.png", "alphatauri": "../assets/images/alphatauri.png",
    "brawn": "../assets/images/brawn.png", "porsche": "../assets/images/porsche.png",
    "alpine": "../assets/images/alpine.png", "renault": "../assets/images/renault.png", "andretti": "../assets/images/andretti.png", "lotus": "../assets/images/lotus.png",
    "cadillac": "../assets/images/cadillac.png", "alfa": "../assets/images/alfaromeo.png", "audi": "../assets/images/audi.png", "sauber": "../assets/images/sauber.svg",
    "stake": "../assets/images/kick.png", "williams": "../assets/images/Williams_2026_logo.svg", "bmw": "../assets/images/bmw.png", "haas": "../assets/images/haas.png",
    "redbull": "../assets/images/redbull.png", "ford": "../assets/images/ford.png", "aston": "../assets/images/astonMartin.png", "racingpoint": "../assets/images/racingpoint.png",
    "jordan": "../assets/images/jordan.png"
};
export const logos_classes_configs = {
    "visarb": "visarblogo", "toyota": "toyotalogo", "hugo": "hugologo", "alphatauri": "alphataurilogo",
    "porsche": "porschelogo", "brawn": "brawnlogo",
    "alpine": "alpinelogo", "renault": "renaultlogo", "andretti": "andrettilogo", "lotus": "lotuslogo", "cadillac": "cadillaclogo",
    "alfa": "alfalogo", "audi": "audilogo", "sauber": "sauberlogo", "stake": "alfalogo",
    "williams": "williamslogo", "bmw": "bmwlogo", "redbull": "redbulllogo", "ford": "fordlogo", "aston": "astonlogo",
    "racingpoint": "racingpointlogo", "jordan": "jordanlogo", "haas": "haaslogo"
};

function updateTeamMenuClass(selector, info) {
    document.querySelectorAll(selector).forEach(function (elem) {
        Array.from(elem.classList).forEach(function (cl) {
            if (cl.startsWith("changable-team-menu-")) {
                elem.classList.remove(cl);
            }
        });
        elem.classList.add("changable-team-menu-" + info);
    });
}

function updateTeamColors({
    baseKey,
    info,
    primaryId,
    secondaryId,
    edit_colors_dict,
    change_css_variables
}) {
    if (info !== baseKey) {
        let baseVarName = `--${baseKey}-primary`;
        let newVarName = `--${info}-primary`;
        change_css_variables(baseVarName, newVarName);
        let value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        edit_colors_dict(primaryId, value);
        baseVarName = `--${baseKey}-secondary`;
        newVarName = `--${info}-secondary`;
        change_css_variables(baseVarName, newVarName);
        value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        edit_colors_dict(secondaryId, value);
        baseVarName = `--${baseKey}-primary-transparent`;
        newVarName = `--${info}-primary-transparent`;
        change_css_variables(baseVarName, newVarName);
        baseVarName = `--${baseKey}-secondary-transparent`;
        newVarName = `--${info}-secondary-transparent`;
        change_css_variables(baseVarName, newVarName);
        return;
    }

    let baseVarName = `--${baseKey}-primary`;
    let newVarName = `--${baseKey}-original`;
    change_css_variables(baseVarName, newVarName);
    let value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
    edit_colors_dict(primaryId, value);
    baseVarName = `--${baseKey}-secondary`;
    newVarName = `--${baseKey}-secondary-original`;
    change_css_variables(baseVarName, newVarName);
    value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
    edit_colors_dict(secondaryId, value);
    baseVarName = `--${baseKey}-primary-transparent`;
    newVarName = `--${baseKey}-primary-transparent-original`;
    change_css_variables(baseVarName, newVarName);
    baseVarName = `--${baseKey}-secondary-transparent`;
    newVarName = `--${baseKey}-secondary-transparent-original`;
    change_css_variables(baseVarName, newVarName);
}

function replaceTeam(config, info, deps) {
    const { combined_dict, abreviations_dict, edit_colors_dict, change_css_variables } = deps;
    document.querySelector(config.buttonSelector).querySelector("button span").textContent = names_configs[info];
    document.querySelector(config.buttonSelector).querySelector("button").dataset.value = info;
    combined_dict[config.teamId] = pretty_names[info];
    abreviations_dict[config.teamId] = abreviations_for_replacements[info];
    const command = new Command("updateCombinedDict", { teamID: config.teamId, newName: pretty_names[info] });
    command.execute();
    document.querySelectorAll(config.teamNameSelector).forEach(function (elem) {
        elem.dataset.teamshow = pretty_names[info];
    });
    config.updateNames(info);
    config.updateLogos(info);
    updateTeamColors({
        baseKey: config.baseKey,
        info,
        primaryId: config.primaryColorId,
        secondaryId: config.secondaryColorId,
        edit_colors_dict,
        change_css_variables
    });
    updateTeamMenuClass(config.teamMenuSelector, info);
}

export function createTeamReplacers(deps) {
    const alphaConfig = {
        buttonSelector: "#alphaTauriReplaceButton",
        teamId: 8,
        teamNameSelector: ".at-teamname",
        teamMenuSelector: ".team-menu-alphatauri-replace",
        baseKey: "alphatauri",
        primaryColorId: "80",
        secondaryColorId: "81",
        updateNames(info) {
            document.querySelectorAll(".at-name").forEach(function (elem) {
                let name = (info === "visarb" && !elem.classList.contains("complete")) ? "VCARB" : names_configs[info];
                if (elem.parentElement.classList.contains("car-title")) {
                    const match = elem.textContent.match(/^(.*?)\s+(\d+\s*-\s*#\d+)/);
                    if (match) {
                        name = (info === "visarb" && !elem.classList.contains("complete")) ? "VCARB" : pretty_names[info];
                        elem.textContent = `${name} ${match[2]}`;
                    }
                }
                else {
                    elem.textContent = name;
                }
            });
        },
        updateLogos(info) {
            if (info !== "alphatauri") {
                document.querySelectorAll(".atlogo-replace").forEach(function (elem) {
                    if (!elem.classList.contains("non-changable")) {
                        let newElem;
                        if (info === "porsche") {
                            newElem = document.createElement("img");
                            newElem.src = logos_configs[info];
                        } else {
                            newElem = document.createElement("div");
                        }
                        newElem.className = elem.className;
                        newElem.classList.remove("alphataurilogo", "toyotalogo", "hugologo", "porschelogo", "visarblogo", "ferrarilogo", "brawnlogo");
                        newElem.classList.add(logos_classes_configs[info]);
                        elem.replaceWith(newElem);
                    }
                    if (elem.classList.contains("secondary")) {
                        if (info !== "toyota") {
                            elem.src = elem.src.slice(0, -4) + "2.png";
                        }
                    }
                });
                return;
            }
            document.querySelectorAll(".atlogo-replace").forEach(function (elem) {
                if (!elem.classList.contains("non-changable")) {
                    elem.src = logos_configs[info];
                    elem.classList.remove("alphataurilogo");
                    elem.classList.remove("toyotalogo");
                    elem.classList.remove("hugologo");
                    elem.classList.remove("porschelogo");
                    elem.classList.remove("visarblogo");
                    elem.classList.remove("ferrarilogo");
                    elem.classList.remove("brawnlogo");
                    elem.classList.add("alphataurilogo");
                }
                if (elem.classList.contains("secondary")) {
                    elem.src = elem.src.slice(0, -4) + "2.png";
                }
            });
        }
    };

    const alpineConfig = {
        buttonSelector: "#alpineReplaceButton",
        teamId: 5,
        teamNameSelector: ".al-teamname",
        teamMenuSelector: ".team-menu-alpine-replace",
        baseKey: "alpine",
        primaryColorId: "50",
        secondaryColorId: "51",
        updateNames(info) {
            document.querySelectorAll(".alpine-name").forEach(function (elem) { 
                let name = names_configs[info];
                if (elem.parentElement.classList.contains("car-title")) {       
                    const match = elem.textContent.match(/^(.*?)\s+(\d+\s*-\s*#\d+)/);
                    if (match) {
                        name = pretty_names[info];
                        elem.textContent = `${name} ${match[2]}`;
                    }
                }
                else {
                    elem.textContent = name;
                }
            });
        },
        updateLogos(info) {
            if (info === "cadillac") {
                document.querySelectorAll(".alpinelogo-replace").forEach(function (elem) {
                    if (!elem.classList.contains("non-changable")) {
                        if (elem.tagName.toLowerCase() !== "img") {
                            const newElem = document.createElement("img");
                            newElem.className = elem.className;
                            elem.replaceWith(newElem);
                            elem = newElem;
                        }
                        elem.src = logos_configs[info];
                        elem.classList.remove("alpinelogo", "andrettilogo", "renaultlogo", "lotuslogo");
                        elem.classList.add(logos_classes_configs[info]);
                    }
                    if (elem.classList.contains("secondary")) {
                        elem.src = elem.src.slice(0, -4) + "2.png";
                    }
                });
                return;
            }
            if (info !== "alpine") {
                document.querySelectorAll(".alpinelogo-replace").forEach(function (elem) {
                    if (!elem.classList.contains("non-changable")) {
                        if (elem.tagName.toLowerCase() === "img") {
                            const newElem = document.createElement("div");
                            newElem.className = elem.className;
                            elem.replaceWith(newElem);
                            elem = newElem;
                        }
                        elem.classList.remove("alpinelogo");
                        elem.classList.remove("andrettilogo");
                        elem.classList.remove("renaultlogo");
                        elem.classList.remove("lotuslogo");
                        elem.classList.remove("cadillaclogo");
                        elem.classList.add(logos_classes_configs[info]);        
                    }
                    if (elem.classList.contains("secondary")) {
                        elem.src = elem.src.slice(0, -4) + "2.png";
                    }
                });
                return;
            }
            document.querySelectorAll(".alpinelogo-replace").forEach(function (elem) {
                if (!elem.classList.contains("non-changable")) {
                    if (elem.tagName.toLowerCase() === "img") {
                        const newElem = document.createElement("div");
                        newElem.className = elem.className;
                        elem.replaceWith(newElem);
                        elem = newElem;
                    }
                    elem.src = logos_configs[info];
                    elem.classList.remove("alpinelogo");
                    elem.classList.remove("andrettilogo");
                    elem.classList.remove("renaultlogo");
                    elem.classList.remove("lotuslogo");
                    elem.classList.remove("cadillaclogo");
                    elem.classList.add("alpinelogo");
                }
                if (elem.classList.contains("secondary")) {
                    elem.src = elem.src.slice(0, -4) + "2.png";
                }
            });
        }
    };

    const williamsConfig = {
        buttonSelector: "#williamsReplaceButton",
        teamId: 6,
        teamNameSelector: ".wi-teamname",
        teamMenuSelector: ".team-menu-williams-replace",
        baseKey: "williams",
        primaryColorId: "60",
        secondaryColorId: "61",
        updateNames(info) {
            document.querySelectorAll(".williams-name").forEach(function (elem) {
                let name = names_configs[info];
                if (elem.parentElement.classList.contains("car-title")) {
                    const match = elem.textContent.match(/^(.*?)\s+(\d+\s*-\s*#\d+)/);
                    if (match) {
                        name = pretty_names[info];
                        elem.textContent = `${name} ${match[2]}`;
                    }
                }
                else {
                    elem.textContent = name;
                }
            });
        },
        updateLogos(info) {
            document.querySelectorAll(".williamslogo-replace").forEach(function (elem) {
                if (!elem.classList.contains("non-changable")) {
                    elem.classList.remove("williamslogo");
                    elem.classList.remove("bmwlogo");
                    elem.classList.add(logos_classes_configs[info]);
                    // bmw logo is a png
                    if (info === "bmw") {
                        //create an img element to replace the div
                        let newElem = document.createElement("img");
                        newElem.src = logos_configs[info];
                        newElem.className = elem.className;
                        elem.replaceWith(newElem);
                    }   else {
                        //if not bmw, make sure it's a div
                        if (elem.tagName.toLowerCase() === "img") {
                            let newElem = document.createElement("div");
                            newElem.className = elem.className;
                            elem.replaceWith(newElem);
                        }
                    }
                }
            });
        }
    };

    const haasConfig = {
        buttonSelector: "#haasReplaceButton",
        teamId: 7,
        teamNameSelector: ".ha-teamname",
        teamMenuSelector: ".team-menu-haas-replace",
        baseKey: "haas",
        primaryColorId: "70",
        secondaryColorId: "71",
        updateNames(info) {
            document.querySelectorAll(".haas-name").forEach(function (elem) {
                let name = names_configs[info];
                if (elem.parentElement.classList.contains("car-title")) {
                    const match = elem.textContent.match(/^(.*?)\s+(\d+\s*-\s*#\d+)/);
                    if (match) {
                        name = pretty_names[info];
                        elem.textContent = `${name} ${match[2]}`;
                    }
                }
                else {
                    elem.textContent = name;
                }
            });
        },
        updateLogos(info) {
            document.querySelectorAll(".haaslogo-replace").forEach(function (elem) {
                if (elem.classList.contains("non-changable")) return;
                const isMaskLogo = info === "toyota";
                if (isMaskLogo) {
                    const newElem = document.createElement("div");
                    newElem.className = elem.className;
                    newElem.classList.remove("haaslogo");
                    newElem.classList.remove("toyotalogo");
                    newElem.classList.add("toyotalogo");
                    elem.replaceWith(newElem);
                    return;
                }

                if (elem.tagName.toLowerCase() !== "img") {
                    const newElem = document.createElement("img");
                    newElem.className = elem.className;
                    elem.replaceWith(newElem);
                    elem = newElem;
                }
                elem.src = logos_configs[info];
                elem.classList.remove("toyotalogo");
                elem.classList.add(logos_classes_configs[info]);
            });
        }
    };

    const alfaConfig = {
        buttonSelector: "#alfaReplaceButton",
        teamId: 9,
        teamNameSelector: ".af-teamname",
        teamMenuSelector: ".team-menu-alfa-replace",
        baseKey: "alfa",
        primaryColorId: "90",
        secondaryColorId: "91",
        updateNames(info) {
            document.querySelectorAll(".alfa-name").forEach(function (elem) {
                let name = names_configs[info];
                if (elem.parentElement.classList.contains("car-title")) {
                    const match = elem.textContent.match(/^(.*?)\s+(\d+\s*-\s*#\d+)/);
                    if (match) {
                        name = pretty_names[info];
                        elem.textContent = `${name} ${match[2]}`;
                    }
                }
                else {
                    elem.textContent = name;
                }
            });
        },
        updateLogos(info) {
            if (info !== "alfa") {
                document.querySelectorAll(".alfalogo-replace").forEach(function (elem) {
                    if (!elem.classList.contains("non-changable")) {
                        const isMaskLogo = info === "sauber";
                        if (isMaskLogo) {
                            const newElem = document.createElement("div");
                            newElem.className = elem.className;
                            newElem.classList.remove("alfaromeologo");
                            newElem.classList.remove("audilogo");
                            newElem.classList.remove("sauberlogo");
                            newElem.classList.add(logos_classes_configs[info]);
                            elem.replaceWith(newElem);
                            return;
                        }

                        if (elem.tagName.toLowerCase() !== "img") {
                            const newElem = document.createElement("img");
                            newElem.className = elem.className;
                            elem.replaceWith(newElem);
                            elem = newElem;
                        }
                        elem.src = logos_configs[info];
                        elem.classList.remove("alfaromeologo");
                        elem.classList.remove("audilogo");
                        elem.classList.remove("sauberlogo");
                        elem.classList.add(logos_classes_configs[info]);
                    }
                });
                return;
            }
            document.querySelectorAll(".alfalogo-replace").forEach(function (elem) {
                if (!elem.classList.contains("non-changable")) {
                    if (elem.tagName.toLowerCase() !== "img") {
                        const newElem = document.createElement("img");
                        newElem.className = "alfalogo-replace alfalogo";
                        newElem.src = logos_configs[info];
                        elem.replaceWith(newElem);
                        return;
                    }
                    elem.src = logos_configs[info];
                    elem.className = "alfalogo-replace alfalogo";
                }
            });
        }
    };

    const redbullConfig = {
        buttonSelector: "#redbullReplaceButton",
        teamId: 3,
        teamNameSelector: ".rb-teamname",
        teamMenuSelector: ".team-menu-redbull-replace",
        baseKey: "redbull",
        primaryColorId: "30",
        secondaryColorId: "31",
        updateNames(info) {
            document.querySelectorAll(".redbull-name").forEach(function (elem) {
                let name = names_configs[info];
                if (elem.parentElement.classList.contains("car-title")) {
                    const match = elem.textContent.match(/^(.*?)\s+(\d+\s*-\s*#\d+)/);
                    if (match) {
                        name = pretty_names[info];
                        elem.textContent = `${name} ${match[2]}`;
                    }
                }
                else {
                    if (elem.classList.contains("complete") && info === "redbull") {
                        name = "RED BULL RACING";
                    }
                    elem.textContent = name;
                }
            });
        },
        updateLogos(info) {
            document.querySelectorAll(".redbulllogo-replace").forEach(function (elem) {
                if (!elem.classList.contains("non-changable")) {
                    if (elem.tagName.toLowerCase() !== "img") {
                        const newElem = document.createElement("img");
                        newElem.className = elem.className;
                        elem.replaceWith(newElem);
                        elem = newElem;
                    }
                    elem.src = logos_configs[info];
                    elem.classList.remove("redbulllogo", "fordlogo");
                    elem.classList.add(logos_classes_configs[info]);
                }
            });
        }
    };

    const astonConfig = {
        buttonSelector: "#astonReplaceButton",
        teamId: 10,
        teamNameSelector: ".as-teamname",
        teamMenuSelector: ".team-menu-aston-replace",
        baseKey: "aston",
        primaryColorId: "100",
        secondaryColorId: "101",
        updateNames(info) {
            document.querySelectorAll(".aston-name").forEach(function (elem) {
                let name = names_configs[info];
                if (elem.parentElement.classList.contains("car-title")) {
                    const match = elem.textContent.match(/^(.*?)\s+(\d+\s*-\s*#\d+)/);
                    if (match) {
                        name = pretty_names[info];
                        elem.textContent = `${name} ${match[2]}`;
                    }
                }
                else {
                    elem.textContent = name;
                }
            });
        },
        updateLogos(info) {
            document.querySelectorAll(".astonlogo-replace").forEach(function (elem) {
                if (!elem.classList.contains("non-changable")) {
                    if (elem.tagName.toLowerCase() !== "img") {
                        const newElem = document.createElement("img");
                        newElem.className = elem.className;
                        elem.replaceWith(newElem);
                        elem = newElem;
                    }
                    elem.src = logos_configs[info];
                    elem.classList.remove("astonlogo", "racingpointlogo", "jordanlogo");
                    elem.classList.add(logos_classes_configs[info]);
                }
            });
        }
    };

    return {
        replaceTeam,
        alphaTauriReplace(info) {
            replaceTeam(alphaConfig, info, deps);
        },
        alpineReplace(info) {
            replaceTeam(alpineConfig, info, deps);
        },
        williamsReplace(info) {
            replaceTeam(williamsConfig, info || "williams", deps);        
        },
        haasReplace(info) {
            replaceTeam(haasConfig, info || "haas", deps);
        },
        alfaReplace(info) {
            replaceTeam(alfaConfig, info, deps);
        },
        redbullReplace(info) {
            replaceTeam(redbullConfig, info, deps);
        },
        astonReplace(info) {
            replaceTeam(astonConfig, info, deps);
        }
    };
}
