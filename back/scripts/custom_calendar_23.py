import sqlite3
import random



def run_script(option=""):
    conn = sqlite3.connect("../result/main.db")
    cursor = conn.cursor()

    weeks = [12,8,16,21,20,23,25,26,10,28,29,34,36,37,42,41,43,46,17,33,19,45,39]
    weather_dict = {"0": 1, "1":2, "2":4, "3":8, "4":16, "5":32}
    
    

    calendar = option.lower()
    races = calendar.split()
    race_blanks = 23 - len(races)
    
    random_blanks = []
    for i in range (0, race_blanks):
        n = random.randint(0,22)
        while(n in random_blanks):
            n = random.randint(0,22)
        random_blanks.append(n)

    for el in random_blanks:
        del weeks[el]
    
    weeks.sort()
    leap_year_count = 2
    day_season = cursor.execute("SELECT Day, CurrentSeason FROM Player_State").fetchone()
    year_diff = day_season[1] - 2023
    leap_year_count += year_diff
    day_start = 44927  + (year_diff*365) + (leap_year_count//4)
    day_of_week = day_start % 7
    days_until_sunday = (8 - day_of_week) % 7
    day_start = day_start + days_until_sunday
    last_race_last_season = cursor.execute("SELECT MAX(RaceID) FROM Races WHERE SeasonID = " + str(day_season[1] - 1)).fetchone()
    last_id = last_race_last_season[0]
    rain_tuple = (8, 16, 32)
    non_rain_tuple = (1,2,4)
    raceid = last_id

    #Deletion of previous race calendar
    cursor.execute("DELETE FROM Races WHERE State != 2 AND SeasonID = " + str(day_season[1]))

    for i, race in enumerate(races):
        state = race[-1]
        format = race[-2]
        rainR = weather_dict[race[-3]]
        rainRBool = 1 if float(rainR) >= 8 else 0
        rainQ = weather_dict[race[-4]]
        rainQBool = 1 if float(rainQ)  >= 8 else 0
        race_code = race[:-4]
        rain_chance = cursor.execute("SELECT RainMin FROM Races_Templates WHERE TrackID = " + str(race_code)).fetchone()
        rain_prob = rain_chance[0]
        rainPBool = 1 if random.random() < float(rain_prob) else 0
        if rainPBool == 1:
            rainP = random.choice(rain_tuple)
        else:
            rainP = random.choice(non_rain_tuple)
        temps = cursor.execute("SELECT TemperatureMin, TemperatureMax FROM Races_Templates WHERE TrackID = " + str(race_code)).fetchone()
        tempP = random.randint(int(temps[0]), int(temps[1]))
        tempQ = random.randint(int(temps[0]), int(temps[1]))
        tempR = random.randint(int(temps[0]), int(temps[1]))
        day = ((weeks[i]+1)*7) + day_start
        raceid += 1
        if state != "2":
            cursor.execute("INSERT INTO Races VALUES (" + str(raceid) + ", " + str(day_season[1]) + ", " + str(day) + ", " + str(race_code) + ", " + str(state) + ", " + str(rainPBool) + ", " + str(tempP) + ", " + str(rainP) + ", " + str(rainQBool) + ", " + str(tempQ) + ", " + str(rainQ) + ", " + str(rainRBool) + ", " + str(tempR) + ", " + str(rainR) + ", " + str(format) + ")")



    conn.commit()
    conn.close()


def get_description():
    return "Creates a custom calendar. Available options are: bah, sau, aus, imo, mia, bar, mon, bak, can, gbr, aut, fra, hun, bel, ned, ita, sin, jap, usa, mex, bra, uae.\nAuthor: u/ignaciourreta"

if __name__ == '__main__':
    run_script()