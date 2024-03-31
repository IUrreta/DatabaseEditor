import sqlite3
import decimal

partsType = [3,4,5,6,7,8]
buffs_dict = {
    "-10": -200, "-9": -180, "-8": -160, "-7": -140, "-6": -120, "-5": -100, "-4": -80, "-3": -60, "-2": -40, "-1": -20,
    "0": 0,
    "1": 20, "2": 40, "3": 60, "4": 80, "5": 100, "6": 120, "7": 140, "8": 160, "9": 180, "10": 200
}

def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    text = option.lower()
    params = text.split()

    team_id = params[0]
    buffs = params[1:7]
    #print(buffs)
    


    for i in range(len(partsType)):
        designs = cursor.execute(f"SELECT DesignID FROM Parts_Designs WHERE PartType = {partsType[i]} AND TeamID = {team_id}").fetchall()
        listDesigns = []
        doneExp = 0
        for j in designs:
            listDesigns.append(j[0])
        # print(listDesigns)

        for design in listDesigns:
            listStats = []
            stats = cursor.execute(f"SELECT PartStat FROM Parts_Designs_StatValues WHERE DesignID = {design}").fetchall()
            for stat in stats:
                if stat != (15,):
                    listStats.append(stat[0])
            # print(listStats)
            for k in listStats:
                if(k == 7 or k == 8 or k == 9):
                    ratio = 0.002
                else:
                    ratio = 0.1
                delta = buffs_dict[buffs[i]]
                deltaUnit = delta*ratio
                values = cursor.execute(f"SELECT Value, UnitValue FROM Parts_Designs_StatValues WHERE DesignID = {design} AND PartStat = {k}").fetchone()
                old_value = round(decimal.Decimal(values[0]), 10)
                old_valueUnit = round(decimal.Decimal(values[1]), 10)
                new_value = old_value + delta
                new_valueUnit = old_valueUnit + decimal.Decimal(deltaUnit)
                cursor.execute(f"UPDATE Parts_Designs_StatValues SET Value = {new_value}, UnitValue = {new_valueUnit} WHERE DesignID = {design} AND PartStat = {k}")
                #print("Old value for stat " + str(k) + " from design " + str(design) + ": [" + str(old_value) + ", " + str(old_valueUnit) + "], new values: [" + str(new_value) + ", " + str(new_valueUnit) + "]")
                if(doneExp < len(listStats)):
                    expertise_value = cursor.execute(f"SELECT Expertise FROM Parts_TeamExpertise WHERE PartType = {partsType[i]} AND PartStat = {k} AND TeamID = {team_id}").fetchone()
                    if expertise_value is None:
                        print("Done!")
                    else:
                        if(delta >= 0):
                            expertiseDelta = delta * round(decimal.Decimal(1.2), 10)
                        else:
                            expertiseDelta = delta
                        expertiseDelta
                        old_expertise = round(decimal.Decimal(expertise_value[0]), 10)
                        new_expertise = old_expertise + expertiseDelta
                        cursor.execute(f"UPDATE Parts_TeamExpertise SET Expertise = {new_expertise} WHERE PartType = {partsType[i]} AND PartStat = {k} AND TeamID = {team_id}")
                        #print("Old Expertise: " + str(old_expertise) + ", new expertise: " + str(new_expertise))   
                        doneExp += 1
   
    conn.commit()
    conn.close()


if __name__ == '__main__':
    run_script()