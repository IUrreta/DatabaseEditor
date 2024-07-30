import sqlite3
import random
from datetime import datetime, timedelta

driver_stats = [2, 3, 4, 5, 6, 7, 8, 9, 10]

mentality_areas = {
    0: [5, 11, 13, 9],
    1: [0, 2, 6, 7, 8, 14],
    2: [1, 3, 4, 12, 10]
}

mentality_events = {
    0: [1, 7, 10, 13, 15, 19],
    1: [2, 11, 12, 14, 16, 20, 21],
    2: [0, 3, 4, 5, 6, 8, 9, 17, 18]
}

mentaility_opinions = {
    0: 10,
    1: 3,
    2: 0,
    3: -4,
    4: -10
}

mentaility_overall = {
    0: 95,
    1: 75,
    2: 55,
    3: 35,
    4: 5
}



def edit_stats(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    text = option.lower()
    params = text.split()
    driver_id = (params[0],)
    type = params[1]
    print(params)

    if type == "0":
        is_stats = cursor.execute(f"SELECT * FROM Staff_performanceStats WHERE StaffID = {driver_id[0]}").fetchone()
        if is_stats is not None:
            cursor.execute(f"UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 2 THEN {params[2]} WHEN 3 THEN {params[3]} WHEN 4 THEN {params[4]} WHEN 5 THEN {params[5]} WHEN 6 THEN {params[6]} WHEN 7 THEN {params[7]} WHEN 8 THEN {params[8]} WHEN 9 THEN {params[9]} WHEN 10 THEN {params[10]} ELSE Val END WHERE StaffID = {driver_id[0]}")
        else:
            stats_array = params[2:11]
            for index, stat in enumerate(driver_stats):
                new_stat = stats_array[index]
                cursor.execute(f"INSERT INTO Staff_performanceStats (StaffID, StatID, Val, Max) VALUES ({driver_id[0]}, {stat}, {new_stat}, 100)")
        cursor.execute(f"UPDATE Staff_DriverData SET Improvability = {params[11]}, Aggression =  {params[12]} WHERE StaffID = {driver_id[0]}")
        cursor.execute(f"UPDATE Staff_GameData SET RetirementAge = {params[13]} WHERE StaffID = {driver_id[0]}")
        old_num = cursor.execute(f"SELECT Number FROM Staff_DriverNumbers WHERE CurrentHolder = {driver_id[0]}").fetchone()
        if old_num is not None:
            cursor.execute(f"UPDATE Staff_DriverNumbers SET CurrentHolder = NULL WHERE Number = {old_num[0]}")
        cursor.execute(f"UPDATE Staff_DriverNumbers SET CurrentHolder = {driver_id[0]} WHERE Number = {params[14]}")
        cursor.execute(f"UPDATE Staff_DriverData SET WantsChampionDriverNumber = {params[15]} WHERE StaffID = {driver_id[0]}")

    elif type == "1":
        cursor.execute(f"UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 0 THEN {params[2]} WHEN 1 THEN {params[3]} WHEN 14 THEN {params[4]} WHEN 15 THEN {params[5]} WHEN 16 THEN {params[6]} WHEN 17 THEN {params[7]} ELSE Val END WHERE StaffID = {driver_id[0]}")
        cursor.execute(f"UPDATE Staff_GameData SET RetirementAge = {params[-1]} WHERE StaffID = {driver_id[0]}")
    elif type == "2":
        cursor.execute(f"UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 13 THEN {params[2]} WHEN 25 THEN {params[3]} WHEN 43 THEN {params[4]} ELSE Val END WHERE StaffID = {driver_id[0]}")
        cursor.execute(f"UPDATE Staff_GameData SET RetirementAge = {params[-1]} WHERE StaffID = {driver_id[0]}")
    elif type == "3":
        cursor.execute(f"UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 19 THEN {params[2]} WHEN 20 THEN {params[3]} WHEN 26 THEN {params[4]} WHEN 27 THEN {params[5]} WHEN 28 THEN {params[6]} WHEN 29 THEN {params[7]} WHEN 30 THEN {params[8]} WHEN 31 THEN {params[9]} ELSE Val END WHERE StaffID = {driver_id[0]}")
        cursor.execute(f"UPDATE Staff_GameData SET RetirementAge = {params[-1]} WHERE StaffID = {driver_id[0]}")    
    elif type == "4":
        cursor.execute(f"UPDATE Staff_performanceStats SET Val = CASE StatID WHEN 11 THEN {params[2]} WHEN 22 THEN {params[3]} WHEN 23 THEN {params[4]} WHEN 24 THEN {params[5]} ELSE Val END WHERE StaffID = {driver_id[0]}")
        cursor.execute(f"UPDATE Staff_GameData SET RetirementAge = {params[-1]} WHERE StaffID = {driver_id[0]}")

    conn.commit()
    conn.close()

def edit_name(driverID, new_name):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    new_firstName = new_name.split()[0]
    new_lastName = " ".join(new_name.split()[1:])
    string_literal_firstName = f"[STRING_LITERAL:Value=|{new_firstName}|]"
    string_literal_lastName = f"[STRING_LITERAL:Value=|{new_lastName}|]"
    cursor.execute("UPDATE Staff_BasicData SET FirstName = ?, LastName = ? WHERE StaffID = ?", (string_literal_firstName, string_literal_lastName, driverID))

    conn.commit()
    conn.close()

def excel_date(date1):
    temp = datetime(1899, 12, 30)    
    delta = date1 - temp
    return delta.days + 1



def edit_age(driverID, age_gap):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    
    driver_birthdate = cursor.execute(f"SELECT DOB FROM Staff_BasicData WHERE StaffID = {driverID}").fetchone()[0]
    dob_iso, dob = change_years_in_excel_date(driver_birthdate, int(age_gap))
    date_string = dob_iso.strftime("%Y-%m-%d")
    cursor.execute(f"UPDATE Staff_BasicData SET DOB = {dob}, DOB_ISO = {date_string} WHERE StaffID = {driverID}")
    
    conn.commit()
    conn.close()

def excel_to_date(excel_date):
    base_date = datetime(1899, 12, 30)
    delta = timedelta(days=excel_date)
    actual_date = base_date + delta
    return actual_date

def date_to_excel(date):
    base_date = datetime(1899, 12, 30)
    delta = date - base_date
    return delta.days

def change_years_in_excel_date(excel_date, years):
    date = excel_to_date(excel_date)
    try:
        new_date = date.replace(year=date.year + years)
    except ValueError:
        new_date = date.replace(month=2, day=28, year=date.year + years)
    
    new_excel_date = date_to_excel(new_date)
    return new_date, new_excel_date
    


def edit_mentality(mentality):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()
    driver_id = mentality.split()[0]
    mentality = mentality.split()[1:]
    sum = 0
    for area, value in enumerate(mentality):
        cursor.execute(f"UPDATE Staff_Mentality_AreaOpinions SET Opinion = {value} WHERE StaffID = {driver_id} AND Category = {area}")
        statuses = mentality_areas[int(area)]
        events = mentality_events[int(area)]
        sum += int(value)
        for status in statuses:
            cursor.execute(f"UPDATE Staff_Mentality_Statuses SET Opinion = {value}, Value = {mentaility_opinions[int(value)]}  WHERE StaffID = {driver_id} AND Status = {status}")
        for event in events:
            cursor.execute(f"UPDATE Staff_Mentality_Events SET Opinion = {value}, Value = {mentaility_opinions[int(value)]} WHERE StaffID = {driver_id} AND Event = {event}")

    average = sum // 3
    cursor.execute(f"UPDATE Staff_State SET Mentality = {mentaility_overall[average]}, MentalityOpinion = {average} WHERE StaffID = {driver_id}")

    conn.commit()
    conn.close()

def edit_retirement(driverID, value):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    cursor.execute(f"UPDATE Staff_GameData SET Retired = {value} WHERE StaffID = {driverID}")

    conn.commit()
    conn.close()

def edit_superlicense(driverID, value):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    cursor.execute(f"UPDATE Staff_DriverData SET HasSuperLicense = {value}, HasRacedEnoughToJoinF1 = {value} WHERE StaffID = {driverID}")

    conn.commit()
    conn.close()


def edit_marketability(driverID, value):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    cursor.execute(f"UPDATE Staff_DriverData SET Marketability = {value} WHERE StaffID = {driverID}")

    conn.commit()
    conn.close()

if __name__ == '__main__':
    edit_stats()
