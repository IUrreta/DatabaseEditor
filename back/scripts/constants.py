stats = {
    0 : "airflow_front",
    1 : "airflow_sensitivity",
    2 : "brake_cooling",
    3 : "drs_delta",
    4 : "drag_reduction",
    5 : "engine_cooling",
    6 : "fuel_efficiency",
    7 : "low_speed_downforce",
    8 : "medium_speed_downforce",
    9 : "high_speed_downforce",
    10 : "power",
    11 : "performance_loss",
    12 : "performance_threshold",
    13 : "airflow_middle",
    14 : "operational_range",
    15 : "lifespan",
    16 : "special_weight"
}

default_parts_stats = {
    3: [3,4,5,13,15],
    4: [0,1,2,7,8,9,15],
    5: [1,3,4,7,8,9,15],
    6: [0,4,5,13,15],
    7: [0,1,4,7,8,9, 15],
    8: [0,2,4,7,8,9,15]
}

unitValueToValue = {
    0: lambda x: x * 10,
    1: lambda x: x * 10,
    2: lambda x: x * 10,
    3: lambda x: x * 10,
    4: lambda x: x * 10,
    5: lambda x: x * 10,

    6: lambda x: (x - 90) * 1000 / 10,

    7: lambda x: (x - 3) / 0.002,
    8: lambda x: (x - 5) / 0.002,
    9: lambda x: (x - 7) / 0.001,

    10: lambda x: (x - 90) * 1000 / 10,
    11: lambda x: (85 - x) * 1000 / 20,
    12: lambda x: (x - 70) * 1000 / 15,
    13: lambda x: x * 10,
    14: lambda x: (85 - x) * 1000 / 15,
    15: lambda x: (x - 40) * 1000 / 30,
    18: lambda x: (x - 40) * 1000 / 30,
    19: lambda x: (x - 40) * 1000 / 30
}

downforce_24_unitValueToValue = {
    7: lambda x: 497.6 * x - 1489.8,
    8: lambda x: 496.8 * x - 2479.5,
    9: lambda x: 974.048 * x - 6803.2614
}

parts = {
    0 : "engine",
    3 : "chassis",
    4 : "front_wing",
    5 : "rear_wing",
    6 : "sidepods",
    7 : "underfloor",
    8 : "suspension"
}

standard_weight_per_part = {
    3 : 5150,
    4 : 2625,
    5 : 3125,
    6 : 4125,
    7 : 3550,
    8 : 2900
}

standard_buildwork_per_part = {
    3: 2000,
    4: 500,
    5: 500,
    6: 1500,
    7: 1500,
    8: 1500
}

car_attributes = {
    0 : "top_speed", 1: "acceleration", 2: "drs", 3: "low_speed", 4: "medium_speed", 5: "high_speed", 6:"dirty_air", 7: "brake_cooling", 8:"engine_cooling"
}

stats_min_max = {0 : [0, 100], 1: [0, 100], 2: [0, 100], 3 :[0, 100], 4: [0, 100], 5: [0, 100], 7: [3, 5], 8:[5,7], 9:[7,8], 10: [90, 100],
                 13: [0, 100]}

lifespan_parts_min_max = {3: [3800, 6500], 4:[1250, 4000], 5:[1650, 4600],6:[2750, 5500],7:[2100, 5000], 8:[1700, 4100]}

stats_parts_contributions_top_speed = {
    4 : {3: 0.2, 5:0.3, 6:0.2, 7:0.2, 8:0.1},
}

stats_parts_contributions_acceleration = {
    4 : {3: 0.1, 5:0.15, 6:0.1, 7:0.1, 8:0.05},
    15: {3: 0.025, 4:0.01, 5:0.015, 6:0.025, 7:0.02, 8:0.005},
    10: {0: 0.4}
}

stats_parts_contributions_drs = {
    3 : {5:1}
}

stats_parts_contributions_low_speed = {
    7 : {4: 0.32, 5: 0.32, 7:0.32, 8:0.32},
    0 : {4: 0.54, 6:0.54, 8:0.54},
    15: {3:0.13, 4:0.13, 5:0.13, 6:0.13, 7:0.13, 8:0.13},
}

stats_parts_contributions_medium_speed = {
    8:{4:0.1042, 5:0.1042, 7:0.25, 8:0.0521},
    0:{4:0.0833, 6:0.0417, 8:0.0833},
    13:{3:0.1250, 6:0.0833},
    15:{3:0.0182, 4:0.0073, 5:0.0109, 6:0.0182, 7:0.0146, 8:0.0036},
}

stats_parts_contributions_high_speed = {
    9:{4:0.1214, 5:0.1143, 7:0.3071, 8:0.05},
    13:{3:0.2071, 6:0.1357},
    15:{3:0.0161, 4:0.0064, 5:0.0096, 6:0.0161, 7:0.0129, 8:0.0032},
}

stats_parts_contributions_dirty_air = {
    1:{4:0.4, 5:0.4, 7:0.2}
}

stats_parts_contributions_brake_cooling = {
    2:{4:0.3333, 8:0.6667}
}

stats_parts_contributions_engine_cooling = {
    5:{3:0.3333, 6:0.6667}
}

attributes_min_max = {
    "top_speed": [313.00, 328.00],
    "acceleration": [1.800, 1.900],
    "drs": [0, 100],
    "low_speed": [2.000, 3.000],
    "medium_speed": [3.000, 4.000],
    "high_speed": [4.000, 5.500],
    "dirty_air": [0, 100],
    "brake_cooling": [0, 100],
    "engine_cooling": [0, 100]
}

attributes_units = {
    "top_speed": "km/h",
    "acceleration": "G",
    "drs": "%",
    "low_speed": "G",
    "medium_speed": "G",
    "high_speed": "G",
    "dirty_air": "%",
    "brake_cooling": "%",
    "engine_cooling": "%"
}

attributes_contributions = {
    "top_speed": 0.15,
    "acceleration": 0,
    "drs": 0.15,
    "low_speed": 0.1666,
    "medium_speed": 0.1666,
    "high_speed": 0.1666,
    "dirty_air": 0.0666,
    "brake_cooling": 0.0666,
    "engine_cooling": 0.0666
}

attributes_contributions2 = {
    "top_speed": 0.15,
    "acceleration": 0,
    "drs": 0.15,
    "low_speed": 0.2166,
    "medium_speed": 0.2166,
    "high_speed": 0.2166,
    "dirty_air": 0.03,
    "brake_cooling": 0.01,
    "engine_cooling": 0.01
}

########

fuel_efficiency_factors = {
    0: 1
}

power_factors = {
    0: 1
}

performance_loss_factors = {
    0: 1
}

performance_threshold_factors = {
    0: 1
}

operational_range_factors = {
    0: 1
}   

lifespan_factors = {
    1: 0,
    2: 0,
    3: 5,
    4: 2,
    5: 3,
    6: 5,
    7: 4,
    8:1
}

drag_reduction_factors = {
    3: 0.2,
    5: 0.3,
    6: 0.2,
    7: 0.2,
    8: 0.1
}

engine_cooling_factors = {
    3: 0.4,
    6: 0.6
}

airflow_middle_factors = {
    3: 0.6,
    6: 0.4
}

airflow_front_factors = {
    4: 0.4,
    6: 0.2,
    8: 0.4
}

airflow_sensitivity_factors= {
    4: 0.4,
    5: 0.4,
    7: 0.2
}

brake_cooling_factors = {
    4: 0.4,
    8: 0.6
}

low_speed_downforce_factors = {
    4 : 0.2,
    5: 0.2,
    7: 0.3,
    8: 0.3
}

medium_speed_downforce_factors = {
    4 : 0.2,
    5: 0.2,
    7: 0.5,
    8: 0.1
}

high_speed_downforce_factors = {
    4 : 0.2,
    5: 0.2,
    7: 0.5,
    8: 0.1
}   

drs_delta_factors = {
    5: 0.75,
    3: 0.25
}

### ATTRIBUTE CONTRIBUTORS ###

top_speed_contributors = {
    4:1
}

acceleration_contributors = {
    10:0.5,
    4:0.5,
    16:0.15
}

drs_contributors = {
    3:1
}

low_speed_contributors = {
    0 : 0.6,
    7: 1,
    16: 0.24
}

medium_speed_contributors = {
    0:0.4,
    13:0.4,
    8: 1,
    16: 0.27
}

high_speed_contributors = {
    13:0.6,
    9:1,
    16:0.24
}

dirty_air_contributors = {
    1:1
}

brake_cooling_contributors = {
    2:1
}

engine_cooling_contributors = {
    5:1
}