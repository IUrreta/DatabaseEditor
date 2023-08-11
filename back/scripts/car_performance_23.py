import sqlite3
import decimal

partsType = [3,4,5,6,7,8]
buffs_dict = {
    "-10": -50, "-9": -45, "-8": -40, "-7": -35, "-6": -30, "-5": -25, "-4": -20, "-3": -15, "-2": -10, "-1": -5, 
    "0": 0,
    "1": 5, "2": 10, "3": 15, "4": 20, "5": 25, "6": 30, "7": 35, "8": 40, "9": 45, "10": 50
}

def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    text = option.lower()
    params = text.split()

    team_id = params[0]
    buffs = params[1:7]
    print(buffs)
    


    for i in range(len(partsType)):
        designs = cursor.execute("SELECT DesignID FROM Parts_Designs WHERE PartType = " + str(partsType[i]) + " AND TeamID = " + team_id).fetchall()
        listDesigns = []
        for j in designs:
            listDesigns.append(j[0])
        # print(listDesigns)

        for design in listDesigns:
            listStats = []
            stats = cursor.execute("SELECT PartStat FROM Parts_Designs_StatValues WHERE DesignID = " + str(design)).fetchall()
            for stat in stats:
                if stat != (15,):
                    listStats.append(stat[0])
            # print(listStats)
            for k in listStats:
                if(k == 7 or k == 8 or k == 9):
                    ratio = 0.002
                else:
                    ratio = 0.1
                print("AAAAAAAAAAA")
                delta = buffs_dict[buffs[i]]
                deltaUnit = delta*ratio
                print(delta)
                values = cursor.execute("SELECT Value, UnitValue FROM Parts_Designs_StatValues WHERE DesignID = " + str(design) + " AND PartStat = " + str(k)).fetchone()
                old_value = round(decimal.Decimal(values[0]), 10)
                old_valueUnit = round(decimal.Decimal(values[1]), 10)
                new_value = old_value + delta
                new_valueUnit = old_valueUnit + decimal.Decimal(deltaUnit)
                cursor.execute("UPDATE Parts_Designs_StatValues SET Value = " + str(new_value) + ", UnitValue = " + str(new_valueUnit) + " WHERE DesignID = " + str(design) + " AND PartStat = " + str(k))
                print("Old value for stat " + str(k) + " from design " + str(design) + ": [" + str(old_value) + ", " + str(old_valueUnit) + "], new values: [" + str(new_value) + ", " + str(new_valueUnit) + "]")



    
    # if(action == "buff"):
    #     delta = 15
    #     expertiseDelta = 25
    # elif(action == "buff+"):
    #     delta = 40
    #     expertiseDelta = 50
    # elif(action == "buff++"):
    #     delta = 80
    #     expertiseDelta = 100
    # elif(action == "nerf"):

    #     delta = -15
    #     expertiseDelta = -10
    # elif(action == "nerf-"):
    #     delta = -40
    #     expertiseDelta = -30
    # elif(action == "nerf--"):
    #     delta = -80
    #     expertiseDelta = -60
    
    


    # for i in range(3, 9):
    #     doneExp = 0
    #     designs = cursor.execute("SELECT DesignNumber FROM Parts_Designs WHERE PartType = " + str(i) + " AND TeamID = " + str(team_id)).fetchall()
    #     listDesigns = []
    #     for j in designs:
    #         listDesigns.append(j[0])

    #     for design in listDesigns:
    #         design_id = cursor.execute("SELECT DesignID FROM Parts_Designs WHERE DesignNumber = " +  str(design) + " AND TeamID = " + str(team_id) + " AND PartType = " + str(i)).fetchone()
    #         stats = cursor.execute("SELECT PartStat FROM Parts_Designs_StatValues WHERE DesignID = " + str(design_id[0])).fetchall()
            
    #         listStats = []
    #         for j in stats:
    #             listStats.append(j[0])
    #         for k in listStats:
    #             if(k == 7 or k == 8 or k == 9):
    #                 ratio = 0.002
    #             else:
    #                 ratio = 0.1    
    #             #print(ratio)  
    #             deltaUnit = delta*ratio
    #             #updates values for the actual car parts
    #             values = cursor.execute("SELECT Value, UnitValue FROM Parts_Designs_StatValues WHERE DesignID = " + str(design_id[0]) + " AND PartStat = " + str(k)).fetchone()
    #             old_value = round(decimal.Decimal(values[0]), 10)
    #             old_valueUnit = round(decimal.Decimal(values[1]), 10)
    #             new_value = old_value + delta
    #             new_valueUnit = old_valueUnit + decimal.Decimal(deltaUnit)
    #             cursor.execute("UPDATE Parts_Designs_StatValues SET Value = " + str(new_value) + ", UnitValue = " + str(new_valueUnit) + " WHERE DesignID = " + str(design_id[0]) + " AND PartStat = " + str(k))
    #             print("Old value for stat " + str(k) + " from design " + str(design_id[0]) + ": [" + str(old_value) + ", " + str(old_valueUnit) + "], new values: [" + str(new_value) + ", " + str(new_valueUnit) + "]")

    #             #updates expertise for all stats of the car part
    #             if(doneExp < len(listStats)):
    #                 expertise_value = cursor.execute("SELECT Expertise FROM Parts_TeamExpertise WHERE PartType = " + str(i) + " AND PartStat = " + str(k) + " AND TeamID = " + str(team_id)).fetchone() 
    #                 if expertise_value is None:
    #                     print("Done!")
    #                 else:
    #                     old_expertise = round(decimal.Decimal(expertise_value[0]), 10)
    #                     new_expertise = old_expertise + expertiseDelta
    #                     cursor.execute("UPDATE Parts_TeamExpertise SET Expertise = " + str(new_expertise) + " WHERE PartType = " + str(i) + " AND PartStat = " + str(k) + " AND TeamID = " + str(team_id))
    #                     print("Old Expertise: " + str(old_expertise) + ", new expertise: " + str(new_expertise))
    #                     doneExp += 1    
    conn.commit()
    conn.close()

def get_description():
    return "Choose a new team to manage by typing its name as an argument.\nAuthor: Tahkare"

if __name__ == '__main__':
    run_script()