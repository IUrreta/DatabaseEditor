import sqlite3
import decimal

engines_ids = ["1", "4", "7", "10"]

engine_unitValueToValue = {
    6: lambda x: 20 * (x - 50),
    10: lambda x: 50 * (x - 80),
    11: lambda x: -50 * (x - 85),
    12: lambda x: (200 / 3) * (x - 70),
    14: lambda x: 50 * (x - 60),
    18: lambda x: 50 * (x - 50),
    19: lambda x: 50 * (x - 50),
}


def run_script(engineData):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    year = cursor.execute("SELECT CurrentSeason FROM Player_State").fetchone()


    for engine in engines_ids:
        stats = engineData[engine]
        manufacturer_id = cursor.execute(f"SELECT Value FROM Parts_Enum_EngineManufacturers WHERE EngineDesignID = {engine}").fetchone()
        print(f"SELECT TeamID FROM Parts_teamHistory WHERE SeasonID = {year[0]} AND EngineManufacturer = {manufacturer_id}")
        teams_powered = cursor.execute(f"SELECT TeamID FROM Parts_teamHistory WHERE SeasonID = {year[0]} AND EngineManufacturer = {manufacturer_id[0]}").fetchall()
        
        true_stats = {}
        for key, value in stats.items():
            true_stats[key] = engine_unitValueToValue[int(key)](float(value))

        for team in teams_powered:
            engines = cursor.execute(f"SELECT DesignID FROM Parts_Designs WHERE PartType = 0 AND TeamID = {team[0]}").fetchall()
            for engine in engines:
                for stat, value in true_stats.items():
                    cursor.execute(f"UPDATE Parts_Designs_StatValues SET Value = {value}, UnitValue = {stats[stat]} WHERE PartStat = {stat} AND DesignID = {engine[0]}")
            erss = cursor.execute(f"SELECT DesignID FROM Parts_Designs WHERE PartType = 1 AND TeamID = {team[0]}").fetchall()    
            for ers in erss:
                cursor.execute(f"UPDATE Parts_Designs_StatValues SET Value = {true_stats['18']}, UnitValue = {stats['18']} WHERE PartStat = 15 AND DesignID = {ers[0]}")
            gearboxes = cursor.execute(f"SELECT DesignID FROM Parts_Designs WHERE PartType = 2 AND TeamID = {team[0]}").fetchall()    
            for gearbox in gearboxes:
                cursor.execute(f"UPDATE Parts_Designs_StatValues SET Value = {true_stats['19']}, UnitValue = {stats['19']} WHERE PartStat = 15 AND DesignID = {gearbox[0]}")

    conn.commit()
    conn.close()
