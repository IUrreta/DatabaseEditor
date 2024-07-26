import sqlite3
import random
import datetime

class TransferUtils:
    def __init__(self):
        self.conn = sqlite3.connect("../result/main.db")
        self.cursor = self.conn.cursor()

    def hire_driver(self, type, driverID, teamID, position, salary=None, starting_bonus=None, race_bonus=None, race_bonus_pos=None, year_end=None, year_iteration="24"):
        if type == "auto":
            salary, year_end, position, starting_bonus, race_bonus, race_bonus_pos = self.get_params_auto_contract(driverID, teamID, position)
        
        day = self.cursor.execute("SELECT Day FROM Player_State").fetchone()[0]
        year =  self.cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()[0]


        isRetired = self.cursor.execute(f"SELECT Retired FROM Staff_GameData WHERE StaffID = {driverID}").fetchone()
        if isRetired[0] == 1:
            self.cursor.execute(f"UPDATE Staff_GameData SET Retired = 0 WHERE StaffID = {driverID}")
        if year_iteration == "23":
            self.cursor.execute(f"INSERT INTO Staff_Contracts VALUES ({driverID}, 0, 1, {day}, 1, {teamID}, {position}, 1, '[OPINION_STRING_NEUTRAL]', {day[0]}, {year_end}, 1, '[OPINION_STRING_NEUTRAL]', {salary}, 1, '[OPINION_STRING_NEUTRAL]', {starting_bonus}, 1, '[OPINION_STRING_NEUTRAL]', {race_bonus}, 1, '[OPINION_STRING_NEUTRAL]', {race_bonus_pos}, 1, '[OPINION_STRING_NEUTRAL]', 0, 1, '[OPINION_STRING_NEUTRAL]')")
        elif year_iteration == "24":
            self.cursor.execute(f"INSERT INTO Staff_Contracts VALUES ({driverID}, 0, {teamID}, {position}, {day}, {year_end},  {salary}, {starting_bonus}, {race_bonus}, {race_bonus_pos}, 0.5, 0)")
        if int(position) < 3:
            self.cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = {position} WHERE StaffID = {driverID}")

            #checks if the driver was in the standings and if it wasn't it updates the standings
            position_in_standings = self.cursor.execute(f"SELECT MAX(Position) FROM Races_DriverStandings WHERE SeasonID = {year} AND RaceFormula = 1").fetchone()
            points_driver_in_standings = self.cursor.execute(f"SELECT Points FROM Races_DriverStandings WHERE DriverID = {driverID} AND SeasonID = {year} AND RaceFormula = 1").fetchone()

        
            if points_driver_in_standings is None:
                points_driver_in_standings = (0,)
                self.cursor.execute(f"INSERT INTO Races_DriverStandings VALUES ({year}, {driverID}, {points_driver_in_standings[0]}, {position_in_standings[0] + 1}, 0, 0, 1)")

            was_in_f2 = self.cursor.execute(f"SELECT Points FROM Races_DriverStandings WHERE DriverID = {driverID} AND SeasonID = {year} AND RaceFormula = 2").fetchone()
            was_in_f3 = self.cursor.execute(f"SELECT Points FROM Races_DriverStandings WHERE DriverID = {driverID} AND SeasonID = {year} AND RaceFormula = 3").fetchone()

            if was_in_f2 is not None:
                # print("was in f2")
                self.cursor.execute(f"DELETE FROM Races_DriverStandings WHERE DriverID = {driverID} AND SeasonID = {year} AND RaceFormula = 2")
            if was_in_f3 is not None:
                # print("was in f3")
                self.cursor.execute(f"DELETE FROM Races_DriverStandings WHERE DriverID = {driverID} AND SeasonID = {year} AND RaceFormula = 3")


            engineer_available = None
            engineer_available_id = None
            engineers = self.cursor.execute(f"SELECT con.StaffID FROM Staff_Contracts con JOIN Staff_BasicData com ON con.StaffID = com.StaffID WHERE con.TeamID = {teamID}").fetchall()
            # print(engineers)
            for i in range(len(engineers)):
                engineer_available = self.cursor.execute(f"SELECT MAX(IsCurrentAssignment) FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineers[i][0]}").fetchone()
                if engineer_available[0] == 0:
                    engineer_available_id = engineers[i]

            if engineer_available_id is not None:
                pair_exists = self.cursor.execute(f"SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineer_available_id[0]} AND DriverID = {driverID}").fetchone()

                if pair_exists is not None:
                    self.cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = {engineer_available_id[0]} AND DriverID = {driverID}")
                else:
                    self.cursor.execute(f"INSERT INTO Staff_RaceEngineerDriverAssignments VALUES ({engineer_available_id[0]}, {driverID}, 0, 0, 1)")

    
        #gives new numbers to newcommers in f1
        driver_has_number = self.cursor.execute(f"SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder = {driverID}").fetchone()
        if driver_has_number is None:
            free_numbers = self.cursor.execute("SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder IS NULL AND Number != 0").fetchall()
            rand_index = random.randrange(len(free_numbers))
            new_num = free_numbers[rand_index]
            self.cursor.execute(f"UPDATE Staff_DriverNumbers SET CurrentHolder = {driverID} WHERE Number = {new_num[0]}")


        self.conn.commit()
        self.conn.close()



    def get_params_auto_contract(self, driverID, teamID, position,  year_iteration="24"):
        day = self.cursor.execute("SELECT Day FROM Player_State").fetchone()
        year =  self.cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()
        tier = self.get_tier(driverID)
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
            salary = str(round(random.uniform(0.2, 1.2),3)*1000000)
            year_end = str(random.randint(1, 2) + year[0])   
            starting_bonus = str(0)
            race_bonus = str(0)
            has_bonus = False
        driver_birth_date = self.cursor.execute(f"SELECT DOB_ISO FROM Staff_BasicData WHERE StaffID = {driverID}").fetchone()
        yob = driver_birth_date[0].split("-")[0]
        if(year[0] - int(yob) > 34):
            year_end = str(random.randint(1, 2) + year[0])

        #print(tier)
        
        if(has_bonus):
            prestige_table_name = "Board_Prestige"
            if year_iteration == "24":
                prestige_table_name = "Board_TeamRating"
            prestige_values = self.cursor.execute(f"SELECT PtsFromConstructorResults, PtsFromDriverResults, PtsFromSeasonsEntered, PtsFromChampionshipsWon FROM {prestige_table_name} WHERE SeasonID = {year[0]} AND TeamID = {teamID}").fetchall()
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

        return salary, year_end, position, starting_bonus, race_bonus, race_bonus_pos
        


    def fire_driver(self, driverID, teamID):
        position = self.cursor.execute(f"SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = {driverID}").fetchone()
        self.cursor.execute(f"DELETE FROM Staff_Contracts WHERE StaffID = {driverID} AND ContractType = 0 AND TeamID = {teamID}")

        if(position[0] < 3):
            self.cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = {driverID}")  # takes him out of his car
        engineer_id = self.cursor.execute(f"SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = {driverID}").fetchone()
        if engineer_id is not None:
            self.cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = {engineer_id[0]} AND DriverID = {driverID}")

        self.conn.commit()
        self.conn.close()

    def swap_drivers(self, driver_1_id, driver_2_id):
        position_1 = self.cursor.execute(f"SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = {driver_1_id}").fetchone()
        position_2 = self.cursor.execute(f"SELECT PosInTeam FROM Staff_Contracts WHERE StaffID = {driver_2_id}").fetchone()
        team_1_id = self.cursor.execute(f"SELECT TeamID FROM Staff_Contracts WHERE StaffID = {driver_1_id}").fetchone()
        team_2_id = self.cursor.execute(f"SELECT TeamID FROM Staff_Contracts WHERE StaffID = {driver_2_id}").fetchone()
        year =  self.cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()

        if(position_1[0] < 3 and position_2[0] < 3):
            #no reserve drivers
            engineer_1_id = self.cursor.execute(f"SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = {driver_1_id}").fetchone()
            engineer_2_id = self.cursor.execute(f"SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = {driver_2_id}").fetchone()
            
            if engineer_2_id is not None:
                self.cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_2_id}")
                pair_1new_exists = self.cursor.execute(f"SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_1_id}").fetchone()
                if pair_1new_exists is not None:
                    self.cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_1_id}")
                else:
                    self.cursor.execute(f"INSERT INTO Staff_RaceEngineerDriverAssignments VALUES ({engineer_2_id[0]}, {driver_1_id}, 0, 0, 1)")

            if engineer_1_id is not None:
                self.cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_1_id}")
                pair_2new_exists = self.cursor.execute(f"SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_2_id}").fetchone()
                if pair_2new_exists is not None:
                    self.cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_2_id}")
                else:
                    self.cursor.execute(f"INSERT INTO Staff_RaceEngineerDriverAssignments VALUES ({engineer_1_id[0]}, {driver_2_id}, 0, 0, 1)")

        
            self.cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_2_id[0]}, PosInTeam = {position_2[0]} WHERE ContractType = 0 AND StaffID = {driver_1_id}")
            self.cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_1_id[0]}, PosInTeam = {position_1[0]} WHERE ContractType = 0 AND StaffID = {driver_2_id}")
            self.cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = {position_2[0]} WHERE StaffID = {driver_1_id}")
            self.cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = {position_1[0]} WHERE StaffID = {driver_2_id}")

        
        elif position_1[0] >= 3 and position_2[0] >= 3:
            # both reserves
            self.cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_2_id[0]} WHERE ContractType = 0 AND StaffID = {driver_1_id}")
            self.cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_1_id[0]} WHERE ContractType = 0 AND StaffID = {driver_2_id}")
        elif position_1[0] >= 3:
            # driver 1 reserve
            engineer_2_id = self.cursor.execute(f"SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = {driver_2_id}").fetchone()
            if engineer_2_id is not None:
                self.cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_2_id}")
                pair_1new_exists = self.cursor.execute(f"SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_1_id}").fetchone()
                if pair_1new_exists is not None:
                    self.cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = {engineer_2_id[0]} AND DriverID = {driver_1_id}")
                else:
                    self.cursor.execute(f"INSERT INTO Staff_RaceEngineerDriverAssignments VALUES ({engineer_2_id[0]}, {driver_1_id}, 0, 0, 1)")

            is_driving_in_f2 = self.cursor.execute(f"SELECT TeamID FROM Staff_Contracts WHERE StaffID = {driver_1_id} AND ContractType = 0 AND (TeamID > 10 AND  TeamID < 32)").fetchone()
            if is_driving_in_f2 is not None:
                self.cursor.execute(f"DELETE FROM Staff_Contracts WHERE StaffID = {driver_1_id} AND ContractType = 0 AND TeamID = {is_driving_in_f2[0]}")

            position_1in_standings = self.cursor.execute(f"SELECT MAX(Position) FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = {year[0]}").fetchone()
            points_driver1_in_standings = self.cursor.execute(f"SELECT Points FROM Races_DriverStandings WHERE RaceFormula = 1 AND DriverID = {driver_1_id} AND SeasonID = {year[0]}").fetchone()

            if points_driver1_in_standings is None:
                points_driver1_in_standings = (0,)
                self.cursor.execute(f"INSERT INTO Races_DriverStandings VALUES ({year[0]}, {driver_1_id}, {points_driver1_in_standings[0]}, {position_1in_standings[0] + 1}, 0, 0, 1)")

            self.cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_1_id[0]}, PosInTeam = {position_1[0]} WHERE ContractType = 0 AND StaffID = {driver_2_id} AND TeamID = {team_2_id[0]}")
            self.cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = {driver_2_id}")
            self.cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_2_id[0]}, PosInTeam = {position_2[0]} WHERE ContractType = 0 AND StaffID = {driver_1_id} AND TeamID = {team_1_id[0]}")
            self.cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = {position_2[0]} WHERE StaffID = {driver_1_id}")

        elif(position_2[0] >= 3):
            #driver 2 reserve
            engineer_1_id = self.cursor.execute(f"SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = {driver_1_id}").fetchone()
            if engineer_1_id is not None:
                self.cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_1_id}")

                pair_2new_exists = self.cursor.execute(f"SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_2_id}").fetchone()
                if pair_2new_exists is not None:
                    self.cursor.execute(f"UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE RaceEngineerID = {engineer_1_id[0]} AND DriverID = {driver_2_id}")
                else:
                    self.cursor.execute(f"INSERT INTO Staff_RaceEngineerDriverAssignments VALUES ({engineer_1_id[0]}, {driver_2_id}, 0, 0, 1)")

            is_driving_in_f2 = self.cursor.execute(f"SELECT TeamID FROM Staff_Contracts WHERE StaffID = {driver_2_id} AND ContractType = 0 AND (TeamID > 10 AND  TeamID < 32)").fetchone()
            if is_driving_in_f2 is not None:
                self.cursor.execute(f"DELETE FROM Staff_Contracts WHERE StaffID = {driver_2_id} AND ContractType = 0 AND TeamID = {is_driving_in_f2[0]}")

            #checks if the driver was in the standings and if it wasn't it updates the standings
            position_2in_standings = self.cursor.execute(f"SELECT MAX(Position) FROM Races_DriverStandings WHERE RaceFormula = 1 AND SeasonID = {year[0]}").fetchone()
            points_driver2_in_standings = self.cursor.execute(f"SELECT Points FROM Races_DriverStandings WHERE RaceFormula = 1 AND DriverID = {driver_2_id} AND SeasonID = {year[0]}").fetchone()

            if points_driver2_in_standings is None:
                points_driver2_in_standings = (0,)
                self.cursor.execute(f"INSERT INTO Races_DriverStandings VALUES ({year[0]}, {driver_2_id}, {points_driver2_in_standings[0]}, {position_2in_standings[0] + 1}, 0, 0, 1)")

            self.cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_2_id[0]}, PosInTeam = {position_2[0]} WHERE ContractType = 0 AND StaffID = {driver_1_id} AND TeamID = {team_1_id[0]}")
            self.cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = NULL WHERE StaffID = {driver_1_id}")
            self.cursor.execute(f"UPDATE Staff_Contracts SET TeamID = {team_1_id[0]}, PosInTeam = {position_1[0]} WHERE ContractType = 0 AND StaffID = {driver_2_id} AND TeamID = {team_2_id[0]}")
            self.cursor.execute(f"UPDATE Staff_DriverData SET AssignedCarNumber = {position_1[0]} WHERE StaffID = {driver_2_id}")

        self.conn.commit()
        self.conn.close()


    def edit_contract(self, driverID, salary, endSeason, startingBonus, raceBonus, raceBonusTargetPos):
        self.cursor.execute(f"UPDATE Staff_Contracts SET Salary = {salary}, EndSeason = {endSeason}, StartingBonus = {startingBonus}, RaceBonus = {raceBonus}, RaceBonusTargetPos = {raceBonusTargetPos} WHERE ContractType = 0 AND StaffID = {driverID}")


    def future_contract(self, teamID, driverID, salary, endSeason, startingBonus, raceBonus, raceBonusTargetPos, position, year_iteration="24"):
        print(teamID, driverID)
        if teamID == "-1":
            print("Deleting future contract")
            self.cursor.execute(f"DELETE FROM Staff_Contracts WHERE StaffID = {driverID} AND ContractType = 3")
        else:
            already_has_future_contract = self.cursor.execute(f"SELECT TeamID FROM Staff_Contracts WHERE StaffID = {driverID} AND ContractType = 3").fetchone()
            if already_has_future_contract is not None:
                already_has_future_contract = already_has_future_contract[0]
            else:
                already_has_future_contract = -1
            print(already_has_future_contract, teamID)
            if int(already_has_future_contract) != int(teamID):
                season = self.cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()[0]
                day = self.get_excel_date(int(season+1))
                self.cursor.execute(f"DELETE FROM Staff_Contracts WHERE StaffID = {driverID} AND ContractType = 3")
                if year_iteration == "24":
                    print("Creating new future contract")
                    print(day)
                    print(f"INSERT INTO Staff_Contracts VALUES ({driverID}, 3, {teamID}, {position}, {day}, {endSeason}, {salary}, {startingBonus}, {raceBonus}, {raceBonusTargetPos}, 0.5, 0)")
                    self.cursor.execute(f"INSERT INTO Staff_Contracts VALUES ({driverID}, 3, {teamID}, {position}, {day}, {endSeason}, {salary}, {startingBonus}, {raceBonus}, {raceBonusTargetPos}, 0.5, 0)")
            else:
                print("Updating future contract")
                self.cursor.execute(f"UPDATE Staff_Contracts SET PosInTeam = {position}, Salary = {salary}, EndSeason = {endSeason}, StartingBonus = {startingBonus}, RaceBonus = {raceBonus}, RaceBonusTargetPos = {raceBonusTargetPos} WHERE StaffID = {driverID} AND TeamID = {already_has_future_contract} AND ContractType = 3")


        self.conn.commit()
        self.conn.close()


    def get_excel_date(self, year):
        excel_start_date = datetime.datetime(1900, 1, 1)
        
        target_date = datetime.datetime(year, 1, 1)
        
        day = (target_date - excel_start_date).days + 2
        
        return day


    def unretire(self, driverID):
        self.cursor.execute(f"UPDATE Staff_GameData SET Retired = 0 WHERE StaffID = {driverID}")
        self.cursor.execute(f"UPDATE Staff_DriverData SET HasSuperLicense = 1 WHERE StaffID = {driverID}")

        self.conn.commit()
        self.conn.close()


    def get_tier(self, driverID):
        driver_stats = self.cursor.execute(f"SELECT Val FROM Staff_PerformanceStats WHERE StaffID = {driverID[0]}").fetchall()
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
        if(rating >= 89): tier = 1
        elif(rating >= 85): tier = 2
        elif(rating >= 80): tier = 3
        else: tier = 4

        return tier

    def get_driver_id(self, name):
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
            driver_id = self.cursor.execute(f"SELECT StaffID FROM Staff_BasicData WHERE LastName = '[StaffName_Surname_{driver}]'").fetchone()
        
        # print(name, driver_id)

        return driver_id