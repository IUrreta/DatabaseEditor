import sqlite3
import decimal

engine_stats = [6, 10, 11, 12, 14]
values_minimum = [9, 9, 6.5, 7, 8.5, 4, 4]
values_relative = [1000, 1000, -500, 666.6, 666.6, 333.3, 333.3]

def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    text = option.lower()
    params = text.split()

    year = cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()

    engine_id = params[0]
    teamEngine = params[1]
    values = params[2:9]
    values_percent = []

    for value in values:
        value = round(float(value) * 10, 2)
        values_percent.append(value)

    new_valuesList = []

    for i in range(len(values)):
        if i != 2:
            newValue = 0
        else:
            newValue = 1000
        dif = float(values[i]) - float(values_minimum[i])
        dif = round(dif, 3)
        delta = dif * values_relative[i]
        newValue += delta
        newValue = round(newValue)
        new_valuesList.append(newValue)

    teams_powered = cursor.execute(f"SELECT TeamID FROM Parts_teamHistory WHERE SeasonID = {year[0]} AND EngineManufacturer = {teamEngine}").fetchall()

    for team in teams_powered:
        engines = cursor.execute(f"SELECT DesignID FROM Parts_Designs WHERE PartType = 0 AND TeamID = {team[0]}").fetchall()
        for engine in engines:
            for i in range(len(engine_stats)):
                cursor.execute("UPDATE Parts_Designs_StatValues SET Value = ?, UnitValue = ? WHERE PartStat = ? AND DesignID = ?", (new_valuesList[i], values_percent[i], engine_stats[i], engine[0]))
        erss = cursor.execute(f"SELECT DesignID FROM Parts_Designs WHERE PartType = 1 AND TeamID = {team[0]}").fetchall()    
        for ers in erss:
            cursor.execute("UPDATE Parts_Designs_StatValues SET Value = ?, UnitValue = ? WHERE PartStat = 15 AND DesignID = ?", (new_valuesList[5], values_percent[5], ers[0]))
        gearboxes = cursor.execute(f"SELECT DesignID FROM Parts_Designs WHERE PartType = 2 AND TeamID = {team[0]}").fetchall()    
        for gearbox in gearboxes:
            cursor.execute("UPDATE Parts_Designs_StatValues SET Value = ?, UnitValue = ? WHERE PartStat = 15 AND DesignID = ?", (new_valuesList[6], values_percent[6], gearbox[0]))

    conn.commit()
    conn.close()
