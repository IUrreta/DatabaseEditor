import sqlite3
import random



def run_script(option=""):
    conn = sqlite3.connect("scripts/result/main.db")
    cursor = conn.cursor()

    text = option.lower()
    params = text.split()

    if(params[0] != "improvability"):   
        driver = params[0].capitalize()
        multiple_drivers = ["Perez", "Raikkonen", "Hulkenberg", "Toth", "Stanek", "Villagomez", "Bolukbasi", "Marti"]
        for i in range(len(multiple_drivers)):
            if(driver == multiple_drivers[i]):
                driver = driver + "1"
        if(driver == "Aleclerc"):
            driver_id = (132,)
        elif(driver == "Dschumacher"):
            driver_id = (270,)
        elif(driver == "Devries"):
            driver_id = (76,)     
        else:
            driver_id = cursor.execute('SELECT StaffID FROM Staff_BasicData WHERE LastName = "[StaffName_Surname_' + str(driver) + ']"').fetchone();

        if(params[1] != "all" and params[1] != "aggression" and params[1] != "growth"):
            stat_id = cursor.execute("SELECT Value FROM Staff_Enum_PerformanceStatTypes WHERE Name = " + '"' + params[1].capitalize() + '"').fetchone()
            if(params[2] == "++"):
                ability = cursor.execute("SELECT Val FROM Staff_performanceStats WHERE StatID = " + str(stat_id[0]) + " AND StaffID = " + str(driver_id[0])).fetchone()
                cursor.execute("UPDATE Staff_PerformanceStats SET Val = " + str(ability[0]+5) + " WHERE StatID = " + str(stat_id[0]) + " AND StaffID = " + str(driver_id[0]))
            elif(params[2] == "+"):
                ability = cursor.execute("SELECT Val FROM Staff_performanceStats WHERE StatID = " + str(stat_id[0]) + " AND StaffID = " + str(driver_id[0])).fetchone()
                cursor.execute("UPDATE Staff_PerformanceStats SET Val = " + str(ability[0]+2) + " WHERE StatID = " + str(stat_id[0]) + " AND StaffID = " + str(driver_id[0]))
            elif(params[2] == "-"):
                ability = cursor.execute("SELECT Val FROM Staff_performanceStats WHERE StatID = " + str(stat_id[0]) + " AND StaffID = " + str(driver_id[0])).fetchone()
                cursor.execute("UPDATE Staff_PerformanceStats SET Val = " + str(ability[0]-2) + " WHERE StatID = " + str(stat_id[0]) + " AND StaffID = " + str(driver_id[0]))
            elif(params[2] == "--"):
                ability = cursor.execute("SELECT Val FROM Staff_performanceStats WHERE StatID = " + str(stat_id[0]) + " AND StaffID = " + str(driver_id[0])).fetchone()
                cursor.execute("UPDATE Staff_PerformanceStats SET Val = " + str(ability[0]-5) + " WHERE StatID = " + str(stat_id[0]) + " AND StaffID = " + str(driver_id[0]))
            else:
                cursor.execute("UPDATE Staff_PerformanceStats SET Val = " + params[2] + " WHERE StatID = " + str(stat_id[0]) +  " AND StaffID = " +   str(driver_id[0]))
        elif(params[1] == "aggression"):
            if(params[2] == "high"):
                cursor.execute("UPDATE Staff_DriverData SET Aggression = 85 WHERE StaffID = " + str(driver_id[0]))
            elif(params[2] == "medium"):
                cursor.execute("UPDATE Staff_DriverData SET Aggression = 50 WHERE StaffID = " + str(driver_id[0]))
            elif(params[2] == "low"):
                cursor.execute("UPDATE Staff_DriverData SET Aggression = 20 WHERE StaffID = " + str(driver_id[0]))
            else:   
                cursor.execute("UPDATE Staff_DriverData SET Aggression = " + params[2] + " WHERE StaffID = " + str(driver_id[0]))
        elif(params[1] == "growth"):
            if(params[2] == "high"):
                cursor.execute("UPDATE Staff_DriverData SET Improvability = 85 WHERE StaffID = " + str(driver_id[0]))
            elif(params[2] == "medium"):
                cursor.execute("UPDATE Staff_DriverData SET Improvability = 50 WHERE StaffID = " + str(driver_id[0]))
            elif(params[2] == "low"):
                cursor.execute("UPDATE Staff_DriverData SET Improvability = 20 WHERE StaffID = " + str(driver_id[0]))
            else:   
                cursor.execute("UPDATE Staff_DriverData SET Aggression = " + params[2] + " WHERE StaffID = " + str(driver_id[0]))
        elif(params[1] == "all"):
            if(params[2] == "++"):
                for i in range (2, 11):
                    ability = cursor.execute("SELECT Val FROM  Staff_PerformanceStats  WHERE StatID = " + str(i) + " AND StaffID = " + str(driver_id[0])).fetchone()
                    cursor.execute("UPDATE Staff_PerformanceStats SET Val = " + str(ability[0]+5) + " WHERE StatID = " + str(i) + " AND StaffID = " + str(driver_id[0]))
            elif(params[2] == "+"):
                for i in range (2, 11):
                    ability = cursor.execute("SELECT Val FROM  Staff_PerformanceStats  WHERE StatID = " + str(i) + " AND StaffID = " + str(driver_id[0])).fetchone()
                    cursor.execute("UPDATE Staff_PerformanceStats SET Val = " + str(ability[0]+2) + " WHERE StatID = " + str(i) + " AND StaffID = " + str(driver_id[0]))
            elif(params[2] == "-"):
                for i in range (2, 11):
                    ability = cursor.execute("SELECT Val FROM  Staff_PerformanceStats  WHERE StatID = " + str(i) + " AND StaffID = " + str(driver_id[0])).fetchone()
                    cursor.execute("UPDATE Staff_PerformanceStats SET Val = " + str(ability[0]-2) + " WHERE StatID = " + str(i) + " AND StaffID = " + str(driver_id[0]))
            elif(params[2] == "--"):
                for i in range (2, 11):
                    ability = cursor.execute("SELECT Val FROM  Staff_PerformanceStats  WHERE StatID = " + str(i) + " AND StaffID = " + str(driver_id[0])).fetchone()
                    cursor.execute("UPDATE Staff_PerformanceStats SET Val = " + str(ability[0]-5) + " WHERE StatID = " + str(i) + " AND StaffID = " + str(driver_id[0]))
            else:
                for i in range (2, 11):
                    cursor.execute("UPDATE Staff_PerformanceStats SET Val = " + params[2] + " WHERE StatID = " + str(i) + " AND StaffID = " + str(driver_id[0]))
    else:
        if(params[1] == "standard"):
            cursor.execute("UPDATE Staff_XP_Constants SET ImprovabilityModMax = 2")
        elif(params[1] == "standard+"):
            cursor.execute("UPDATE Staff_XP_Constants SET ImprovabilityModMax = 2.75")
        elif(params[1] == "standard++"):
            cursor.execute("UPDATE Staff_XP_Constants SET ImprovabilityModMax = 3.25")
        else:   
            cursor.execute("UPDATE Staff_XP_Constants SET ImprovabilityModMax = " + params[1])




    conn.commit()
    conn.close()


def get_description():
    return "Allows you to edit the ratings of each individual aspect of every driver in the game. \n More info on how to use in the stats_readme.txt  \nAuthor: u/ignaciourreta"

if __name__ == '__main__':
    run_script()