import sqlite3
import random



def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    print("aaaaaaaaaaaaaaaaaa")

    text = option.lower()
    params = text.split()
    driver_id = (params[0],)
    print(driver_id)

    cursor.execute("UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 2 THEN " + str(params[1]) + " WHEN 3 THEN " + params[2] + " WHEN 4 THEN " + params[3] + " WHEN 5 THEN " + params[4] + " WHEN 6 THEN " + params[5] + " WHEN 7 THEN " + params[6] + " WHEN 8 THEN " + params[7] + " WHEN 9 THEN " + params[8] + " WHEN 10 THEN " + params[9] + " ELSE Val END WHERE StaffID = " + str(driver_id[0]))

    
    conn.commit()
    conn.close()


def get_description():
    return "Allows you to edit the ratings of each individual aspect of every driver in the game. \n More info on how to use in the stats_readme.txt  \nAuthor: u/ignaciourreta"

if __name__ == '__main__':
    run_script()