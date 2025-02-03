export const stats = {
    0: "airflow_front",
    1: "airflow_sensitivity",
    2: "brake_cooling",
    3: "drs_delta",
    4: "drag_reduction",
    5: "engine_cooling",
    6: "fuel_efficiency",
    7: "low_speed_downforce",
    8: "medium_speed_downforce",
    9: "high_speed_downforce",
    10: "power",
    11: "performance_loss",
    12: "performance_threshold",
    13: "airflow_middle",
    14: "operational_range",
    15: "lifespan",
    16: "special_weight"
};

export const defaultPartsStats = {
    3: [3, 4, 5, 13, 15],
    4: [0, 1, 2, 7, 8, 9, 15],
    5: [1, 3, 4, 7, 8, 9, 15],
    6: [0, 4, 5, 13, 15],
    7: [1, 4, 7, 8, 9, 15],
    8: [0, 2, 4, 7, 8, 9, 15]
};

export const unitValueToValue = {
    0: (x) => x * 10,
    1: (x) => x * 10,
    2: (x) => x * 10,
    3: (x) => x * 10,
    4: (x) => x * 10,
    5: (x) => x * 10,
    6: (x) => (x - 90) * 1000 / 10,
    7: (x) => (x - 3) / 0.002,
    8: (x) => (x - 5) / 0.002,
    9: (x) => (x - 7) / 0.001,
    10: (x) => (x - 90) * 1000 / 10,
    11: (x) => (85 - x) * 1000 / 20,
    12: (x) => (x - 70) * 1000 / 15,
    13: (x) => x * 10,
    14: (x) => (85 - x) * 1000 / 15,
    15: (x) => (x - 40) * 1000 / 30,
    18: (x) => (x - 40) * 1000 / 30,
    19: (x) => (x - 40) * 1000 / 30
};

export const downforce24UnitValueToValue = {
    7: (x) => 497.6 * x - 1489.8,
    8: (x) => 496.8 * x - 2479.5,
    9: (x) => 974.048 * x - 6803.2614
};

export const parts = {
    0: "engine",
    3: "chassis",
    4: "front_wing",
    5: "rear_wing",
    6: "sidepods",
    7: "underfloor",
    8: "suspension"
};

export const standardWeightPerPart = {
    3: 5150,
    4: 2625,
    5: 3125,
    6: 4125,
    7: 3550,
    8: 2900
};

export const standardBuildworkPerPart = {
    3: 2000,
    4: 500,
    5: 500,
    6: 1500,
    7: 1500,
    8: 1500
};

export const optimalWeightPerPart = {
    3: 4070,
    4: 1525,
    5: 1945,
    6: 3025,
    7: 2390,
    8: 1940
};

export const minimalWeightPerPart = {
    3: 3800,
    4: 1250,
    5: 1650,
    6: 2750,
    7: 2100,
    8: 1700
};

export const carAttributes = {
    0: "top_speed",
    1: "acceleration",
    2: "drs",
    3: "low_speed",
    4: "medium_speed",
    5: "high_speed",
    6: "dirty_air",
    7: "brake_cooling",
    8: "engine_cooling"
};

export const statsMinMax = {
    0: [0, 100],
    1: [0, 100],
    2: [0, 100],
    3: [0, 100],
    4: [0, 100],
    5: [0, 100],
    7: [3, 5],
    8: [5, 7],
    9: [7, 8],
    10: [90, 100],
    13: [0, 100]
};

export const lifespanPartsMinMax = {
    3: [3800, 6500],
    4: [1250, 4000],
    5: [1650, 4600],
    6: [2750, 5500],
    7: [2100, 5000],
    8: [1700, 4100]
};

export const attributesMinMax = {
    top_speed: [313.00, 328.00],
    acceleration: [1.800, 1.900],
    drs: [0, 100],
    low_speed: [2.000, 3.000],
    medium_speed: [3.000, 4.000],
    high_speed: [4.000, 5.500],
    dirty_air: [0, 100],
    brake_cooling: [0, 100],
    engine_cooling: [0, 100]
};

export const attributesUnits = {
    top_speed: "km/h",
    acceleration: "G",
    drs: "%",
    low_speed: "G",
    medium_speed: "G",
    high_speed: "G",
    dirty_air: "%",
    brake_cooling: "%",
    engine_cooling: "%"
};

export const attributesContributions = {
    top_speed: 0.15,
    acceleration: 0,
    drs: 0.15,
    low_speed: 0.1666,
    medium_speed: 0.1666,
    high_speed: 0.1666,
    dirty_air: 0.0666,
    brake_cooling: 0.0666,
    engine_cooling: 0.0666
};

export const attributesContributions2 = {
    top_speed: 0.15,
    acceleration: 0,
    drs: 0.15,
    low_speed: 0.2166,
    medium_speed: 0.2166,
    high_speed: 0.2166,
    dirty_air: 0.03,
    brake_cooling: 0.01,
    engine_cooling: 0.01
};

export const attributesContributions3 = {
    top_speed: 0.144,
    acceleration: 0.018,
    drs: 0.115,
    low_speed: 0.195,
    medium_speed: 0.195,
    high_speed: 0.195,
    dirty_air: 0.029,
    brake_cooling: 0.078,
    engine_cooling: 0.031
};

export const fuel_efficiency_factors = {
    0: 1
};

export const power_factors = {
    0: 1
};

export const performance_loss_factors = {
    0: 1
};

export const performance_threshold_factors = {
    0: 1
};

export const operational_range_factors = {
    0: 1
};

export const lifespan_factors = {
    1: 0,
    2: 0,
    3: 5,
    4: 2,
    5: 3,
    6: 5,
    7: 4,
    8: 1
};

export const drag_reduction_factors = {
    3: 0.2,
    5: 0.3,
    6: 0.2,
    7: 0.2,
    8: 0.1
};

export const engine_cooling_factors = {
    3: 0.4,
    6: 0.6
};

export const airflow_middle_factors = {
    3: 0.6,
    6: 0.4
};

export const airflow_front_factors = {
    4: 0.4,
    6: 0.2,
    8: 0.4
};

export const airflow_sensitivity_factors = {
    4: 0.4,
    5: 0.4,
    7: 0.2
};

export const brake_cooling_factors = {
    4: 0.4,
    8: 0.6
};

export const low_speed_downforce_factors = {
    4: 0.2,
    5: 0.2,
    7: 0.3,
    8: 0.3
};

export const medium_speed_downforce_factors = {
    4: 0.2,
    5: 0.2,
    7: 0.5,
    8: 0.1
};

export const high_speed_downforce_factors = {
    4: 0.2,
    5: 0.2,
    7: 0.5,
    8: 0.1
};

export const drs_delta_factors = {
    5: 0.75,
    3: 0.25
};

export const top_speed_contributors = {
    4: 1
};

export const acceleration_contributors = {
    10: 0.5,
    4: 0.5,
    16: 0.15
};

export const drs_contributors = {
    3: 1
};

export const low_speed_contributors = {
    0: 0.6,
    7: 1,
    16: 0.24
};

export const medium_speed_contributors = {
    0: 0.4,
    13: 0.4,
    8: 1,
    16: 0.27
};

export const high_speed_contributors = {
    13: 0.6,
    9: 1,
    16: 0.24
};

export const dirty_air_contributors = {
    1: 1
};

export const brake_cooling_contributors = {
    2: 1
};

export const engine_cooling_contributors = {
    5: 1
};
