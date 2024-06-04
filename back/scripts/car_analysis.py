import sqlite3

def get_best_parts(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    teams = {}
    for i in range(1, 11):
        designs = {}
        for j in range (3, 9):
            designs[j] = cursor.execute(f"SELECT MAX(DesignID) FROM Parts_Designs WHERE PartType = {j} AND TeamID = {i}").fetchall()
        teams[i] = designs

    return teams

def get_stats_from_part(design_id):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    stats_values = cursor.execute(f"SELECT PartStat, UnitValue FROM Parts_Designs_StatValues WHERE DesignID = {design_id}").fetchall()
    #transform the list of tuples into a dictionary
    stats_values = dict(stats_values)
    return stats_values

if __name__ == '__main__':
    # dict = get_best_parts()
    # print(dict)
    print(get_stats_from_part(1467))
