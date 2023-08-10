import sqlite3
import decimal

def run_script(option=""):
    conn = sqlite3.connect("scripts/result/main.db")
    cursor = conn.cursor()
    
    text = option.lower()
    params = text.split()

    team = params[0]
    action = params[1]


    if "ferrari" in team: team_id = 1
    elif "mclaren" in team: team_id = 2
    elif "red bull" in team or "redbull" in option or "rb" in option: team_id = 3
    elif "merc" in team: team_id = 4
    elif "alpine" in team: team_id = 5
    elif "williams" in team: team_id = 6
    elif "haas" in team: team_id = 7
    elif "alphatauri" in team  or "at" in team: team_id = 8
    elif "alfa" in team or "romeo" in team or "alfaromeo" in team: team_id = 9
    elif "aston" in team or "martin" in team or "astonmartin" in team: team_id = 10
    else: team_id = -1
    
    if(action == "buff"):
        delta = 15
        expertiseDelta = 25
    elif(action == "buff+"):
        delta = 40
        expertiseDelta = 50
    elif(action == "buff++"):
        delta = 80
        expertiseDelta = 100
    elif(action == "nerf"):

        delta = -15
        expertiseDelta = -10
    elif(action == "nerf-"):
        delta = -40
        expertiseDelta = -30
    elif(action == "nerf--"):
        delta = -80
        expertiseDelta = -60
    
    


    for i in range(3, 9):
        doneExp = 0
        designs = cursor.execute("SELECT DesignNumber FROM Parts_Designs WHERE PartType = " + str(i) + " AND TeamID = " + str(team_id)).fetchall()
        listDesigns = []
        for j in designs:
            listDesigns.append(j[0])

        for design in listDesigns:
            design_id = cursor.execute("SELECT DesignID FROM Parts_Designs WHERE DesignNumber = " +  str(design) + " AND TeamID = " + str(team_id) + " AND PartType = " + str(i)).fetchone()
            stats = cursor.execute("SELECT PartStat FROM Parts_Designs_StatValues WHERE DesignID = " + str(design_id[0])).fetchall()
            
            listStats = []
            for j in stats:
                listStats.append(j[0])
            for k in listStats:
                if(k == 7 or k == 8 or k == 9):
                    ratio = 0.002
                else:
                    ratio = 0.1    
                #print(ratio)  
                deltaUnit = delta*ratio
                #updates values for the actual car parts
                values = cursor.execute("SELECT Value, UnitValue FROM Parts_Designs_StatValues WHERE DesignID = " + str(design_id[0]) + " AND PartStat = " + str(k)).fetchone()
                old_value = round(decimal.Decimal(values[0]), 10)
                old_valueUnit = round(decimal.Decimal(values[1]), 10)
                new_value = old_value + delta
                new_valueUnit = old_valueUnit + decimal.Decimal(deltaUnit)
                cursor.execute("UPDATE Parts_Designs_StatValues SET Value = " + str(new_value) + ", UnitValue = " + str(new_valueUnit) + " WHERE DesignID = " + str(design_id[0]) + " AND PartStat = " + str(k))
                print("Old value for stat " + str(k) + " from design " + str(design_id[0]) + ": [" + str(old_value) + ", " + str(old_valueUnit) + "], new values: [" + str(new_value) + ", " + str(new_valueUnit) + "]")

                #updates expertise for all stats of the car part
                if(doneExp < len(listStats)):
                    expertise_value = cursor.execute("SELECT Expertise FROM Parts_TeamExpertise WHERE PartType = " + str(i) + " AND PartStat = " + str(k) + " AND TeamID = " + str(team_id)).fetchone() 
                    if expertise_value is None:
                        print("Done!")
                    else:
                        old_expertise = round(decimal.Decimal(expertise_value[0]), 10)
                        new_expertise = old_expertise + expertiseDelta
                        cursor.execute("UPDATE Parts_TeamExpertise SET Expertise = " + str(new_expertise) + " WHERE PartType = " + str(i) + " AND PartStat = " + str(k) + " AND TeamID = " + str(team_id))
                        print("Old Expertise: " + str(old_expertise) + ", new expertise: " + str(new_expertise))
                        doneExp += 1    
    conn.commit()
    conn.close()

def get_description():
    return "Choose a new team to manage by typing its name as an argument.\nAuthor: Tahkare"

if __name__ == '__main__':
    run_script()