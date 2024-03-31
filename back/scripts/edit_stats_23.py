import sqlite3
import random

def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    text = option.lower()
    params = text.split()
    driver_id = (params[0],)
    type = params[1]

    if type == "0":
        cursor.execute(f"UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 2 THEN {params[2]} WHEN 3 THEN {params[3]} WHEN 4 THEN {params[4]} WHEN 5 THEN {params[5]} WHEN 6 THEN {params[6]} WHEN 7 THEN {params[7]} WHEN 8 THEN {params[8]} WHEN 9 THEN {params[9]} WHEN 10 THEN {params[10]} ELSE Val END WHERE StaffID = {driver_id[0]}")
        cursor.execute(f"UPDATE Staff_DriverData SET Improvability = {params[11]}, Aggression =  {params[12]} WHERE StaffID = {driver_id[0]}")
    elif type == "1":
        cursor.execute(f"UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 0 THEN {params[2]} WHEN 1 THEN {params[3]} WHEN 14 THEN {params[4]} WHEN 15 THEN {params[5]} WHEN 16 THEN {params[6]} WHEN 17 THEN {params[7]} ELSE Val END WHERE StaffID = {driver_id[0]}")
    elif type == "2":
        cursor.execute(f"UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 13 THEN {params[2]} WHEN 25 THEN {params[3]} WHEN 43 THEN {params[4]} ELSE Val END WHERE StaffID = {driver_id[0]}")
    elif type == "3":
        cursor.execute(f"UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 19 THEN {params[2]} WHEN 20 THEN {params[3]} WHEN 26 THEN {params[4]} WHEN 27 THEN {params[5]} WHEN 28 THEN {params[6]} WHEN 29 THEN {params[7]} WHEN 30 THEN {params[8]} WHEN 31 THEN {params[9]} ELSE Val END WHERE StaffID = {driver_id[0]}")
    elif type == "4":
        cursor.execute(f"UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 11 THEN {params[2]} WHEN 22 THEN {params[3]} WHEN 23 THEN {params[4]} WHEN 24 THEN {params[5]} ELSE Val END WHERE StaffID = {driver_id[0]}")

    conn.commit()
    conn.close()

if __name__ == '__main__':
    run_script()
