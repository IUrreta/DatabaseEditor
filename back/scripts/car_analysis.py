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
            params = (j, team_id, season)
            designs = self.cursor.execute(query, params).fetchall()
            for index, design in enumerate(designs):
                design_id = design[0]
                equipped_1 = self.cursor.execute(f"SELECT DesignID FROM Parts_CarLoadout WHERE TeamID = {team_id} AND PartType = {j} AND LoadoutID = 1").fetchone()
                if equipped_1 is not None:
                    equipped_1 = equipped_1[0]
                if equipped_1 != design_id:
                    equipped_1 = 0
                else:
                    equipped_1 = 1

                
                equipped_2 = self.cursor.execute(f"SELECT DesignID FROM Parts_CarLoadout WHERE TeamID = {team_id} AND PartType = {j} AND LoadoutID = 2").fetchone()
                if equipped_2 is not None:
                    equipped_2 = equipped_2[0]
                if equipped_2 != design_id:
                    equipped_2 = 0
                else:
                    equipped_2 = 1
                
                n_parts = self.cursor.execute(f"SELECT COUNT(*) FROM Parts_Items WHERE DesignID = {design_id} AND BuildWork = {standard_buildwork_per_part[j]}").fetchone()[0]

                design = list(design)
                design.append(equipped_1)
                design.append(equipped_2)
                design.append(n_parts)
                design = tuple(design)
                designs[index] = design
                

                        
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
            if design_dict[part][0][0] is not None:
                result  = self.cursor.execute(f"SELECT PartStat, Value FROM Parts_Designs_StatValues WHERE DesignID = {design_dict[part][0][0]}").fetchall()
                stats_values[part] = {stat[0]: round(stat[1],3) for stat in result}
            else:
                stats_values[part] = {stat: 0 for stat in default_parts_stats[part]}

        return stats_values

    def get_unitvalue_from_parts(self, design_dict):
        stats_values = {}
        for part in design_dict:
            result  = self.cursor.execute(f"SELECT PartStat, UnitValue FROM Parts_Designs_StatValues WHERE DesignID = {design_dict[part][0][0]}").fetchall()
            stats_values[parts[part]] = {stat[0]: stat[1] for stat in result}

        return stats_values
    
    def get_unitvalue_from_one_part(self, design_id):
        part_type = self.cursor.execute(f"SELECT PartType FROM Parts_Designs WHERE DesignID = {design_id}").fetchone()[0]
        result  = self.cursor.execute(f"SELECT PartStat, UnitValue FROM Parts_Designs_StatValues WHERE DesignID = {design_id}").fetchall()
        stats_values = {stat[0]: stat[1] for stat in result}
        part_values = {parts[part_type]: stats_values}
        return part_values


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
            # if previous:
            #     if previous[i] > ovr:
            #         ovr = previous[i]
            teams[i] = ovr    

        return teams
    
    def get_performance_all_cars(self, custom_team=None):
        cars = {}
        contributors = self.get_contributors_dict()
        if custom_team:
            team_list = list(range(1, 11)) + [32]
        else: 
            team_list = list(range(1, 11))

        cars_parts = self.get_fitted_designs(custom_team=custom_team)
        for team in cars_parts:
            cars[team] = {}
            for car in cars_parts[team]:
                dict = self.get_car_stats(cars_parts[team][car])
                missing_parts = [part for part in cars_parts[team][car] if cars_parts[team][car][part][0][0] is None]
                part_stats = self.get_part_stats_dict(dict)
                attributes = self.calculate_car_attributes(contributors, part_stats)
                ovr = self.calculate_overall_performance(attributes)
                driver_number = self.get_driver_number_with_car(team, car)
                cars[team][car] = [ovr, driver_number, missing_parts]
                # print(f"Car {car} from team {team} has an overall performance of {ovr}")

        return cars
    
    def get_attributes_all_cars(self, custom_team=None):
        cars = {}
        contributors = self.get_contributors_dict()
        if custom_team:
            team_list = list(range(1, 11)) + [32]
        else: 
            team_list = list(range(1, 11))

        cars_parts = self.get_fitted_designs(custom_team=custom_team)
        for team in cars_parts:
            cars[team] = {}
            for car in cars_parts[team]:
                dict = self.get_car_stats(cars_parts[team][car])
                part_stats = self.get_part_stats_dict(dict)
                attributes = self.calculate_car_attributes(contributors, part_stats)
                # attributes = self.make_attributes_readable(attributes) # comment to send them in form of percentages to UI
                cars[team][car] = attributes

        return cars

    def get_driver_number_with_car(self, team_id, car_id):
        driver_id = self.cursor.execute(f"SELECT con.StaffID FROM Staff_Contracts con JOIN Staff_GameData gam ON con.StaffID = gam.StaffID WHERE con.TeamID = {team_id} AND gam.StaffType = 0 AND con.ContractType = 0 AND con.PosInTeam = {car_id}").fetchone()
        if driver_id is None:
            return None
        driver_id = driver_id[0]
        number = self.cursor.execute(f"SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder = {driver_id}").fetchone()
        if number is None:
            return None
        number = number[0]
        return number
    
    def get_fitted_designs(self, custom_team=None):
        teams = {}
        if custom_team:
            team_list = list(range(1, 11)) + [32]
        else: 
            team_list = list(range(1, 11))
        for team in team_list:
            teams[team] = {}
            for loadout in range(1, 3):
                designs = {}
                for part in range(3, 9):
                    designs[part] = self.cursor.execute(f"SELECT DesignID FROM Parts_CarLoadout WHERE TeamID = {team} AND PartType = {part} AND LoadoutID = {loadout}").fetchall()
                engine = self.cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = 0 AND TeamID = {team}").fetchall()
                designs[0] = engine
                teams[team][loadout] = designs
                

        return teams

    
    def fit_latest_designs_all_grid(self,  custom_team=None):
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        day = day_season[0]
        season = day_season[1]
        best_parts = self.get_best_parts_until(day, custom_team)
        for team in best_parts:
            self.fit_latest_designs_one_team(team, best_parts[team])


    def fit_latest_designs_one_team(self, team_id, parts):
        for loadout in range(1, 3):
            for part in parts:
                if part != 0:
                    design = parts[part][0][0]
                    part_name = parts[part]
                    fitted_design = self.cursor.execute(f"SELECT DesignID FROM Parts_CarLoadout WHERE TeamID = {team_id} AND PartType = {part} AND LoadoutID = {loadout}").fetchone()[0]
                    if design != fitted_design:
                        parts_available = self.cursor.execute(f"SELECT ItemID FROM Parts_Items WHERE DesignID = {design} AND AssociatedCar IS NULL").fetchall()
                        if not parts_available:
                            item = self.create_new_item(design, part)
                            self.add_part_to_loadout(design, part, team_id, loadout, item)
                            # print(f"New item created for team {team_id} and part {part}, itemID: {item} added to loadout {loadout}")
                        else:
                            item = parts_available[0][0]
                            self.add_part_to_loadout(design, part, team_id, loadout, item)
                            # print(f"Item {item} alredy existed, added to loadout {loadout} for team {team_id} and part {part}")
                    else:
                        other_loadout = 1 if loadout == 2 else 2
                        fitted_item_other = self.cursor.execute(f"SELECT ItemID FROM Parts_CarLoadout WHERE TeamID = {team_id} AND PartType = {part} AND LoadoutID = {other_loadout}").fetchone()
                        fitted_item = self.cursor.execute(f"SELECT ItemID FROM Parts_CarLoadout WHERE TeamID = {team_id} AND PartType = {part} AND LoadoutID = {loadout}").fetchone()
                        if fitted_item_other is not None and fitted_item is not None and fitted_item[0] == fitted_item_other[0]:
                            item = self.create_new_item(design, part)
                            self.add_part_to_loadout(design, part, team_id, loadout, item)
                            # print(f"Both loadouts had the same item, new item created for team {team_id} and part {part}, itemID: {item} added to loadout {loadout}")
                        # else:
                        #     print(f"Design {design} already fitted for team {team_id} and part {part}")
                        
        self.conn.commit()

    def update_items_for_design_dict(self, design_dict, team_id):
        for design in design_dict:
            n_parts = int(design_dict[design])
            part_type = self.cursor.execute(f"SELECT PartType FROM Parts_Designs WHERE DesignID = {design}").fetchone()[0]
            actual_parts = self.cursor.execute(f"SELECT COUNT(*) FROM Parts_Items WHERE DesignID = {design} AND BuildWork = {standard_buildwork_per_part[part_type]}").fetchone()
            if actual_parts is not None:
                actual_parts = actual_parts[0]
            else:
                actual_parts = 0
            diff = n_parts - actual_parts
            if diff > 0:
                while diff > 0:
                    self.create_new_item(design, part_type)
                    diff -= 1
            elif diff < 0:
                while diff < 0:
                    self.delete_item(design)
                    diff += 1

        self.conn.commit()

    def fit_loadouts_dict(self, loadouts_dict, team_id):
        for part in loadouts_dict:
            design_1 = loadouts_dict[part][0]
            design_2 = loadouts_dict[part][1]
            fitted_design_1 = self.cursor.execute(f"SELECT DesignID, ItemID FROM Parts_CarLoadout WHERE TeamID = {team_id} AND PartType = {part} AND LoadoutID = 1").fetchone()
            if design_1 is not None:
                if fitted_design_1[0] is not None and fitted_design_1[1] is not None:
                    self.cursor.execute(f"UPDATE Parts_Items SET AssociatedCar = NULL WHERE ItemID = {fitted_design_1[1]}")
                    fitted_design_1 = fitted_design_1[0]

                if fitted_design_1 != design_1:
                    items_1 = self.cursor.execute(f"SELECT ItemID FROM Parts_Items WHERE DesignID = {design_1} AND BuildWork = {standard_buildwork_per_part[int(part)]} AND AssociatedCar IS NULL").fetchall()
                    if not items_1:
                        item_1 = self.create_new_item(design_1, int(part))
                    else:
                        item_1 = items_1[0][0]
                    self.add_part_to_loadout(design_1, int(part), team_id, 1, item_1)
            if design_2 is not None:
                fitted_design_2 = self.cursor.execute(f"SELECT DesignID, ItemID FROM Parts_CarLoadout WHERE TeamID = {team_id} AND PartType = {part} AND LoadoutID = 2").fetchone()
                if fitted_design_2[0] is not None and fitted_design_2[1] is not None:
                    self.cursor.execute(f"UPDATE Parts_Items SET AssociatedCar = NULL WHERE ItemID = {fitted_design_2[1]}")
                    fitted_design_2 = fitted_design_2[0]
                if fitted_design_2 != design_2:
                    items_2 = self.cursor.execute(f"SELECT ItemID FROM Parts_Items WHERE DesignID = {design_2} AND BuildWork = {standard_buildwork_per_part[int(part)]} AND AssociatedCar IS NULL").fetchall()
                    if not items_2:
                        item_2 = self.create_new_item(design_2, int(part))
                    else:
                        item_2 = items_2[0][0]
                    self.add_part_to_loadout(design_2, int(part), team_id, 2, item_2)

        self.conn.commit()



    def create_new_item(self, design_id, part):
        max_item = self.cursor.execute("SELECT MAX(ItemID) FROM Parts_Items").fetchone()[0]
        new_item = max_item + 1
        number_of_manufacutres = self.cursor.execute(f"SELECT ManufactureCount FROM Parts_Designs WHERE DesignID = {design_id}").fetchone()[0]
        new_n_manufactures = number_of_manufacutres + 1
        self.cursor.execute(f"INSERT INTO Parts_Items VALUES ({new_item}, {design_id}, {standard_buildwork_per_part[part]}, 1, {new_n_manufactures}, NULL, NULL, 0, NULL)")
        self.cursor.execute(f"UPDATE Parts_Designs SET ManufactureCount = {new_n_manufactures} WHERE DesignID = {design_id}")
        return new_item
    
    def delete_item(self, design_id):
        part_type = self.cursor.execute(f"SELECT PartType FROM Parts_Designs WHERE DesignID = {design_id}").fetchone()[0]
        item = self.cursor.execute(f"SELECT ItemID FROM Parts_Items WHERE DesignID = {design_id} AND BuildWork = {standard_buildwork_per_part[part_type]}").fetchone()[0]
        self.cursor.execute(f"DELETE FROM Parts_Items WHERE ItemID = {item}")

    def add_new_design(self, part, team_id, day, season, latest_design_part_from_team, new_design_id):
        max_design_from_part = self.cursor.execute(f"SELECT MAX(DesignNumber) FROM Parts_Designs WHERE PartType = {part} AND TeamID = {team_id}").fetchone()[0]
        new_max_design = max_design_from_part + 1
        self.cursor.execute(f"UPDATE Parts_Designs_TeamData SET NewDesignsThisSeason = {new_max_design} WHERE TeamID = {team_id} AND PartType = {part}")
        self.cursor.execute(f"INSERT INTO Parts_Designs VALUES ({new_design_id}, {part}, 6720, 6600, {day-1}, {day}, NULL, 5, 1, 0, 0, 1500, {season}, 0, 0, 4, {new_max_design}, 1, {team_id}, 1)")
        self.cursor.execute(f"INSERT INTO Parts_DesignHistoryData VALUES ({new_design_id}, 0, 0, 0, 0)")
        self.copy_from_table("building",latest_design_part_from_team, new_design_id)
        self.copy_from_table("staff",latest_design_part_from_team, new_design_id)
        self.add_4_items(new_design_id, part, team_id)

    def copy_from_table(self, table, latest_design_id, new_design_id):
        if table == "building":
            table_name = "Parts_Designs_BuildingEffects"
        elif table == "staff":
            table_name = "Parts_Designs_StaffEffects"
        rows = self.cursor.execute(f"SELECT * FROM {table_name} WHERE DesignID = {latest_design_id}").fetchall()
        for row in rows:
            self.cursor.execute(f"INSERT INTO {table_name} VALUES ({new_design_id}, {row[1]}, {row[2]}, 0)")

    def add_4_items(self, new_design_id, part, team_id):
        max_item = self.cursor.execute("SELECT MAX(ItemID) FROM Parts_Items").fetchone()[0]
        for i in range(1, 5):
            max_item += 1   
            self.cursor.execute(f"INSERT INTO Parts_Items VALUES ({max_item}, {new_design_id}, {standard_buildwork_per_part[part]}, 1, {i}, NULL, NULL, 0, NULL)")
            if i <= 2:
                loadout_id = i
                self.add_part_to_loadout(new_design_id, part, team_id, loadout_id, max_item) 

    def add_part_to_loadout(self, design_id, part, team_id, loadout_id, item_id):
        self.cursor.execute(f"UPDATE Parts_CarLoadout SET DesignID = {design_id}, ItemID = {item_id} WHERE TeamID = {team_id} AND PartType = {part} AND LoadoutID = {loadout_id}")
        self.cursor.execute(f"UPDATE Parts_Items SET AssociatedCar = {loadout_id}, LastEquippedCar = {loadout_id} WHERE ItemID = {item_id}")

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
                new_design = performance[part_name]["designEditing"]
                performance[part_name].pop("designEditing")
                if int(new_design) == -1:
                    max_design = self.cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs").fetchone()[0]
                    latest_design_part_from_team = self.cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = {part} AND TeamID = {team_id}").fetchone()[0]
                    new_design_id = max_design + 1
                    # print(f"New design: {new_design_id} for part {part_name} from team {team_id}")
                    self.add_new_design(part, int(team_id), day, season, latest_design_part_from_team, new_design_id)
                else:
                    design = new_design

                stats = performance[part_name]
                for stat in stats:
                    stat_num = float(stats[stat])
                    if year_iteration == "24" and int(stat) >= 7 and int(stat) <= 9:
                        value = downforce_24_unitValueToValue[int(stat)](stat_num)
                    else:
                        value = unitValueToValue[int(stat)](stat_num)
                    if int(new_design) != -1:
                        self.change_expertise_based(part, stat, value, int(team_id))
                        self.cursor.execute(f"UPDATE Parts_Designs_StatValues SET UnitValue = {stats[stat]} WHERE DesignID = {design} AND PartStat = {stat}")
                        self.cursor.execute(f"UPDATE Parts_Designs_StatValues SET Value = {value} WHERE DesignID = {design} AND PartStat = {stat}")
                    else:
                        self.cursor.execute(f"INSERT INTO Parts_Designs_StatValues VALUES ({new_design_id}, {stat}, {value}, {stats[stat]}, 0.5, 1, 0.1)")
                        
                
                if int(new_design) == -1:  #when inserting new part I only can change expertise when all the stats have been inserted, also insert standard weight
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
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        if type == "existing":
            current_value = self.cursor.execute(f"SELECT MAX(Value) FROM Parts_Designs_StatValues WHERE PartStat = {stat} AND DesignID IN (SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = {part} AND TeamID = {team_id} AND ValidFrom = {day_season[1]})").fetchone()[0]
        elif type == "new":
            current_value = self.cursor.execute(f"SELECT Value FROM Parts_Designs_StatValues WHERE PartStat = {stat} AND DesignID = {old_design}").fetchone()[0]
        if current_value == 0:
            current_value = 1
        # current_expertise = self.cursor.execute(f"SELECT Expertise FROM Parts_TeamExpertise WHERE TeamID = {team_id} AND PartType = {part} AND PartStat = {stat}").fetchone()[0]
        # new_expertise = (float(new_value) * float(current_expertise)) / float(current_value)
        new_expertise = current_value / 0.8
        # print(f"Old value for {part} {stat}: {current_value}, old expertise: {current_expertise}")
        # print(f"New value for {part} {stat}: {new_value}, new expertise: {new_expertise}")
        self.cursor.execute(f"UPDATE Parts_TeamExpertise SET Expertise = {new_expertise} WHERE TeamID = {team_id} AND PartType = {part} AND PartStat = {stat}")

    def get_performance_all_teams_season(self, custom_team=None):
        races = self.get_races_days()
        first_day = self.get_first_day_season()
        first_tuple = (0, first_day, 0)
        races.insert(0, first_tuple)
        races_performances = []
        previous = None
        print(races)
        for race_day in races:
            performances = self.get_performance_all_teams(race_day[1], previous, custom_team)
            races_performances.append(performances)
            previous = performances

        all_races = self.get_all_races()
        return races_performances, all_races

    def get_first_day_season(self):
        query = """
        SELECT Number, COUNT(*) as Occurrences
        FROM (
            SELECT DayCreated as Number FROM Parts_Designs
            UNION ALL
            SELECT DayCompleted as Number FROM Parts_Designs
        ) Combined
        GROUP BY Number
        ORDER BY Occurrences DESC
        LIMIT 1;
        """
        first_day = self.cursor.execute(query).fetchone()[0]
        return first_day

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
    

    def fetch_max_design(self):
        return self.cursor.execute("SELECT MAX(DesignID) FROM Parts_Designs").fetchone()[0]
    
    