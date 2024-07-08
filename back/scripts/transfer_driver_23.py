import sqlite3
import random

def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    text = option.lower()
    params = text.split()

    if(params[0] == "fire"):
        driver_id = (params[1],)
        position = cursor.execute(f"SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = {driver_id[0]}").fetchone()
        cursor.execute(f"DELETE FROM Staff_Contracts WHERE StaffID = {driver_id[0]}")
    #deletes the driver you're replacing current contract
        if(position[0] != 3):
            cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = {driver_id[0]}")  # takes him out of his car
        engineer_id = cursor.execute(f"SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = {driver_id[0]}").fetchone()
        if engineer_id is not None:
            cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = {engineer_id[0]} AND DriverID = {driver_id[0]}")

    elif(params[0] == "hire"):
        year_iteration = params[4]
        driver_id = (params[1],)
        
        new_team = params[2].capitalize() 
        new_team_id = params[2]

        day = cursor.execute("SELECT Day FROM Player_State").fetchone()
        year =  cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()

        if(len(params) == 4 or len(params) == 5):
            tier = get_tier(driver_id)
            if(tier == 1):
                salary = str(round(random.uniform(14, 30),3)*1000000) 
                starting_bonus = str(round(random.uniform(2, 4.5), 3)*1000000)
                race_bonus = str(round(random.uniform(1.5, 2.5), 3)*1000000)
                year_end = str(random.randint(1, 5) + year[0])   
                has_bonus = True
            elif(tier == 2):
                salary = str(round(random.uniform(7, 12),3)*1000000) 
                starting_bonus = str(round(random.uniform(1, 2), 3)*1000000)
                year_end = str(random.randint(1, 4) + year[0])   
                if(random.randint(0, 10) <= 7):
                    has_bonus = True
                    race_bonus = str(round(random.uniform(0.9, 1.7), 3)*1000000)
                else:
                    has_bonus = False
                    race_bonus = str(0)
            elif(tier == 3):
                salary = str(round(random.uniform(0.5, 6),3)*1000000) 
                starting_bonus = str(round(random.uniform(0, 1.6), 3)*1000000)
                year_end = str(random.randint(1, 3) + year[0])   
                if(random.randint(0, 10) <= 2):
                    has_bonus = True
                    race_bonus = str(round(random.uniform(0, 0.7), 3)*1000000)
                else:
                    has_bonus = False
                    race_bonus = str(0)
            elif(tier == 4):
                salary = str(round(random.uniform(0.2, 1.9),3)*1000000)
                year_end = str(random.randint(1, 2) + year[0])   
                starting_bonus = str(0)
                race_bonus = str(0)
                has_bonus = False
            driver_birth_date = cursor.execute(f"SELECT DOB_ISO FROM Staff_BasicData WHERE StaffID = {driver_id[0]}").fetchone()
            yob = driver_birth_date[0].split("-")[0]
            if(year[0] - int(yob) > 34):
                year_end = str(random.randint(1, 2) + year[0])

            #print(tier)
            
            if(has_bonus):
                prestige_table_name = "Board_Prestige"
                if year_iteration == "24":
                    prestige_table_name = "Board_TeamRating"
                prestige_values = cursor.execute(f"SELECT PtsFromConstructorResults, PtsFromDriverResults, PtsFromSeasonsEntered, PtsFromChampionshipsWon FROM {prestige_table_name} WHERE SeasonID = {year[0]} AND TeamID = {new_team_id}").fetchall()
                prestige = 0
                for i in range(len(prestige_values)):
                    prestige += prestige_values[i][0]

                if(prestige >= 750):
                    race_bonus_pos = str(random.randint(1, 3))
                elif(prestige >= 600):
                    race_bonus_pos = str(random.randint(2, 5))
                elif(prestige >= 525):
                    race_bonus_pos = str(random.randint(7, 10))
                elif(prestige >= 450):
                    race_bonus_pos = str(random.randint(9, 10))
                else:
                    race_bonus = str(0)
                    race_bonus_pos = str(1)
            else: race_bonus_pos = str(1) 
            
            if(len(params) != 5):
                number_1s_team = len(cursor.execute(f"SELECT con.PosInTeam FROM Staff_Contracts con JOIN Staff_BasicData com ON con.StaffID = com.StaffID WHERE con.ContractType = 0 AND con.TeamID = {new_team_id} AND con.PosInTeam = 1").fetchall())
                number_2s_team = len(cursor.execute(f"SELECT con.PosInTeam FROM Staff_Contracts con JOIN Staff_BasicData com ON con.StaffID = com.StaffID WHERE con.ContractType = 0 AND con.TeamID = {new_team_id} AND con.PosInTeam = 2").fetchall())
                number_3s_team = len(cursor.execute(f"SELECT con.PosInTeam FROM Staff_Contracts con JOIN Staff_BasicData com ON con.StaffID = com.StaffID WHERE con.ContractType = 0 AND con.TeamID = {new_team_id} AND con.PosInTeam = 3").fetchall())
                if(number_1s_team != 1): car_in_team = 1
                elif(number_2s_team != 1): car_in_team = 2
                elif(number_3s_team != 1): car_in_team = 3
                #print(number_1s_team, number_2s_team, number_3s_team,car_in_team)
            elif(params[3] == "reserve"):
                car_in_team = 3
            else:
                car_in_team = params[3]
            #print(number_1s_team, number_2s_team, number_3s_team)


            #print(salary, year_end, starting_bonus, race_bonus, race_bonus_pos, car_in_team)
        else:
            car_in_team = params[3]
            salary = params[4]
            starting_bonus = params[5]
            race_bonus = params[6]
            race_bonus_pos = params[7]
            year_end = params[8]



            #default values for some arguments
            if(starting_bonus == "none"):
                starting_bonus = "0"

            if(race_bonus == "none"):
                race_bonus = "0"
                race_bonus_pos = "10"
        isRetired = cursor.execute(f"SELECT Retired FROM Staff_GameData WHERE StaffID = {driver_id[0]}").fetchone()
        if isRetired[0] == 1:
            cursor.execute(f"UPDATE Staff_GameData SET Retired = 0 WHERE StaffID = {driver_id[0]}")

        if year_iteration == "23":
            cursor.execute(f"INSERT INTO Staff_Contracts VALUES ({driver_id[0]}, 0, 1, {day[0]}, 1, {new_team_id}, {car_in_team}, 1, '[OPINION_STRING_NEUTRAL]', {day[0]}, {year_end}, 1, '[OPINION_STRING_NEUTRAL]', {salary}, 1, '[OPINION_STRING_NEUTRAL]', {starting_bonus}, 1, '[OPINION_STRING_NEUTRAL]', {race_bonus}, 1, '[OPINION_STRING_NEUTRAL]', {race_bonus_pos}, 1, '[OPINION_STRING_NEUTRAL]', 0, 1, '[OPINION_STRING_NEUTRAL]')")
        elif year_iteration == "24":
            cursor.execute(f"INSERT INTO Staff_Contracts VALUES ({driver_id[0]}, 0, {new_team_id}, {car_in_team}, {day[0]}, {year_end},  {salary}, {starting_bonus}, {race_bonus}, {race_bonus_pos}, 0.5, 0)")
        if int(car_in_team) != 3:
            cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = {car_in_team} WHERE StaffID = {driver_id[0]}")

            #checks if the driver was in the standings and if it wasn't it updates the standings
            position_in_standings = cursor.execute(f"SELECT MAX(Position) FROM Races_DriverStandings WHERE SeasonID = {year[0]} AND RaceFormula = 1").fetchone()
            points_driver_in_standings = cursor.execute(f"SELECT Points FROM Races_DriverStandings WHERE DriverID = {driver_id[0]} AND SeasonID = {year[0]} AND RaceFormula = 1").fetchone()

        
            if points_driver_in_standings is None:
                points_driver_in_standings = (0,)
                cursor.execute(f"INSERT INTO Races_DriverStandings VALUES ({year[0]}, {driver_id[0]}, {points_driver_in_standings[0]}, {position_in_standings[0] + 1}, 0, 0, 1)")

            was_in_f2 = cursor.execute(f"SELECT Points FROM Races_DriverStandings WHERE DriverID = {driver_id[0]} AND SeasonID = {year[0]} AND RaceFormula = 2").fetchone()
            was_in_f3 = cursor.execute(f"SELECT Points FROM Races_DriverStandings WHERE DriverID = {driver_id[0]} AND SeasonID = {year[0]} AND RaceFormula = 3").fetchone()

            if was_in_f2 is not None:
                # print("was in f2")
                cursor.execute(f"DELETE FROM Races_DriverStandings WHERE DriverID = {driver_id[0]} AND SeasonID = {year[0]} AND RaceFormula = 2")
            if was_in_f3 is not None:
                # print("was in f3")
                cursor.execute(f"DELETE FROM Races_DriverStandings WHERE DriverID = {driver_id[0]} AND SeasonID = {year[0]} AND RaceFormula = 3")



            engineers = cursor.execute(f"SELECT con.StaffID FROM Staff_Contracts con JOIN Staff_BasicData com ON con.StaffID = com.StaffID WHERE con.TeamID = {new_team_id}").fetchall()
            # print(engineers)
            for i in range(len(engineers)):
                engineer_available = cursor.execute(f"SELECT MAX(IsCurrentAssignment) FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineers[i][0]}").fetchone()
                if engineer_available[0] == 0:
                    engineer_available_id = engineers[i]

            pair_exists = cursor.execute(f"SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineer_available_id[0]} AND DriverID = {driver_id[0]}").fetchone()

            if pair_exists is not None:
                cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = {engineer_available_id[0]} AND DriverID = {driver_id[0]}")
            else:
                cursor.execute(f"INSERT INTO Staff_RaceEngineerDriverAssignments VALUES ({engineer_available_id[0]}, {driver_id[0]}, 0, 0, 1)")

        

        #gives new numbers to newcommers in f1
        driver_has_number = cursor.execute(f"SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder = {driver_id[0]}").fetchone()
        if driver_has_number is None:
            free_numbers = cursor.execute("SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder IS NULL AND Number != 0").fetchall()
            rand_index = random.randrange(len(free_numbers))
            new_num = free_numbers[rand_index]
            cursor.execute(f"UPDATE Staff_DriverNumbers SET CurrentHolder = {driver_id[0]} WHERE Number = {new_num[0]}")

    elif(params[0] == "swap"):
        driver_1_id = (params[1],)
        driver_2_id = (params[2],)

        position_1 = cursor.execute(f"SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = {driver_1_id[0]}").fetchone()
        position_2 = cursor.execute(f"SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = {driver_2_id[0]}").fetchone()
        team_1_id = cursor.execute(f"SELECT TeamID FROM Staff_Contracts WHERE StaffID = {driver_1_id[0]}").fetchone()
        team_2_id = cursor.execute(f"SELECT TeamID FROM Staff_Contracts WHERE StaffID = {driver_2_id[0]}").fetchone()
        year =  cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()

        if(position_1[0] != 3 and position_2[0] != 3):
            #no reserve drivers
            engineer_1_id = cursor.execute(f"SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = {driver_1_id[0]}").fetchone()
            engineer_2_id = cursor.execute(f"SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = {driver_2_id[0]}").fetchone()
            cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_1_id[0]}")
            cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_2_id[0]}")

            pair_1new_exists = cursor.execute(f"SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_1_id[0]}").fetchone()
            if pair_1new_exists is not None:
                cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_1_id[0]}")
            else:
                cursor.execute(f"INSERT INTO Staff_RaceEngineerDriverAssignments VALUES ({engineer_2_id[0]}, {driver_1_id[0]}, 0, 0, 1)")

            pair_2new_exists = cursor.execute(f"SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_2_id[0]}").fetchone()
            if pair_2new_exists is not None:
                cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_2_id[0]}")
            else:
                cursor.execute(f"INSERT INTO Staff_RaceEngineerDriverAssignments VALUES ({engineer_1_id[0]}, {driver_2_id[0]}, 0, 0, 1)")

        
            cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_2_id[0]}, PosInTeam = {position_2[0]} WHERE ContractType = 0 AND StaffID = {driver_1_id[0]}")
            cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_1_id[0]}, PosInTeam = {position_1[0]} WHERE ContractType = 0 AND StaffID = {driver_2_id[0]}")
            cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = {position_2[0]} WHERE StaffID = {driver_1_id[0]}")
            cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = {position_1[0]} WHERE StaffID = {driver_2_id[0]}")

        
        elif position_1[0] == 3 and position_2[0] == 3:
            # both reserves
            cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_2_id[0]} WHERE ContractType = 0 AND StaffID = {driver_1_id[0]}")
            cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_1_id[0]} WHERE ContractType = 0 AND StaffID = {driver_2_id[0]}")
        elif position_1[0] == 3:
            # driver 1 reserve
            engineer_2_id = cursor.execute(f"SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = {driver_2_id[0]}").fetchone()
            cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_2_id[0]}")


            pair_1new_exists = cursor.execute(f"SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_1_id[0]}").fetchone()
            if pair_1new_exists is not None:
                cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_1_id[0]}")
            else:
                cursor.execute(f"INSERT INTO Staff_RaceEngineerDriverAssignments VALUES ({engineer_2_id[0]}, {driver_1_id[0]}, 0, 0, 1)")

            position_1in_standings = cursor.execute(f"SELECT MAX(Position) FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = {year[0]}").fetchone()
            points_driver1_in_standings = cursor.execute(f"SELECT Points FROM Races_DriverStandings WHERE RaceFormula = 1 AND DriverID = {driver_1_id[0]} AND SeasonID = {year[0]}").fetchone()

        
            if points_driver1_in_standings is None:
                points_driver1_in_standings = (0,)
                cursor.execute(f"INSERT INTO Races_DriverStandings VALUES ({year[0]}, {driver_1_id[0]}, {points_driver1_in_standings[0]}, {position_1in_standings[0] + 1}, 0, 0, 1)")

            cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_1_id[0]}, PosInTeam = {position_1[0]} WHERE ContractType = 0 AND StaffID = {driver_2_id[0]}")
            cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = {driver_2_id[0]}")
            cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_2_id[0]}, PosInTeam = {position_2[0]} WHERE ContractType = 0 AND StaffID = {driver_1_id[0]}")
            cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = {position_2[0]} WHERE StaffID = {driver_1_id[0]}")

        elif(position_2[0] == 3):
            #driver 2 reserve
            engineer_1_id = cursor.execute(f"SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = {driver_1_id[0]}").fetchone()
            cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_1_id[0]}")

            pair_2new_exists = cursor.execute(f"SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_2_id[0]}").fetchone()
            if pair_2new_exists is not None:
                cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_2_id[0]}")
            else:
                cursor.execute(f"INSERT INTO Staff_RaceEngineerDriverAssignments VALUES ({engineer_1_id[0]}, {driver_2_id[0]}, 0, 0, 1)")


            #checks if the driver was in the standings and if it wasn't it updates the standings
            position_2in_standings = cursor.execute(f"SELECT MAX(Position) FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = {year[0]}").fetchone()
            points_driver2_in_standings = cursor.execute(f"SELECT Points FROM Races_DriverStandings WHERE RaceFormula = 1 AND DriverID = {driver_2_id[0]} AND SeasonID = {year[0]}").fetchone()

            if points_driver2_in_standings is None:
                points_driver2_in_standings = (0,)
                cursor.execute(f"INSERT INTO Races_DriverStandings VALUES ({year[0]}, {driver_2_id[0]}, {points_driver2_in_standings[0]}, {position_2in_standings[0] + 1}, 0, 0, 1)")

            cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_2_id[0]}, PosInTeam = {position_2[0]} WHERE ContractType = 0 AND StaffID = {driver_1_id[0]}")
            cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = {driver_1_id[0]}")
            cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_1_id[0]}, PosInTeam = {position_1[0]} WHERE ContractType = 0 AND StaffID = {driver_2_id[0]}")
            cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = {position_1[0]} WHERE StaffID = {driver_2_id[0]}")


    elif(params[0] == "renew"):
        driver_id = get_driver_id(params[1])
        more_seasons = params[2]
        if(len(params) == 4):
            new_salary = params[3]
        else:
            actual_salary = cursor.execute(f"SELECT Salary FROM Staff_Contracts WHERE ContractType = 0 AND StaffID = {driver_id[0]}").fetchone()
            tier = get_tier(driver_id)
            if(tier == 1):
                addOn = round(random.uniform(0, 5),3)*1000000 
            elif(tier == 2):
                addOn = round(random.uniform(0, 2),3)*1000000
            elif(tier == 3):
                addOn = round(random.uniform(0, 1),3)*1000000
            elif(tier == 4):
                addOn = 0
            new_salary = int(actual_salary[0]) + addOn

        actual_year = cursor.execute(f"SELECT EndSeason FROM Staff_Contracts WHERE ContractType = 0 AND StaffID = {driver_id[0]}").fetchone()
        new_year = int(actual_year[0]) + int(more_seasons)
        cursor.execute(f"UPDATE Staff_Contracts SET Salary = {new_salary}, EndSeason = {new_year} WHERE ContractType = 0 AND StaffID = {driver_id[0]}")
        # print(f"Succesfully renewed contract to the season {new_year} with {new_salary} as the salary")

    elif params[0] == "check":
        driver_id = get_driver_id(params[1])
        actual_year = cursor.execute(f"SELECT EndSeason FROM Staff_Contracts WHERE ContractType = 0 AND StaffID = {driver_id[0]}").fetchone()

        # print(f"{params[1]}'s contract ends in {actual_year[0]}")

    elif(params[0] == "editcontract"):
        params_to_update = params[1:7]
        
        query = "UPDATE Staff_Contracts SET Salary=?, EndSeason=?, StartingBonus=?, RaceBonus=?, RaceBonusTargetPos=? WHERE ContractType = 0 AND StaffID =?"
        cursor.execute(query, params_to_update)




    conn.commit()
    conn.close()

def unretire(driverID):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    cursor.execute(f"UPDATE Staff_Contracts SET PosInTeam = 1 WHERE StaffID = {driverID}")

    conn.commit()
    conn.close()

def get_tier(driverID):

    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    driver_stats = cursor.execute(f"SELECT Val FROM Staff_PerformanceStats WHERE StaffID = {driverID[0]}").fetchall()
    cornering = float(driver_stats[0][0])
    braking = float(driver_stats[1][0])
    control = float(driver_stats[2][0])
    smoothness = float(driver_stats[3][0])
    adaptability = float(driver_stats[4][0])
    overtaking = float(driver_stats[5][0])
    defence = float(driver_stats[6][0])
    reactions = float(driver_stats[7][0])
    accuracy = float(driver_stats[8][0])
    rating = (cornering + braking*0.75 + reactions*0.5 +control*0.75 + smoothness*0.5 + accuracy*0.75 + adaptability*0.25 + overtaking*0.25+ defence*0.25)/5
    if(rating >= 86): tier = 1
    elif(rating >= 81): tier = 2
    elif(rating >= 77): tier = 3
    else: tier = 4

    conn.commit()
    conn.close()
    return tier

def get_driver_id(name):
    conn = sqlite3.connect("scripts/result/main.db")
    cursor = conn.cursor()

    driver = name.capitalize()
    #gets the driver id of the driver you want to transfer
    multiple_drivers = ["Perez", "Raikkonen", "Hulkenberg", "Toth", "Stanek", "Villagomez", "Bolukbasi", "Marti"]
    for i in range(len(multiple_drivers)):
        if(driver == multiple_drivers[i]):
            driver = driver + "1"

    if(driver == "Aleclerc"):
        driver_id = (132,)  
    elif(driver == "Devries"):
        driver_id = (76,)     
    elif(driver == "Dschumacher"):
        driver_id = (270,)   
    else:
        driver_id = cursor.execute(f"SELECT StaffID FROM Staff_BasicData WHERE LastName = '[StaffName_Surname_{driver}]'").fetchone()
    
    # print(name, driver_id)

    return driver_id

if __name__ == '__main__':
    run_script()