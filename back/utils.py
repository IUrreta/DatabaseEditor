import random
import math
import re

class DatabaseUtils:
    def __init__(self, connection):
        self.cursor = connection.cursor()


    def argb_to_hex(self, argb):
        hex_value = f"{argb:08X}"
        red = int(hex_value[2:4], 16)
        green = int(hex_value[4:6], 16)
        blue = int(hex_value[6:8], 16)
        print(red, green, blue)
        
        # Función para aclarar un color oscuro
        def lighten_color(value):
            return min(255, int(value + (255 - value) * 0.19))
        
        # Definir un umbral para considerar un color como oscuro
        threshold = 120
        
        if red < threshold and green < threshold and blue < threshold:
            red = lighten_color(red)
            green = lighten_color(green)
            blue = lighten_color(blue)
        
        return f"#{red:02X}{green:02X}{blue:02X}"

    def check_year_save(self):
        result = self.cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='Countries_RaceRecord'").fetchone()
        if result is not None:
            name = self.cursor.execute("SELECT TeamNameLocKey FROM Teams WHERE TeamID = 32").fetchone()
            pattern = r"\[STRING_LITERAL:Value=\|(.*?)\|\]"
            match = re.search(pattern, name[0])
            if match:
                print(match.group(1))
                name = match.group(1)
                primary_color = self.argb_to_hex(self.cursor.execute("SELECT Colour FROM Teams_Colours WHERE TeamID = 32 AND ColourID = 0").fetchone()[0])
                secondary_color = self.argb_to_hex(self.cursor.execute("SELECT Colour FROM Teams_Colours WHERE TeamID = 32 AND ColourID = 1").fetchone()[0])
            else:
                name = None
                primary_color = None
                secondary_color = None
            return ["24", name, primary_color, secondary_color]
        else:
            return ["23", None, None, None]


    def fetch_driverNumebrs(self):
        numbers = self.cursor.execute("SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder IS NULL").fetchall()
        numList = []
        for num in numbers:
            if num[0] != 1 and num[0] != 0:
                numList.append(num[0])
        return numList

    def fetch_teamsStadings(self, year):
        res = self.cursor.execute(f"SELECT TeamID, Position FROM Races_TeamStandings WHERE SeasonID = {year} AND RaceFormula = 1").fetchall()
        return res

    def fetch_driverRetirement(self, driverID):
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        retirement_age = self.cursor.execute(f"SELECT RetirementAge FROM Staff_GameData WHERE StaffID = {driverID}").fetchone()
        dob = self.cursor.execute(f"SELECT DOB FROM Staff_BasicData WHERE StaffID = {driverID}").fetchone()
        return [retirement_age[0], math.floor((day_season[0] - dob[0]) /365.25)]

    def fetch_mentality(self, staffID):
        morale = self.cursor.execute(f"SELECT Opinion FROM Staff_Mentality_AreaOpinions WHERE StaffID = {staffID}").fetchall()
        return morale

    def fetchDriverNumberDetails(self, driverID):
        num = self.cursor.execute(f"SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder = {driverID}").fetchone()
        if num == None:
            nums = self.cursor.execute("SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder IS NULL").fetchall()
            num = random.choice(nums)
        wants1 = self.cursor.execute(f"SELECT WantsChampionDriverNumber FROM Staff_DriverData WHERE StaffID = {driverID}").fetchone()

        return[num[0], wants1[0]]

    def fetch_engines(self):
        engines_ids = [1,10,4,7]
        stats_ids = [6,10,11,12,14]
        ers_ids = [2, 11, 5, 8]
        gearboxes_ids = [3,12,6,9]
        lista = []
        for i in range(len(engines_ids)):
            statList = []
            for stat in stats_ids:
                res = self.cursor.execute(f"SELECT UnitValue FROM Parts_Designs_StatValues WHERE DesignID = {engines_ids[i]} AND PartStat = {stat}").fetchone()
                statList.append(res[0])
            ers_res = self.cursor.execute(f"SELECT UnitValue FROM Parts_Designs_StatValues WHERE DesignID = {ers_ids[i]} AND PartStat = 15").fetchone()
            statList.append(ers_res[0])
            gearbox_res = self.cursor.execute(f"SELECT UnitValue FROM Parts_Designs_StatValues WHERE DesignID = {gearboxes_ids[i]} AND PartStat = 15").fetchone()
            statList.append(gearbox_res[0])
            engineInfo = (engines_ids[i], statList)
            lista.append(engineInfo)

        return lista


    def fetch_driverContract(self, id):
        details = self.cursor.execute(f"SELECT Salary, EndSeason, StartingBonus, RaceBonus, RaceBonusTargetPos FROM Staff_Contracts WHERE ContractType = 0 AND StaffID = {id}").fetchone()
        return details
    
    def fetch_year(self):
        season = self.cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()
        return season[0]

    def fetch_staff(self, game_year):
        staff = self.cursor.execute("SELECT DISTINCT bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, gam.StaffType FROM Staff_GameData gam JOIN Staff_BasicData bas ON gam.StaffID = bas.StaffID  LEFT JOIN Staff_Contracts con ON bas.StaffiD = con.StaffID WHERE gam.StaffType != 0 AND (con.ContractType = 0 OR con.ContractType IS NULL OR con.ContractType = 3) GROUP BY bas.StaffID ORDER BY CASE WHEN con.TeamID IS NULL THEN 1 ELSE 0 END, con.TeamID").fetchall()
        formatted_tuples = []

        for tupla in staff:
            id = tupla[2]
            if tupla[0] != "Placeholder":
                result = self.format_names_get_stats(tupla, "staff"+str(tupla[4]))
                retirement = self.fetch_driverRetirement(id)
                race_formula = self.fetch_raceFormula(id)
                if race_formula[0] == None:
                    race_formula = (4,)
                data_dict = {i: result[i] for i in range(len(result))}
                data_dict["retirement_age"] = retirement[0]
                data_dict["age"] = retirement[1]
                data_dict["race_formula"] = race_formula[0]
                if game_year == "24":
                    mentality = self.fetch_mentality(id)
                    if mentality:
                        data_dict["mentality0"] = mentality[0][0]
                        data_dict["mentality1"] = mentality[1][0]
                        data_dict["mentality2"] = mentality[2][0]
                    else:
                        result += (-1,)
                formatted_tuples.append(data_dict)
            

        return formatted_tuples

    def fetch_seasonResults(self, yearSelected): 
        year =  (yearSelected, )
        drivers = self.cursor.execute(f"SELECT DriverID FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = {year[0]}").fetchall()
        seasonResults = []
        for driver in drivers:
                driverRes = self.fetch_oneDriver_seasonResults(driver, year)
                if(driverRes):
                    seasonResults.append(driverRes)
        return seasonResults

    def fetch_oneTeam_seasonResults(self, team, year):
        drivers = self.cursor.execute(f"SELECT DISTINCT DriverID FROM Races_Results WHERE Season = {year[0]} AND TeamID = {team[0]}").fetchall()
        results = [self.fetch_oneDriver_seasonResults(driver, year) for driver in drivers]
        return results

    def fetch_oneDriver_seasonResults(self, driver, year):
        results = self.cursor.execute(f"SELECT DriverID, TeamID, FinishingPos, Points FROM Races_Results WHERE Season = {year[0]} AND DriverID = {driver[0]}").fetchall()
        if results:
            sprintResults = self.cursor.execute(f"SELECT RaceID, FinishingPos, ChampionshipPoints FROM Races_SprintResults WHERE SeasonID = {year[0]} AND DriverID = {driver[0]}").fetchall()
            teamID = results[0][1]
            driverName = self.cursor.execute(f"SELECT FirstName, LastName FROM Staff_BasicData WHERE StaffID = {driver[0]}").fetchone()
            return self.format_seasonResults(results, driverName, teamID, driver, year, sprintResults)
        

    def fetch_predictable_events_from(self, year):
        last_predictable = self.fetch_next_race()
        season_events = self.cursor.execute(f"SELECT TrackID FROM Races WHERE SeasonID = {year} AND RaceID <= {last_predictable[0]}").fetchall()
        tuple_numbers = {num for tpl in season_events for num in tpl}
        season_ids = self.cursor.execute(f"SELECT RaceID FROM Races WHERE SeasonID = {year} AND RaceID <= {last_predictable[0]}").fetchall()
        events_ids =[]
        for i in range(len(season_ids)):
            events_ids.append((season_ids[i][0], season_events[i][0]))

        return events_ids

    def fetch_events_done_from(self, year):
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        season_ids = self.cursor.execute(f"SELECT RaceID FROM Races WHERE SeasonID = {year} AND Day < {day_season[0]}").fetchall()
        events_ids =[]
        for i in range(len(season_ids)):
            events_ids.append((season_ids[i][0]))

        return events_ids

    def fetch_events_from(self, year):
        season_events = self.cursor.execute(f"SELECT TrackID FROM Races WHERE SeasonID = {year}").fetchall()
        tuple_numbers = {num for tpl in season_events for num in tpl}

        season_ids = self.cursor.execute(f"SELECT RaceID FROM Races WHERE SeasonID = {year}").fetchall()
        events_ids =[]
        for i in range(len(season_ids)):
            events_ids.append((season_ids[i][0], season_events[i][0]))

        return events_ids

    def format_seasonResults(self, results, driverName, teamID, driverID, year, sprints):
        nombre_pattern = r'StaffName_Forename_(Male|Female)_(\w+)'
        apellido_pattern = r'StaffName_Surname_(\w+)'

        nombre_match = re.search(nombre_pattern, driverName[0])
        apellido_match = re.search(apellido_pattern, driverName[1])

        nombre = self.remove_number(nombre_match.group(2))
        apellido = self.remove_number(apellido_match.group(1))
        name_formatted = f"{nombre} {apellido}"
        
        races_participated = self.cursor.execute(f"SELECT RaceID FROM Races_Results WHERE DriverID = {driverID[0]} AND Season = {year[0]}").fetchall()
        formatred_results = [(result[-2], result[-1]) for result in results]
        for i in range(len(races_participated)):
            driver_with_fastest_lap = self.cursor.execute(f"SELECT DriverID FROM Races_Results WHERE FastestLap > 0 AND RaceID = {races_participated[i][0]} AND Season = {year[0]} ORDER BY FastestLap LIMIT 1;").fetchone()
            dnfd = self.cursor.execute(f"SELECT DNF FROM Races_Results WHERE DriverID = {driverID[0]} AND Season = {year[0]} AND RaceID = {races_participated[i][0]}").fetchone()
            formatred_results[i] = (races_participated[i][0],)  + formatred_results[i]
            if dnfd[0] == 1:
                results_list = list(formatred_results[i])
                results_list[-1] = -1
                results_list[-2] = -1
                formatred_results[i] = tuple(results_list)
            if driver_with_fastest_lap[0] == driverID[0]:
                results_list = list(formatred_results[i])
                results_list.append(1)
                formatred_results[i] = tuple(results_list)
            else:
                results_list = list(formatred_results[i])
                results_list.append(0)
                formatred_results[i] = tuple(results_list)
            QStage = self.cursor.execute(f"SELECT MAX(QualifyingStage) FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID = {races_participated[i][0]} AND SeasonID = {year[0]} AND DriverID = {driverID[0]}").fetchone()
            QRes = self.cursor.execute(f"SELECT FinishingPos FROM Races_QualifyingResults WHERE RaceFormula = 1 AND RaceID = {races_participated[i][0]} AND SeasonID = {year[0]} AND DriverID = {driverID[0]} AND QualifyingStage = {QStage[0]}").fetchone()
            results_list = list(formatred_results[i])
            results_list.append(QRes[0])
            formatred_results[i] = tuple(results_list)


        for tupla1 in sprints:
            for i, tupla2 in enumerate(formatred_results):
                if tupla1[0] == tupla2[0]:
                    formatred_results[i] = tupla2 + (tupla1[2], tupla1[1])

        for i in range(len(formatred_results)):
            team_in_race = self.cursor.execute(f"SELECT TeamID FROM Races_Results WHERE RaceID = {formatred_results[i][0]} AND DriverID = {driverID[0]}").fetchone()
            formatred_results[i] += (team_in_race)

        
        position = self.cursor.execute(f"SELECT Position FROM Races_Driverstandings WHERE RaceFormula = 1 AND SeasonID = {year[0]} AND DriverID = {driverID[0]}").fetchone()

        formatred_results.insert(0, position[0])
        formatred_results.insert(0, teamID)
        formatred_results.insert(0, name_formatted)
        return formatred_results

    def fetch_drivers_per_year(self, year):
        drivers = self.cursor.execute(f"SELECT bas.FirstName, bas.LastName, res.DriverID, res.TeamID FROM Staff_BasicData bas JOIN Races_Results res ON bas.StaffID = res.DriverID WHERE Season = {year} GROUP BY bas.FirstName, bas.LastName, bas.StaffID, res.TeamID ORDER BY res.TeamID").fetchall()
        formatted_tuples = []
        for tupla in drivers:
            result = self.format_names_simple(tupla)
            formatted_tuples.append(result)
        return formatted_tuples

    def fetch_info(self, game_year):
        drivers = self.cursor.execute('SELECT DISTINCT bas.FirstName, bas.LastName, bas.StaffID, con.TeamID, con.PosInTeam, MIN(con.ContractType) AS MinContractType, gam.Retired, COUNT(*) FROM Staff_BasicData bas JOIN Staff_DriverData dri ON bas.StaffID = dri.StaffID LEFT JOIN Staff_Contracts con ON dri.StaffID = con.StaffID LEFT JOIN Staff_GameData gam ON dri.StaffID = gam.StaffID GROUP BY bas.StaffID ORDER BY CASE WHEN con.TeamID IS NULL THEN 1 ELSE 0 END, con.TeamID;').fetchall()
        formatted_tuples = []
        for tupla in drivers:
            id = tupla[2]
            if tupla[0] != "Placeholder":
                result = self.format_names_get_stats(tupla, "driver")
                retirement = self.fetch_driverRetirement(id)
                race_formula = self.fetch_raceFormula(id)
                if race_formula[0] == None:
                    race_formula = (4,)
                driver_number = self.fetchDriverNumberDetails(id)
                superlicense = self.fetch_superlicense(id)
                data_dict = {i: result[i] for i in range(len(result))}
                data_dict["driver_number"] = driver_number[0]
                data_dict["wants1"] = driver_number[1]
                data_dict["retirement_age"] = retirement[0]
                data_dict["age"] = retirement[1]
                data_dict["superlicense"] = superlicense[0]
                data_dict["race_formula"] = race_formula[0]
                if game_year == "24":
                    mentality = self.fetch_mentality(id)
                    if mentality:
                        data_dict["mentality0"] = mentality[0][0]
                        data_dict["mentality1"] = mentality[1][0]
                        data_dict["mentality2"] = mentality[2][0]                
                if game_year == "24":
                    marketability = self.fetch_marketability(id)
                    data_dict["marketability"] = marketability[0]
                formatted_tuples.append(data_dict)

        return formatted_tuples
    
    def fetch_raceFormula(self, driverID):
        category = self.cursor.execute(f"SELECT MAX(CASE WHEN (TeamID <= 10 OR TeamID = 32) THEN 1 WHEN TeamID BETWEEN 11 AND 21 THEN 2 WHEN TeamID BETWEEN 22 AND 31 THEN 3 ELSE 4 END) FROM Staff_Contracts WHERE ContractType = 0 AND StaffID = {driverID}").fetchone()
        return category
    
    def fetch_marketability(self, driverID):
        marketability = self.cursor.execute(f"SELECT Marketability FROM Staff_DriverData WHERE StaffID = {driverID}").fetchone()
        return marketability
    
    def fetch_superlicense(self, driverID):
        superlicense = self.cursor.execute(f"SELECT HasSuperLicense FROM Staff_DriverData WHERE StaffID = {driverID}").fetchone()
        return superlicense

    def fetch_next_race(self):
        race = self.cursor.execute("SELECT MIN(RaceID) FROM Races WHERE State = 0").fetchone()
        if race[0] == None:
            race = self.cursor.execute("SELECT MAX(RaceID) FROM Races WHERE State = 2").fetchone()
            race = (race[0]+1,)
        return race

    def fetch_calendar(self):
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        calendar = self.cursor.execute(f"SELECT TrackID, WeatherStatePractice, WeatherStateQualifying, WeatherStateRace, WeekendType, State FROM Races WHERE SeasonID = {day_season[1]}").fetchall()
        return calendar

    def check_claendar(self):
        default_tracks = [2, 1, 11, 24, 22, 5, 6, 4, 7, 10, 9, 12, 13, 14, 15, 17, 19, 18, 20, 21, 23, 25, 26]
        day_season = self.cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
        season_events = self.cursor.execute(f"SELECT TrackID FROM Races WHERE SeasonID = {day_season[1]}").fetchall()
        tuple_numbers = {num for tpl in season_events for num in tpl}
        first_race = self.cursor.execute(f"SELECT MIN(Day) FROM Races WHERE SeasonID = {day_season[1]}").fetchone()
        last_race_last_season = self.cursor.execute(f"SELECT MAX(RaceID) FROM Races WHERE SeasonID = {day_season[1]-1}").fetchone()
        first_race_curr_season = self.cursor.execute(f"SELECT MIN(RaceID) FROM Races WHERE SeasonID = {day_season[1]}").fetchone()


        season_ids = self.cursor.execute(f"SELECT RaceID FROM Races WHERE SeasonID = {day_season[1]}").fetchall()
        events_ids =[]
        for i in range(len(season_ids)):
            events_ids.append((season_ids[i][0], season_events[i][0]))

        are_all_numbers_present = all(num in tuple_numbers for num in default_tracks)
        has_first_race_done = day_season[0] < first_race[0]
        has_been_edited = last_race_last_season[0] + 1 == first_race_curr_season[0]

        # Definir la variable resultante
        resultCalendar = "1" if (are_all_numbers_present and has_first_race_done and has_been_edited) else "0"

        return resultCalendar

    def format_names_simple(self, name):
        nombre_pattern = r'StaffName_Forename_(Male|Female)_(\w+)'
        apellido_pattern = r'StaffName_Surname_(\w+)'


        nombre_match = re.search(nombre_pattern, name[0])
        apellido_match = re.search(apellido_pattern, name[1])


        nombre = self.remove_number(nombre_match.group(2))
        apellido = self.remove_number(apellido_match.group(1))
        name_formatted = f"{nombre} {apellido}"
        team_id = name[3] if name[3] is not None else 0

        resultado = (name_formatted, name[2], team_id)
        return resultado

    def format_names_get_stats(self, name, type):
        nombre_pattern = r'StaffName_Forename_(Male|Female)_(\w+)'
        apellido_pattern = r'StaffName_Surname_(\w+)'


        nombre_match = re.search(nombre_pattern, name[0])
        apellido_match = re.search(apellido_pattern, name[1])

        
        nombre = self.remove_number(nombre_match.group(2))
        apellido = self.remove_number(apellido_match.group(1))
        name_formatted = f"{nombre} {apellido}"
        team_id = name[3] if name[3] is not None else 0
        pos_in_team = name[4] if name[4] is not None else 0
        if type =="driver" and name[5] != 0:
            team_id = 0
            pos_in_team = 0

        if type == "driver":
            resultado = (name_formatted, name[2], team_id, pos_in_team, name[6])
        else:
            resultado = (name_formatted, name[2], team_id, pos_in_team)

        if type == "driver":
            stats = self.cursor.execute(f"SELECT Val FROM Staff_PerformanceStats WHERE StaffID = {name[2]} AND StatID BETWEEN 2 AND 10").fetchall()
            additionalStats = self.cursor.execute(f"SELECT Improvability, Aggression FROM Staff_DriverData WHERE StaffID = {name[2]}").fetchone()
            nums = resultado + tuple(stat[0] for stat in stats) + additionalStats

            return nums

        elif type == "staff1":
            stats = self.cursor.execute(f"SELECT Val FROM Staff_PerformanceStats WHERE StaffID = {name[2]} AND StatID IN (0,1,14,15,16,17);").fetchall()
            nums = resultado + tuple(stat[0] for stat in stats)

            return nums

        elif type == "staff2":
            stats = self.cursor.execute(f"SELECT Val FROM Staff_PerformanceStats WHERE StaffID = {name[2]} AND StatID IN (13,25,43);").fetchall()
            nums = resultado + tuple(stat[0] for stat in stats)

            return nums

        elif type == "staff3":
            stats = self.cursor.execute(f"SELECT Val FROM Staff_PerformanceStats WHERE StaffID = {name[2]} AND StatID IN (19,20,26,27,28,29,30,31);").fetchall()
            nums = resultado + tuple(stat[0] for stat in stats)

            return nums

        elif type == "staff4":
            stats = self.cursor.execute(f"SELECT Val FROM Staff_PerformanceStats WHERE StaffID = {name[2]} AND StatID IN (11,22,23,24);").fetchall()
            nums = resultado + tuple(stat[0] for stat in stats)

            return nums

    def remove_number(self, cadena):
        if cadena and cadena[-1].isdigit():
            cadena = cadena[:-1]
        return cadena