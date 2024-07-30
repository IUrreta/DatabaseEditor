import sqlite3

from .constants import *

class CarAnalysisUtils:
    def __init__(self, client):
        self.client = client
        self.conn = sqlite3.connect("../result/main.db")
        self.cursor = self.conn.cursor()


    def get_best_parts(self, custom_team=None):
        teams = {}
        if custom_team:
            team_list = list(range(1, 11)) + [32]
        else: 
            team_list = list(range(1, 11))
        for i in team_list:
            teams[i] = self.get_parts_from_team(i)
    
        return teams
    
    def get_all_parts_from_team(self, team_id):
        query = """
        SELECT 
            d.DesignID,
            d.DayCreated,
            d.DayCompleted, 
            (SELECT r.TrackID 
            FROM Races r 
            WHERE r.Day >= d.DayCompleted 
            ORDER BY r.Day ASC 
            LIMIT 1) AS TrackID
        FROM 
            Parts_Designs d
        WHERE 
            d.PartType = ? 
            AND d.TeamID = ? 
            AND d.ValidFrom = ?
            AND d.DayCompleted > 0
        """
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        season = day_season[1]
        parts_dict = {}
        for j in range(3, 9):
            # Ejecución de la consulta con los parámetros correspondientes
            params = (j, team_id, season)
            designs = self.cursor.execute(query, params).fetchall()
            parts_dict[parts[j]] = designs  

        return parts_dict


    def get_parts_from_team(self, team_id):
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        season = day_season[1]
        
        designs = {}
        for j in range(3, 9):
            designs[j] = self.cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = {j} AND TeamID = {team_id} AND ValidFrom = {season} AND (DayCompleted > 0 OR DayCreated < 0)").fetchall()
        engine = self.cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = 0 AND TeamID = {team_id}").fetchall()
        designs[0] = engine
        return designs

    def get_best_parts_until(self, day, custom_team=None):
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        season = day_season[1]

        if custom_team:
            team_list = list(range(1, 11)) + [32]
        else: 
            team_list = list(range(1, 11))
        
        teams = {}
        for i in team_list:
            designs = {}
            for j in range(3, 9):
                designs[j] = self.cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = {j} AND TeamID = {i} AND ValidFrom = {season} AND ((DayCompleted > 0 AND DayCompleted <= {day}) OR DayCreated < 0)").fetchall()
            engine = self.cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = 0 AND TeamID = {i}").fetchall()
            designs[0] = engine
            teams[i] = designs
    
        return teams


    def get_car_stats(self, design_dict):
        stats_values = {}
        for part in design_dict:
            result  = self.cursor.execute(f"SELECT PartStat, Value FROM Parts_Designs_StatValues WHERE DesignID = {design_dict[part][0][0]}").fetchall()
            stats_values[part] = {stat[0]: round(stat[1],3) for stat in result}

        return stats_values

    def get_unitvalue_from_parts(self, design_dict):
        stats_values = {}
        for part in design_dict:
            result  = self.cursor.execute(f"SELECT PartStat, UnitValue FROM Parts_Designs_StatValues WHERE DesignID = {design_dict[part][0][0]}").fetchall()
            stats_values[parts[part]] = {stat[0]: stat[1] for stat in result}

        return stats_values


    def convert_percentage_to_value(self, attribute, percentage, min_max):
        min_value, max_value = min_max[attribute]
        return min_value + (max_value - min_value) * (percentage / 100.0)

    def make_attributes_readable(self, attributes):
        for attribute in attributes:
            #pasar a rango
            attributes[attribute] = self.convert_percentage_to_value(attribute, attributes[attribute], attributes_min_max)
            attributes[attribute] = round(attributes[attribute], 3)
            attributes[attribute] = f"{attributes[attribute]} {attributes_units[attribute]}"
        return attributes

    def calculate_overall_performance(self, attributes):
        ovr = 0
        for attribute in attributes:
            ovr += attributes[attribute] * attributes_contributions2[attribute]

        return round(ovr, 2)


    def get_contributors_dict(self):
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

    def get_part_stats_dict(self, car_dict):
        part_stats = {}
        for part in car_dict:
            for stat in car_dict[part]:
                factor = globals()[f"{stats[stat]}_factors"][part]
                if stat not in part_stats:
                    part_stats[stat] = 0
                part_stats[stat] += car_dict[part][stat] * factor
                
        return part_stats

    def calculate_car_attributes(self, contributors, parts_stats):
        attributes_dict = {}
        parts_stats[16] = (20000 - parts_stats[15]) / 20
        for attribute in contributors:
            attributes_dict[car_attributes[attribute]] = 0
            for stat in contributors[attribute]:
                attributes_dict[car_attributes[attribute]] += (contributors[attribute][stat] * parts_stats[stat]) / 10

        return attributes_dict

    def get_races_days(self):
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        season = day_season[1]
        
        races = self.cursor.execute(f"SELECT RaceID, Day, TrackID FROM Races WHERE SeasonID = {season} AND State = 2").fetchall()
        
        first_race_state_0 = self.cursor.execute(f"SELECT RaceID, Day, TrackID FROM Races WHERE SeasonID = {season} AND State = 0 ORDER BY Day ASC LIMIT 1").fetchone()
        
        if first_race_state_0:
            races.append(first_race_state_0)
        
        return races

    def get_all_races(self):
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        season = day_season[1]
        races = self.cursor.execute(f"SELECT RaceID, Day, TrackID FROM Races WHERE SeasonID = {season}").fetchall()
        return races



    def get_performance_all_teams(self, day=None, previous=None, custom_team=None):
        teams = {}
        contributors = self.get_contributors_dict()

        if custom_team:
            team_list = list(range(1, 11)) + [32]
        else: 
            team_list = list(range(1, 11))

        if day is None:
            parts = self.get_best_parts()
        else:
            parts = self.get_best_parts_until(day, custom_team)

        for i in team_list:
            dict = self.get_car_stats(parts[i])
            part_stats = self.get_part_stats_dict(dict)
            attributes = self.calculate_car_attributes(contributors, part_stats)
            ovr = self.calculate_overall_performance(attributes)
            if previous:
                if previous[i] > ovr:
                    ovr = previous[i]
            teams[i] = ovr    

        return teams
    
    def add_new_design(self, part, team_id, day, season, latest_design_part_from_team, new_design_id):
        max_design_from_part = self.cursor.execute(f"SELECT MAX(DesignNumber) FROM Parts_Designs WHERE PartType = {part} AND TeamID = {team_id}").fetchone()[0]
        new_max_design = max_design_from_part + 1
        self.cursor.execute(f"UPDATE Parts_Designs_TeamData SET NewDesignsThisSeason = {new_max_design} WHERE TeamID = {team_id} AND PartType = {part}")
        self.cursor.execute(f"INSERT INTO Parts_Designs VALUES ({new_design_id}, {part}, 6720, 6600, {day-1}, {day}, NULL, 5, 1, 0, 0, 1500, {season}, 0, 0, 4, {new_max_design}, 1, {team_id}, 1)")
        self.cursor.execute(f"INSERT INTO Parts_DesignHistoryData VALUES ({new_design_id}, 0, 0, 0, 0)")
        self.copy_from_table("building",latest_design_part_from_team, new_design_id)
        self.copy_from_table("staff",latest_design_part_from_team, new_design_id)
        self.add_4_items(new_design_id, part)

    def copy_from_table(self, table, latest_design_id, new_design_id):
        if table == "building":
            table_name = "Parts_Designs_BuildingEffects"
        elif table == "staff":
            table_name = "Parts_Designs_StaffEffects"
        rows = self.cursor.execute(f"SELECT * FROM {table_name} WHERE DesignID = {latest_design_id}").fetchall()
        for row in rows:
            self.cursor.execute(f"INSERT INTO {table_name} VALUES ({new_design_id}, {row[1]}, {row[2]}, 0)")

    def add_4_items(self, new_design_id, part):
        max_item = self.cursor.execute("SELECT MAX(ItemID) FROM Parts_Items").fetchone()[0]
        for i in range(1, 5):
            max_item += 1
            self.cursor.execute(f"INSERT INTO Parts_Items VALUES ({max_item}, {new_design_id}, {standard_buildwork_per_part[part]}, 1, {i}, NULL, NULL, 0, NULL)")


    def overwrite_performance_team(self, team_id, performance, custom_team=None, year_iteration=None):
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        day = day_season[0]
        season = day_season[1]
        best_parts = self.get_best_parts_until(day, custom_team)
        team_parts = best_parts[int(team_id)]
        for part in team_parts:
            if part != 0:
                design = team_parts[part][0][0]
                part_name = parts[part]
                new_design = performance[part_name]["new"]
                performance[part_name].pop("new")
                if int(new_design):
                    max_design = self.cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs").fetchone()[0]
                    latest_design_part_from_team = self.cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = {part} AND TeamID = {team_id}").fetchone()[0]
                    new_design_id = max_design + 1
                    self.add_new_design(part, int(team_id), day, season, latest_design_part_from_team, new_design_id)

                stats = performance[part_name]
                for stat in stats:
                    stat_num = float(stats[stat])
                    if year_iteration == "24" and int(stat) >= 7 and int(stat) <= 9:
                        value = downforce_24_unitValueToValue[int(stat)](stat_num)
                    else:
                        value = unitValueToValue[int(stat)](stat_num)
                    if not int(new_design):
                        print("NO NEW DESIGN")
                        self.change_expertise_based(part, stat, value, int(team_id))
                        self.cursor.execute(f"UPDATE Parts_Designs_StatValues SET UnitValue = {stats[stat]} WHERE DesignID = {design} AND PartStat = {stat}")
                        self.cursor.execute(f"UPDATE Parts_Designs_StatValues SET Value = {value} WHERE DesignID = {design} AND PartStat = {stat}")
                    else:
                        print("NEW DESIGN")
                        self.cursor.execute(f"INSERT INTO Parts_Designs_StatValues VALUES ({new_design_id}, {stat}, {value}, {stats[stat]}, 0.5, 1, 0.1)")
                        
                
                if int(new_design):  #when inserting new part I only can change expertise when all the stats have been inserted, also insert standard weight
                    self.cursor.execute(f"INSERT INTO Parts_Designs_StatValues VALUES ({new_design_id}, 15, 500, {standard_weight_per_part[part]}, 0.5, 0, 0)")
                    for stat in stats:
                        stat_num = float(stats[stat])
                        if year_iteration == "24" and int(stat) >= 7 and int(stat) <= 9:
                            value = downforce_24_unitValueToValue[int(stat)](stat_num)
                        else:
                            value = unitValueToValue[int(stat)](stat_num)
                        self.change_expertise_based(part, stat, value, int(team_id), "new", latest_design_part_from_team)


        self.conn.commit()

    def change_expertise_based(self,part, stat, new_value, team_id, type="existing", old_design=None):
        if type == "existing":
            current_value = self.cursor.execute(f"SELECT MAX(Value) FROM Parts_Designs_StatValues WHERE PartStat = {stat} AND DesignID IN (SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = {part} AND TeamID = {team_id})").fetchone()[0]
        elif type == "new":
            current_value = self.cursor.execute(f"SELECT Value FROM Parts_Designs_StatValues WHERE PartStat = {stat} AND DesignID = {old_design}").fetchone()[0]
        current_expertise = self.cursor.execute(f"SELECT Expertise FROM Parts_TeamExpertise WHERE TeamID = {team_id} AND PartType = {part} AND PartStat = {stat}").fetchone()[0]
        new_expertise = (float(new_value) * float(current_expertise)) / float(current_value)
        print(f"Old value for {part} {stat}: {current_value}, old expertise: {current_expertise}")
        print(f"New value for {part} {stat}: {new_value}, new expertise: {new_expertise}")
        self.cursor.execute(f"UPDATE Parts_TeamExpertise SET Expertise = {new_expertise} WHERE TeamID = {team_id} AND PartType = {part} AND PartStat = {stat}")

    def get_performance_all_teams_season(self, custom_team=None):
        races = self.get_races_days()
        races_performances = []
        previous = None
        for race_day in races:
            performances = self.get_performance_all_teams(race_day[1], previous, custom_team)
            races_performances.append(performances)
            previous = performances

        all_races = self.get_all_races()
        return races_performances, all_races


    def get_attributes_all_teams(self, custom_team=None):
        teams = {}
        contributors = self.get_contributors_dict()
        parts = self.get_best_parts(custom_team)
        if custom_team:
            team_list = list(range(1, 11)) + [32]
        else: 
            team_list = list(range(1, 11))
        for i in team_list:
            dict = self.get_car_stats(parts[i])
            part_stats = self.get_part_stats_dict(dict)
            attributes = self.calculate_car_attributes(contributors, part_stats)
            teams[i] = attributes

        return teams