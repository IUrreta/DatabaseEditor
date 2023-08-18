import sqlite3
import decimal

engine_stats = [6,10,11,2,14]
values_minimum = [9, 9, 6.5, 7, 8.5]
values_relative = [1000, 1000, -500, 666.6, 666.6]

def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    text = option.lower()
    params = text.split()

    year =  cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()
    print(year)

    engine_id = params[0]
    teamEngine = params[1]
    values = params[2:7]
    values_percent = []

    for value in values:
        value = round(float(value)*10, 2)
        values_percent.append(value)

    print(values_percent)

    new_valuesList = []

    for i in range(len(values)):
        if i != 2:
            newValue = 0
        else:
            newValue = 1000
        dif = abs(float(values[i]) - float(values_minimum[i]))
        dif = round(dif, 3)
        delta = dif*values_relative[i]
        newValue += delta
        newValue = round(newValue)
        new_valuesList.append(newValue)


    teams_powered = cursor.execute("SELECT TeamID FROM Parts_teamHistory WHERE SeasonID = " + str(year[0]) + " AND EngineManufacturer = " + str(teamEngine)).fetchall()
    print(teams_powered)

    for team in teams_powered:
        engines = cursor.execute("SELECT DesignID FROM Parts_Designs WHERE PartType = 0 AND TeamID = " + str(team[0])).fetchall()
        for engine in engines:
            for i in range(len(engine_stats)):
                #print(engine, new_valuesList[i], values_percent[i], engine_stats[i])
                cursor.execute("UPDATE Parts_Designs_StatValues SET Value = ?, UnitValue = ? WHERE PartStat = ? AND DesignID = ?", (new_valuesList[i], values_percent[i], engine_stats[i], engine[0]))
            




    conn.commit()
    conn.close()