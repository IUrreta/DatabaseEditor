import sqlite3

from .constants import *

def get_best_parts(custom_team=None):
    teams = {}
    if custom_team:
        team_list = list(range(1, 11)) + [32]
    else: 
        team_list = list(range(1, 11))
    for i in team_list:
        teams[i] = get_parts_from_team(i)
   
    return teams

def get_parts_from_team(team_id):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    season = day_season[1]
    
    designs = {}
    for j in range(3, 9):
        designs[j] = cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = {j} AND TeamID = {team_id} AND ValidFrom = {season} AND (DayCompleted > 0 OR DayCreated < 0)").fetchall()
    engine = cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = 0 AND TeamID = {team_id}").fetchall()
    designs[0] = engine
    return designs

def get_best_parts_until(day, custom_team=None):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    season = day_season[1]

    if custom_team:
        team_list = list(range(1, 11)) + [32]
    else: 
        team_list = list(range(1, 11))
    
    teams = {}
    for i in team_list:
        designs = {}
        for j in range(3, 9):
            designs[j] = cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = {j} AND TeamID = {i} AND ValidFrom = {season} AND ((DayCompleted > 0 AND DayCompleted < {day}) OR DayCreated < 0)").fetchall()
        engine = cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = 0 AND TeamID = {i}").fetchall()
        designs[0] = engine
        teams[i] = designs
   
    return teams


def get_car_stats(design_dict):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    stats_values = {}
    for part in design_dict:
        result  = cursor.execute(f"SELECT PartStat, Value FROM Parts_Designs_StatValues WHERE DesignID = {design_dict[part][0][0]}").fetchall()
        stats_values[part] = {stat[0]: round(stat[1],3) for stat in result}

    return stats_values

def get_unitvalue_from_parts(design_dict):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    stats_values = {}
    for part in design_dict:
        result  = cursor.execute(f"SELECT PartStat, UnitValue FROM Parts_Designs_StatValues WHERE DesignID = {design_dict[part][0][0]}").fetchall()
        stats_values[parts[part]] = {stat[0]: stat[1] for stat in result}

    return stats_values


def convert_percentage_to_value(attribute, percentage, min_max):
    min_value, max_value = min_max[attribute]
    return min_value + (max_value - min_value) * (percentage / 100.0)

def make_attributes_readable(attributes):
    for attribute in attributes:
        #pasar a rango
        attributes[attribute] = convert_percentage_to_value(attribute, attributes[attribute], attributes_min_max)
        attributes[attribute] = round(attributes[attribute], 3)
        attributes[attribute] = f"{attributes[attribute]} {attributes_units[attribute]}"
    return attributes

def calculate_overall_performance(attributes):
    ovr = 0
    for attribute in attributes:
        ovr += attributes[attribute] * attributes_contributions2[attribute]

    return round(ovr, 2)


def get_contributors_dict():
    contributors_values = {}
    totalValues = {}
    for attribute in car_attributes:
        totalValues[attribute] = 0
        reference_dict = globals()[f"{car_attributes[attribute]}_contributors"]
        for stat in reference_dict:
            totalValues[attribute] += reference_dict[stat]
    
    for attribute in car_attributes:
        reference_dict = globals()[f"{car_attributes[attribute]}_contributors"]
        contributors_values[attribute] = {}
        for stat in reference_dict:
            contributors_values[attribute][stat] = round((reference_dict[stat] / totalValues[attribute]), 3)

    return contributors_values

def get_part_stats_dict(car_dict):
    part_stats = {}
    for part in car_dict:
        for stat in car_dict[part]:
            factor = globals()[f"{stats[stat]}_factors"][part]
            if stat not in part_stats:
                part_stats[stat] = 0
            part_stats[stat] += car_dict[part][stat] * factor
            
    return part_stats

def calculate_car_attributes(contributors, parts_stats):
    attributes_dict = {}
    parts_stats[16] = (20000 - parts_stats[15]) / 20
    for attribute in contributors:
        attributes_dict[car_attributes[attribute]] = 0
        for stat in contributors[attribute]:
            attributes_dict[car_attributes[attribute]] += (contributors[attribute][stat] * parts_stats[stat]) / 10

    return attributes_dict

def get_races_days():
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    season = day_season[1]
    
    races = cursor.execute(f"SELECT RaceID, Day, TrackID FROM Races WHERE SeasonID = {season} AND State = 2").fetchall()
    
    first_race_state_0 = cursor.execute(f"SELECT RaceID, Day, TrackID FROM Races WHERE SeasonID = {season} AND State = 0 ORDER BY Day ASC LIMIT 1").fetchone()
    
    if first_race_state_0:
        races.append(first_race_state_0)
    
    conn.close()
    
    return races

def get_all_races():
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    season = day_season[1]
    races = cursor.execute(f"SELECT RaceID, Day, TrackID FROM Races WHERE SeasonID = {season}").fetchall()
    return races



def get_performance_all_teams(day=None, previous=None, custom_team=None):
    teams = {}
    contributors = get_contributors_dict()

    if custom_team:
        team_list = list(range(1, 11)) + [32]
    else: 
        team_list = list(range(1, 11))

    if day is None:
        parts = get_best_parts()
    else:
        parts = get_best_parts_until(day, custom_team)

    for i in team_list:
        dict = get_car_stats(parts[i])
        part_stats = get_part_stats_dict(dict)
        attributes = calculate_car_attributes(contributors, part_stats)
        ovr = calculate_overall_performance(attributes)
        if previous:
            if previous[i] > ovr:
                ovr = previous[i]
        teams[i] = ovr    

    return teams

def overwrite_performance_team(team_id, performance):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    day = day_season[0]
    team_parts = get_best_parts_until(day)[int(team_id)]
    for part in team_parts:
        if part != 0:
            design = team_parts[part][0][0]
            part_name = parts[part]
            stats = performance[part_name]
            for stat in stats:
                stat_num = float(stats[stat])
                value = unitValueToValue[int(stat)](stat_num)
                cursor.execute(f"UPDATE Parts_Designs_StatValues SET UnitValue = {stats[stat]} WHERE DesignID = {design} AND PartStat = {stat}")
                cursor.execute(f"UPDATE Parts_Designs_StatValues SET Value = {value} WHERE DesignID = {design} AND PartStat = {stat}")

    conn.commit()
    conn.close()

def get_performance_all_teams_season(custom_team=None):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    races = get_races_days()
    races_performances = []
    previous = None
    for race_day in races:
        performances = get_performance_all_teams(race_day[1], previous, custom_team)
        races_performances.append(performances)
        previous = performances

    all_races = get_all_races()
    return races_performances, all_races


def get_attributes_all_teams(custom_team=None):
    teams = {}
    contributors = get_contributors_dict()
    parts = get_best_parts(custom_team)
    if custom_team:
        team_list = list(range(1, 11)) + [32]
    else: 
        team_list = list(range(1, 11))
    for i in team_list:
        dict = get_car_stats(parts[i])
        part_stats = get_part_stats_dict(dict)
        attributes = calculate_car_attributes(contributors, part_stats)
        teams[i] = attributes

    return teams


if __name__ == '__main__':
    #debugging
    performances = get_performance_all_teams_season()
    print(performances)