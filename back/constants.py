stats = {
    0 : "airflow_front",
    1 : "airflow_sensitivity",
    2 : "brake_cooling",
    3 : "drs_delta",
    4 : "drag_reduction",
    5 : "enigne_cooling",
    6 : "fuel_efficiency",
    7 : "low_speed_downforce",
    8 : "medium_speed_downforce",
    9 : "high_speed_downforce",
    10 : "power",
    11 : "performance_loss",
    12 : "performance_threshold",
    13 : "airflow_middle",
    14 : "operational_range",
    15 : "weight"
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

car_attributes = {
    0 : "top_speed", 1: "acceleration", 2: "drs", 3: "low_speed", 4: "medium_speed", 5: "high_speed", 6:"dirty_air", 7: "brake_cooling", 8:"engine_cooling"
}

stats_min_max = {0 : [0, 100], 1: [0, 100], 2: [0, 100], 3 :[0, 100], 4: [0, 100], 5: [0, 100], 7: [3, 5], 8:[5,7], 9:[7,8], 10: [90, 100],
                 13: [0, 100], 15: [0,40]}

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
    7 : {4: 0.1099, 5: 0.1099, 7:0.1758, 8:0.1758},
    0 : {4: 0.1429, 6:0.0659, 8:0.1429},
    15: {3:0.0192, 4:0.0077, 5:0.0115, 6:0.0192, 7:0.0154, 8:0.0038},
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